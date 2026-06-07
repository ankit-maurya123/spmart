const jwt = require('jsonwebtoken');

// Decode the Bearer token and require role ∈ allowed.
function gate(allowed) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          error: 'Server misconfigured: JWT_SECRET env var is not set on the host.',
        });
      }
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!allowed.includes(decoded.role)) {
        return res.status(403).json({ error: 'Not authorised' });
      }
      req.staff = { email: decoded.email, role: decoded.role };
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

// Allows admin only.
exports.requireAdmin = gate(['admin']);

// Allows admin OR manager — used for order-management endpoints.
exports.requireStaff = gate(['admin', 'manager']);
