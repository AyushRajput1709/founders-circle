const User = require("../models/User");
const Deal = require("../models/Deal");
const Claim = require("../models/Claim");

// Get all pending companies (unverified startups)
const getPendingCompanies = async (req, res) => {
  try {
    const pendingUsers = await User.find({ verified: false, role: "founder" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch pending companies",
        error: error.message,
      });
  }
};

// Get all verified companies
const getVerifiedCompanies = async (req, res) => {
  try {
    const verifiedUsers = await User.find({ verified: true, role: "founder" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: verifiedUsers.length,
      users: verifiedUsers,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch verified companies",
        error: error.message,
      });
  }
};

// Verify a startup/company
const verifyCompany = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { verified: true },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `${user.company || user.name} has been verified`,
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify company", error: error.message });
  }
};

// Reject/delete a startup
const rejectCompany = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user and their claims
    await Claim.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: `${user.company || user.name} has been rejected${reason ? ": " + reason : ""}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to reject company", error: error.message });
  }
};

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalStartups = await User.countDocuments({ role: "founder" });
    const verifiedStartups = await User.countDocuments({
      verified: true,
      role: "founder",
    });
    const pendingStartups = await User.countDocuments({
      verified: false,
      role: "founder",
    });
    const totalDeals = await Deal.countDocuments();
    const totalClaims = await Claim.countDocuments();

    res.status(200).json({
      stats: {
        totalStartups,
        verifiedStartups,
        pendingStartups,
        totalDeals,
        totalClaims,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch dashboard stats",
        error: error.message,
      });
  }
};

// Get all deals
const getDeals = async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 });
    res.status(200).json({
      count: deals.length,
      deals,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch deals", error: error.message });
  }
};

// Create a new deal
const createDeal = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      partnerName,
      category,
      accessLevel,
      perks,
      ctaText,
    } = req.body;

    if (!title || !slug || !description || !partnerName || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newDeal = await Deal.create({
      title,
      slug,
      description,
      partnerName,
      partnerLogoUrl:
        req.body.partnerLogoUrl ||
        "https://dummyimage.com/160x80/111827/ffffff&text=Partner",
      category,
      accessLevel: accessLevel || "public",
      eligibility: req.body.eligibility || "Open to all early-stage teams.",
      perks: perks || [],
      ctaText: ctaText || "Claim deal",
      claimInstructions:
        req.body.claimInstructions || "Share your startup email to redeem.",
    });

    res.status(201).json({
      message: "Deal created successfully",
      deal: newDeal,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create deal", error: error.message });
  }
};

// Update a deal
const updateDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const updates = req.body;

    const deal = await Deal.findByIdAndUpdate(dealId, updates, { new: true });

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.status(200).json({
      message: "Deal updated successfully",
      deal,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update deal", error: error.message });
  }
};

// Delete a deal
const deleteDeal = async (req, res) => {
  try {
    const { dealId } = req.params;

    const deal = await Deal.findByIdAndDelete(dealId);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Also delete all claims for this deal
    await Claim.deleteMany({ deal: dealId });

    res.status(200).json({
      message: `Deal "${deal.title}" has been deleted`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete deal", error: error.message });
  }
};

// Get analytics data for charts
const getAnalytics = async (req, res) => {
  try {
    // User growth over last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: last7Days }, role: "founder" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Claims over last 7 days
    const claimsGrowth = await Claim.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Most popular deals (by claim count)
    const popularDeals = await Claim.aggregate([
      {
        $group: {
          _id: "$deal",
          claimCount: { $sum: 1 },
        },
      },
      { $sort: { claimCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "deals",
          localField: "_id",
          foreignField: "_id",
          as: "dealInfo",
        },
      },
      { $unwind: "$dealInfo" },
      {
        $project: {
          dealTitle: "$dealInfo.title",
          claimCount: 1,
          category: "$dealInfo.category",
        },
      },
    ]);

    // Deal performance by category
    const categoryStats = await Deal.aggregate([
      {
        $lookup: {
          from: "claims",
          localField: "_id",
          foreignField: "deal",
          as: "claims",
        },
      },
      {
        $group: {
          _id: "$category",
          totalDeals: { $sum: 1 },
          totalClaims: { $sum: { $size: "$claims" } },
        },
      },
      {
        $project: {
          category: "$_id",
          totalDeals: 1,
          totalClaims: 1,
          avgClaimsPerDeal: {
            $cond: [
              { $eq: ["$totalDeals", 0] },
              0,
              { $divide: ["$totalClaims", "$totalDeals"] },
            ],
          },
        },
      },
    ]);

    res.status(200).json({
      userGrowth,
      claimsGrowth,
      popularDeals,
      categoryStats,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
};

// Get recent activity feed
const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get recent users
    const recentUsers = await User.find({ role: "founder" })
      .select("name email company createdAt verified")
      .sort({ createdAt: -1 })
      .limit(limit / 2);

    // Get recent claims
    const recentClaims = await Claim.find()
      .populate("user", "name email company")
      .populate("deal", "title category")
      .sort({ createdAt: -1 })
      .limit(limit / 2);

    // Combine and format activities
    const activities = [
      ...recentUsers.map((user) => ({
        type: "registration",
        user: { name: user.name, email: user.email, company: user.company },
        verified: user.verified,
        timestamp: user.createdAt,
      })),
      ...recentClaims.map((claim) => ({
        type: "claim",
        user: {
          name: claim.user?.name,
          email: claim.user?.email,
          company: claim.user?.company,
        },
        deal: { title: claim.deal?.title, category: claim.deal?.category },
        status: claim.status,
        timestamp: claim.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      activities: activities.slice(0, limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activity", error: error.message });
  }
};

// Bulk verify companies
const bulkVerifyCompanies = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds }, role: "founder" },
      { verified: true },
    );

    res.status(200).json({
      message: `${result.modifiedCount} companies verified successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to bulk verify", error: error.message });
  }
};

// Export data to CSV format
const exportData = async (req, res) => {
  try {
    const { type } = req.query; // 'users' or 'deals' or 'claims'

    let data;
    let csvContent = "";

    if (type === "users") {
      data = await User.find({ role: "founder" })
        .select("name email company verified createdAt")
        .lean();
      csvContent =
        "Name,Email,Company,Verified,Registered Date\n" +
        data
          .map(
            (u) =>
              `"${u.name}","${u.email}","${u.company || ""}",${u.verified},${new Date(u.createdAt).toLocaleDateString()}`,
          )
          .join("\n");
    } else if (type === "deals") {
      data = await Deal.find().lean();
      csvContent =
        "Title,Category,Access Level,Partner,Created Date\n" +
        data
          .map(
            (d) =>
              `"${d.title}","${d.category}","${d.accessLevel}","${d.partnerName}",${new Date(d.createdAt).toLocaleDateString()}`,
          )
          .join("\n");
    } else if (type === "claims") {
      data = await Claim.find()
        .populate("user", "name email company")
        .populate("deal", "title category")
        .lean();
      csvContent =
        "User Name,User Email,Deal Title,Deal Category,Status,Claimed Date\n" +
        data
          .map(
            (c) =>
              `"${c.user?.name}","${c.user?.email}","${c.deal?.title}","${c.deal?.category}","${c.status}",${new Date(c.createdAt).toLocaleDateString()}`,
          )
          .join("\n");
    } else {
      return res.status(400).json({ message: "Invalid export type" });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${type}-export.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: "Failed to export data", error: error.message });
  }
};

module.exports = {
  getPendingCompanies,
  getVerifiedCompanies,
  verifyCompany,
  rejectCompany,
  getDashboardStats,
  getDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  getAnalytics,
  getRecentActivity,
  bulkVerifyCompanies,
  exportData,
};
