import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const onSignup = async (req, res) => {
  const { name, email, password, location } = req.body;
  try {
    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new User({ name, email, password, location });
    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    // Return user data without password
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      location: newUser.location,
      isPublic: newUser.isPublic,
    };

    res.status(201).json({
      message: "User created successfully",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const onLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      profilePhoto: user.profilePhoto,
      isPublic: user.isPublic,
      rating: user.rating,
    };

    res.json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const onLogout = async (req, res) => {
  try {
    // In a real-world application, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
