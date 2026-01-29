const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

claimSchema.index({ user: 1, deal: 1 }, { unique: true });

module.exports = mongoose.model("Claim", claimSchema);
