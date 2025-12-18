// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Trainer from "../models/Trainer.js";
import Admin from "../models/Admin.js";

/**
 * Protect middleware (robust for trainer routes)
 * - Reads Authorization: Bearer <token>
 * - Verifies JWT with JWT_SECRET
 * - Loads account by role if present; otherwise falls back to probing models
 * - Attaches req.user and req.role
 * - Returns 401 (not 403) for auth problems so you can distinguish from role errors
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) return res.status(401).json({ message: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // { id, role, iat, exp }
    } catch (e) {
      return res.status(401).json({
        message: e.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
      });
    }

    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Prefer loading by claimed role (fast path)
    const loadByRole = async (role) => {
      if (role === "trainer") {
        return Trainer.findById(decoded.id).select("_id role email name");
      }
      if (role === "admin") {
        return Admin.findById(decoded.id).select("_id role email");
      }
      // member/user
      return User.findById(decoded.id).select("_id role email fullname");
    };

    let account = null;
    if (decoded.role) account = await loadByRole(decoded.role);

    // Fallback for old tokens / mismatched role claim
    if (!account) {
      account =
        (await Trainer.findById(decoded.id).select("_id role email name")) ||
        (await Admin.findById(decoded.id).select("_id role email")) ||
        (await User.findById(decoded.id).select("_id role email fullname"));
    }

    if (!account) return res.status(401).json({ message: "Account not found" });

    req.user = account;
    req.role = decoded.role || account.role; // e.g., "trainer"
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
/**
 * Role guard — use as: router.get(..., protect, requireRole("trainer"), handler)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    const role = req.role || req.user?.role;
    if (!role || !roles.includes(role)) {
      return res
        .status(403)
        .json({ message: `Access denied: ${role || "unknown"} not authorized` });
    }
    next();
  };
};

/** Alias for existing code that uses authorizeRoles(...) */
export const authorizeRoles = requireRole;
