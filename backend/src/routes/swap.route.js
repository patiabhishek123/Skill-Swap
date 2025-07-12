import express from "express";
import {
  createSwapRequest,
  getUserSwapRequests,
  updateSwapStatus,
  deleteSwapRequest,
  addSwapFeedback,
} from "../controllers/swap.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";

const swapRouter = express.Router();

// All swap routes require authentication
swapRouter.use(verifyToken);

// Create a new swap request
swapRouter.post("/", createSwapRequest);

// Get user's swap requests
swapRouter.get("/", getUserSwapRequests);

// Update swap status (accept/reject)
swapRouter.patch("/:swapId/status", updateSwapStatus);

// Delete a pending swap request
swapRouter.delete("/:swapId", deleteSwapRequest);

// Add feedback for completed swap
swapRouter.post("/:swapId/feedback", addSwapFeedback);

export default swapRouter;
