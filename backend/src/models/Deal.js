const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    partnerName: { type: String, required: true },
    partnerLogoUrl: { type: String, default: "" },
    category: { type: String, required: true, index: true },
    accessLevel: {
      type: String,
      enum: ["public", "locked"],
      default: "public",
      index: true,
    },
    eligibility: { type: String, default: "" },
    perks: { type: [String], default: [] },
    ctaText: { type: String, default: "Claim deal" },
    claimInstructions: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deal", dealSchema);
