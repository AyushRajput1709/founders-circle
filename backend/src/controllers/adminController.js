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
};
