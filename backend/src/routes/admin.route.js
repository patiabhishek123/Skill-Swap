import express from "express";
import {
  getAllUsers,
  toggleUserStatus,
  getAllSwaps,
  getPlatformStats,
  moderateSkill,
  sendPlatformMessage,
  generateReport,
} from "../controllers/admin.controller.js";
import { verifyToken, requireAdmin } from "../middleware/verifytoken.js";

const adminRouter = express.Router();

// All admin routes require authentication and admin role
adminRouter.use(verifyToken);
adminRouter.use(requireAdmin);

// User management
adminRouter.get("/users", getAllUsers);
adminRouter.patch("/users/:userId/status", toggleUserStatus);

// Swap management
adminRouter.get("/swaps", getAllSwaps);

// Platform statistics
adminRouter.get("/stats", getPlatformStats);

// Content moderation
adminRouter.post("/moderate/skill", moderateSkill);

// Platform messaging
adminRouter.post("/message", sendPlatformMessage);

// Reports
adminRouter.get("/reports", generateReport);

export default adminRouter;
