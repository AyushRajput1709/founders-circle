const express = require("express");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// Admin routes (protected - requires admin role)
router.get(
  "/dashboard/stats",
  auth,
  isAdmin,
  adminController.getDashboardStats,
);
router.get(
  "/companies/pending",
  auth,
  isAdmin,
  adminController.getPendingCompanies,
);
router.get(
  "/companies/verified",
  auth,
  isAdmin,
  adminController.getVerifiedCompanies,
);
router.patch(
  "/companies/:userId/verify",
  auth,
  isAdmin,
  adminController.verifyCompany,
);
router.delete(
  "/companies/:userId/reject",
  auth,
  isAdmin,
  adminController.rejectCompany,
);

router.get("/deals", auth, isAdmin, adminController.getDeals);
router.post("/deals", auth, isAdmin, adminController.createDeal);
router.patch("/deals/:dealId", auth, isAdmin, adminController.updateDeal);
router.delete("/deals/:dealId", auth, isAdmin, adminController.deleteDeal);

module.exports = router;
