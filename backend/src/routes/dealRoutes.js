const express = require("express");
const { getDeals, getDealBySlug } = require("../controllers/dealController");

const router = express.Router();

router.get("/", getDeals);
router.get("/:slug", getDealBySlug);

module.exports = router;
