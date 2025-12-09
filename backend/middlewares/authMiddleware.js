import jwt from "jsonwebtoken";

// Protect routes for logged-in users
export const protect = (req, res, next) => {
  const token = req.cookies.token; // must match cookie name in login
  if (!token) {
    return res
      .status(401)
      .json({ message: "Not Authorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};

// Protect routes for admin only
export const adminOnly = (req, res, next) => {
  const token = req.cookies.token; // must match cookie name
  if (!token) {
    return res.status(401).json({ message: "Not Authorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;

    if (req.admin.email === process.env.ADMIN_EMAIL) {
      next();
    } else {
      return res.status(403).json({ message: "Admins only", success: false });
    }
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};
