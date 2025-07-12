import mongoose from "mongoose";
const swapSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillOffered: {
      skill: {
        type: String,
        required: true,
      },
      description: String,
    },
    skillRequested: {
      skill: {
        type: String,
        required: true,
      },
      description: String,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    message: {
      type: String,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    scheduledDate: {
      type: Date,
    },
    duration: {
      type: Number, // in hours
      min: 0.5,
      max: 8,
    },
    feedback: {
      requesterFeedback: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        date: Date,
      },
      responderFeedback: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        date: Date,
      },
    },
    rejectionReason: {
      type: String,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
swapSchema.index({ requester: 1, status: 1 });
swapSchema.index({ responder: 1, status: 1 });
swapSchema.index({ status: 1, createdAt: -1 });

export const Swap = mongoose.model("Swap", swapSchema);
