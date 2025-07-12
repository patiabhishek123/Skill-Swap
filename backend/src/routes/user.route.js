import express from "express";
import {
  onSignup,
  onLogin,
  onLogout,
  verifyToken as verifyAuthToken,
} from "../controllers/auth.controller.js";
import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  getUserSkills,
  addSkillOffered,
  addSkillWanted,
  removeSkillOffered,
  removeSkillWanted,
  getUserStats,
} from "../controllers/user.controller.js";
import { verifyToken, optionalAuth } from "../middleware/verifytoken.js";

const userRouter = express.Router();

// Authentication routes (no auth required)
userRouter.post("/signup", onSignup);
userRouter.post("/login", onLogin);
userRouter.post("/logout", onLogout);
userRouter.get("/verify", verifyToken, verifyAuthToken);

// User profile routes
userRouter.get("/search", optionalAuth, searchUsers);
userRouter.get("/:userId", optionalAuth, getUserProfile);
userRouter.get("/:userId/skills", getUserSkills);
userRouter.get("/:userId/stats", getUserStats);

// Protected routes (authentication required)
userRouter.use(verifyToken);

userRouter.put("/profile", updateUserProfile);
userRouter.post("/skills/offered", addSkillOffered);
userRouter.post("/skills/wanted", addSkillWanted);
userRouter.delete("/skills/offered/:skillId", removeSkillOffered);
userRouter.delete("/skills/wanted/:skillId", removeSkillWanted);

export default userRouter;
