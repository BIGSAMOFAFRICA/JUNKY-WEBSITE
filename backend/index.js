import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();
const app = express();

// Database and Cloudinary
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json()); // parse JSON
app.use(cookieParser());

// CORS - allow frontend origin + credentials (cookies)
const allowedOrigins = [
  "https://restaurant-website-lemon-tau.vercel.app", // your Vercel frontend
  "http://localhost:5173", // Vite dev server
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allow cookies
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/booking", bookingRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
