import { Swap } from "../models/swap.model.js";
import { User } from "../models/user.model.js";

// Create a new swap request
export const createSwapRequest = async (req, res) => {
  try {
    const {
      responderId,
      skillOffered,
      skillRequested,
      message,
      scheduledDate,
      duration,
    } = req.body;
    const requesterId = req.user.id; // Assuming we have auth middleware

    // Validate that responder exists
    const responder = await User.findById(responderId);
    if (!responder) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create swap request
    const swapRequest = new Swap({
      requester: requesterId,
      responder: responderId,
      skillOffered,
      skillRequested,
      message,
      scheduledDate,
      duration,
    });

    await swapRequest.save();

    // Populate the request with user details
    await swapRequest.populate([
      { path: "requester", select: "name email profilePhoto" },
      { path: "responder", select: "name email profilePhoto" },
    ]);

    res.status(201).json({
      message: "Swap request created successfully",
      swapRequest,
    });
  } catch (error) {
    console.error("Error creating swap request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all swap requests for a user (both sent and received)
export const getUserSwapRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type } = req.query; // type can be 'sent' or 'received'

    let query = {};
    if (type === "sent") {
      query.requester = userId;
    } else if (type === "received") {
      query.responder = userId;
    } else {
      query = { $or: [{ requester: userId }, { responder: userId }] };
    }

    if (status) {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .populate("requester", "name email profilePhoto location")
      .populate("responder", "name email profilePhoto location")
      .sort({ createdAt: -1 });

    res.json({ swaps });
  } catch (error) {
    console.error("Error fetching swap requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept or reject a swap request
export const updateSwapStatus = async (req, res) => {
  try {
    const { swapId } = req.params;
    const { status, rejectionReason } = req.body;
    const userId = req.user.id;

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    // Only the responder can accept/reject the request
    if (swap.responder.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this swap request" });
    }

    // Update status
    swap.status = status;
    if (status === "rejected" && rejectionReason) {
      swap.rejectionReason = rejectionReason;
    }

    await swap.save();
    await swap.populate([
      { path: "requester", select: "name email profilePhoto" },
      { path: "responder", select: "name email profilePhoto" },
    ]);

    res.json({
      message: `Swap request ${status} successfully`,
      swap,
    });
  } catch (error) {
    console.error("Error updating swap status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a swap request (only by requester if pending)
export const deleteSwapRequest = async (req, res) => {
  try {
    const { swapId } = req.params;
    const userId = req.user.id;

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    // Only requester can delete and only if status is pending
    if (swap.requester.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this swap request" });
    }

    if (swap.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Can only delete pending swap requests" });
    }

    await Swap.findByIdAndDelete(swapId);

    res.json({ message: "Swap request deleted successfully" });
  } catch (error) {
    console.error("Error deleting swap request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add feedback for a completed swap
export const addSwapFeedback = async (req, res) => {
  try {
    const { swapId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: "Swap not found" });
    }

    if (swap.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Can only add feedback to completed swaps" });
    }

    // Determine if user is requester or responder
    let feedbackField;
    if (swap.requester.toString() === userId) {
      feedbackField = "feedback.requesterFeedback";
    } else if (swap.responder.toString() === userId) {
      feedbackField = "feedback.responderFeedback";
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized to add feedback to this swap" });
    }

    // Check if feedback already exists
    const existingFeedback =
      feedbackField === "feedback.requesterFeedback"
        ? swap.feedback.requesterFeedback
        : swap.feedback.responderFeedback;

    if (existingFeedback && existingFeedback.rating) {
      return res
        .status(400)
        .json({ message: "Feedback already provided for this swap" });
    }

    // Add feedback
    const feedbackData = {
      rating,
      comment,
      date: new Date(),
    };

    await Swap.findByIdAndUpdate(swapId, {
      $set: { [feedbackField]: feedbackData },
    });

    // Update user's overall rating
    const otherUserId =
      swap.requester.toString() === userId ? swap.responder : swap.requester;
    await updateUserRating(otherUserId);

    res.json({ message: "Feedback added successfully" });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function to update user's overall rating
async function updateUserRating(userId) {
  try {
    // Get all completed swaps where user was the responder or requester
    const swaps = await Swap.find({
      $or: [{ requester: userId }, { responder: userId }],
      status: "completed",
    });

    let totalRating = 0;
    let ratingCount = 0;

    swaps.forEach((swap) => {
      if (
        swap.requester.toString() === userId &&
        swap.feedback.responderFeedback?.rating
      ) {
        totalRating += swap.feedback.responderFeedback.rating;
        ratingCount++;
      }
      if (
        swap.responder.toString() === userId &&
        swap.feedback.requesterFeedback?.rating
      ) {
        totalRating += swap.feedback.requesterFeedback.rating;
        ratingCount++;
      }
    });

    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    await User.findByIdAndUpdate(userId, {
      "rating.average": averageRating,
      "rating.count": ratingCount,
    });
  } catch (error) {
    console.error("Error updating user rating:", error);
  }
}
