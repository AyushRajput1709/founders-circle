const Claim = require("../models/Claim");
const Deal = require("../models/Deal");

const claimDeal = async (req, res) => {
  try {
    const { dealId } = req.params;

    const deal = await Deal.findById(dealId);
    if (!deal || !deal.isActive) {
      return res.status(404).json({ message: "Deal not found." });
    }

    if (deal.accessLevel === "locked" && !req.user.verified) {
      return res.status(403).json({
        message: "Verification required to claim this deal.",
      });
    }

    const existing = await Claim.findOne({
      user: req.user._id,
      deal: deal._id,
    });
    if (existing) {
      return res.status(409).json({ message: "Deal already claimed." });
    }

    const claim = await Claim.create({ user: req.user._id, deal: deal._id });
    return res.status(201).json({ claim });
  } catch (error) {
    return res.status(500).json({ message: "Unable to claim deal." });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ user: req.user._id })
      .populate("deal")
      .sort({ createdAt: -1 });

    return res.status(200).json({ claims });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch claims." });
  }
};

module.exports = { claimDeal, getMyClaims };
