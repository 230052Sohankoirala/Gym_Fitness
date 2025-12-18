// middleware/role.js
export const authorizeRoles = (...allowed) => {
  return (req, res, next) => {
    const role = req.role || req.user?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({
        message: `Access denied: ${role || "unknown"} role is not authorized`,
      });
    }
    next();
  };
};

// Optional alias if some files import requireRole instead
export const requireRole = authorizeRoles;
