import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    skillsOffered: [
      {
        skill: {
          type: String,
          required: true,
          trim: true,
        },
        proficiency: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
          default: "Intermediate",
        },
        description: {
          type: String,
          maxlength: [500, "Description cannot exceed 500 characters"],
        },
      },
    ],
    skillsWanted: [
      {
        skill: {
          type: String,
          required: true,
          trim: true,
        },
        priority: {
          type: String,
          enum: ["Low", "Medium", "High"],
          default: "Medium",
        },
        description: {
          type: String,
          maxlength: [500, "Description cannot exceed 500 characters"],
        },
      },
    ],
    availability: {
      weekdays: {
        type: Boolean,
        default: false,
      },
      weekends: {
        type: Boolean,
        default: false,
      },
      evenings: {
        type: Boolean,
        default: false,
      },
      mornings: {
        type: Boolean,
        default: false,
      },
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function () {
  this.lastActive = new Date();
  return this.save();
};

export const User = mongoose.model("User", userSchema);
