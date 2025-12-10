import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ✅ Generate JWT and set as cookie
const generateToken = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // must be true on prod
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return token;
};

// 🔹 Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all the fields",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// 🔹 User login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    // ✅ Generate token and set cookie
    generateToken(res, { id: user._id, role: user.isAdmin ? "admin" : "user" });

    return res.json({
      message: "User logged in successfully",
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// 🔹 Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields", success: false });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    // ✅ Generate token and set cookie
    generateToken(res, { email, role: "admin" });

    return res.json({
      success: true,
      message: "Admin logged in successfully",
      admin: { email: adminEmail },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// 🔹 Logout
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ message: "User logged out successfully", success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// 🔹 Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// 🔹 Check if user is authenticated
export const isAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
