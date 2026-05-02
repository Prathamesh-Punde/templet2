const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Allow the request only when the authenticated user's role is permitted.
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not authenticated' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
        requiredRole: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

module.exports = authorize;
