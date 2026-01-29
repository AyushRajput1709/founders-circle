const Deal = require("../models/Deal");

const getDeals = async (req, res) => {
  try {
    const { category, accessLevel, search } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (accessLevel) {
      filter.accessLevel = accessLevel;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: regex },
        { partnerName: regex },
        { description: regex },
      ];
    }

    const deals = await Deal.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ deals });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch deals." });
  }
};

const getDealBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const deal = await Deal.findOne({ slug, isActive: true });
    if (!deal) {
      return res.status(404).json({ message: "Deal not found." });
    }

    return res.status(200).json({ deal });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch deal." });
  }
};

module.exports = { getDeals, getDealBySlug };
