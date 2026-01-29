const express = require("express");
const { claimDeal, getMyClaims } = require("../controllers/claimController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth, getMyClaims);
router.post("/:dealId", auth, claimDeal);

module.exports = router;
