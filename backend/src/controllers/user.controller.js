import { User } from "../models/user.model.js";
import { Swap } from "../models/swap.model.js";

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If profile is private and not the owner, return limited info
    if (!user.isPublic && userId !== currentUserId) {
      return res.status(403).json({ message: "Profile is private" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated this way
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData.rating;

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, lastActive: new Date() },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search users by skills
export const searchUsers = async (req, res) => {
  try {
    const { skill, location, page = 1, limit = 10 } = req.query;
    const currentUserId = req.user?.id;

    let query = { isPublic: true, isActive: true };

    // Exclude current user from results
    if (currentUserId) {
      query._id = { $ne: currentUserId };
    }

    // Search by skill in skillsOffered
    if (skill) {
      query["skillsOffered.skill"] = { $regex: skill, $options: "i" };
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ "rating.average": -1, lastActive: -1 });

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
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user's skills
export const getUserSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select(
      "skillsOffered skillsWanted name"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      skillsOffered: user.skillsOffered,
      skillsWanted: user.skillsWanted,
    });
  } catch (error) {
    console.error("Error fetching user skills:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add skill to user's offered skills
export const addSkillOffered = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill, proficiency, description } = req.body;

    if (!skill) {
      return res.status(400).json({ message: "Skill name is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if skill already exists
    const existingSkill = user.skillsOffered.find(
      (s) => s.skill.toLowerCase() === skill.toLowerCase()
    );
    if (existingSkill) {
      return res
        .status(400)
        .json({ message: "Skill already exists in your offered skills" });
    }

    user.skillsOffered.push({ skill, proficiency, description });
    await user.save();

    res.json({
      message: "Skill added successfully",
      skillsOffered: user.skillsOffered,
    });
  } catch (error) {
    console.error("Error adding skill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add skill to user's wanted skills
export const addSkillWanted = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill, priority, description } = req.body;

    if (!skill) {
      return res.status(400).json({ message: "Skill name is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if skill already exists
    const existingSkill = user.skillsWanted.find(
      (s) => s.skill.toLowerCase() === skill.toLowerCase()
    );
    if (existingSkill) {
      return res
        .status(400)
        .json({ message: "Skill already exists in your wanted skills" });
    }

    user.skillsWanted.push({ skill, priority, description });
    await user.save();

    res.json({
      message: "Skill added successfully",
      skillsWanted: user.skillsWanted,
    });
  } catch (error) {
    console.error("Error adding skill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove skill from offered skills
export const removeSkillOffered = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.skillsOffered = user.skillsOffered.filter(
      (skill) => skill._id.toString() !== skillId
    );
    await user.save();

    res.json({
      message: "Skill removed successfully",
      skillsOffered: user.skillsOffered,
    });
  } catch (error) {
    console.error("Error removing skill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove skill from wanted skills
export const removeSkillWanted = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.skillsWanted = user.skillsWanted.filter(
      (skill) => skill._id.toString() !== skillId
    );
    await user.save();

    res.json({
      message: "Skill removed successfully",
      skillsWanted: user.skillsWanted,
    });
  } catch (error) {
    console.error("Error removing skill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const [user, swapStats] = await Promise.all([
      User.findById(userId).select("name rating"),
      Swap.aggregate([
        {
          $match: {
            $or: [{ requester: userId }, { responder: userId }],
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const stats = {
      name: user.name,
      rating: user.rating,
      swaps: {
        total: 0,
        pending: 0,
        accepted: 0,
        completed: 0,
        rejected: 0,
        cancelled: 0,
      },
    };

    swapStats.forEach((stat) => {
      stats.swaps[stat._id] = stat.count;
      stats.swaps.total += stat.count;
    });

    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
