const jwt = require("jsonwebtoken");

// ✅ VERIFY TOKEN
exports.protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains id + roles
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};

// ✅ ROLE BASED ACCESS (MULTI ROLE SUPPORT)
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user.roles) {
      return res.status(403).json({
        message: "No roles assigned",
      });
    }

    const hasAccess = req.user.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "You do not have permission",
      });
    }

    next();
  };
};
