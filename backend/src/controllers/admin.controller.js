import { User } from "../models/user.model.js";
import { Swap } from "../models/swap.model.js";

// Get all users with pagination
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.isActive = status === "active";
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Ban/unban a user
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = isActive;
    await user.save();

    // Cancel all pending swaps if user is banned
    if (!isActive) {
      await Swap.updateMany(
        {
          $or: [{ requester: userId }, { responder: userId }],
          status: "pending",
        },
        {
          status: "cancelled",
          rejectionReason: reason || "User account suspended",
        }
      );
    }

    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all swaps with filters
export const getAllSwaps = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const swaps = await Swap.find(query)
      .populate("requester", "name email")
      .populate("responder", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Swap.countDocuments(query);

    res.json({
      swaps,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching swaps:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get platform statistics
export const getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalSwaps, swapsByStatus, recentActivity] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        Swap.countDocuments(),
        Swap.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        User.find({
          lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }).countDocuments(),
      ]);

    const swapStats = {};
    swapsByStatus.forEach((stat) => {
      swapStats[stat._id] = stat.count;
    });

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        recentlyActive: recentActivity,
      },
      swaps: {
        total: totalSwaps,
        ...swapStats,
      },
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Moderate skill descriptions
export const moderateSkill = async (req, res) => {
  try {
    const { userId, skillId, skillType, action, reason } = req.body;

    if (!["offered", "wanted"].includes(skillType)) {
      return res.status(400).json({ message: "Invalid skill type" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const skillArray =
      skillType === "offered" ? user.skillsOffered : user.skillsWanted;
    const skill = skillArray.id(skillId);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (action === "remove") {
      skillArray.pull(skillId);
      await user.save();

      res.json({
        message: "Skill removed successfully",
        reason,
      });
    } else {
      res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.error("Error moderating skill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send platform-wide message (this would typically integrate with a notification system)
export const sendPlatformMessage = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    // In a real application, this would send notifications to all users
    // For now, we'll just log it and return success
    console.log(`Platform message sent: ${title} - ${message} (Type: ${type})`);

    res.json({
      message: "Platform message sent successfully",
      sentAt: new Date(),
      recipients: await User.countDocuments({ isActive: true }),
    });
  } catch (error) {
    console.error("Error sending platform message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Generate and download reports
export const generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let reportData = {};

    switch (type) {
      case "users":
        reportData = await User.find(
          dateFilter.createdAt ? { createdAt: dateFilter } : {}
        ).select("-password");
        break;

      case "swaps":
        reportData = await Swap.find(
          dateFilter.createdAt ? { createdAt: dateFilter } : {}
        ).populate("requester responder", "name email");
        break;

      case "feedback":
        reportData = await Swap.find({
          status: "completed",
          $or: [
            { "feedback.requesterFeedback.rating": { $exists: true } },
            { "feedback.responderFeedback.rating": { $exists: true } },
          ],
          ...(dateFilter.createdAt ? { createdAt: dateFilter } : {}),
        }).populate("requester responder", "name email");
        break;

      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    res.json({
      reportType: type,
      generatedAt: new Date(),
      count: reportData.length,
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
