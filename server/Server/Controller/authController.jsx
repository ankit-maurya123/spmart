const jwt = require('jsonwebtoken');

// Default credentials when env vars aren't set — convenient for local dev.
// Override via .env to lock down production deployments.
const DEFAULT_ADMIN_EMAIL   = 'admin@spmart.com';
const DEFAULT_ADMIN_PASS    = 'admin123';
const DEFAULT_MANAGER_EMAIL = 'manager@spmart.com';
const DEFAULT_MANAGER_PASS  = 'manager123';

const getAdminCreds   = () => ({
  email:    process.env.ADMIN_EMAIL    || DEFAULT_ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASS,
});
const getManagerCreds = () => ({
  email:    process.env.MANAGER_EMAIL    || DEFAULT_MANAGER_EMAIL,
  password: process.env.MANAGER_PASSWORD || DEFAULT_MANAGER_PASS,
});

// POST /api/auth/login — admin only (kept for backward compatibility)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = getAdminCreds();
    if (email !== admin.email || password !== admin.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, email, role: 'admin' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/auth/manager-login — Order Panel login
// Accepts manager creds (role: manager) OR admin creds (role: admin) so a single
// admin can also use the order panel without needing a second account.
exports.managerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const mgr = getManagerCreds();
    const adm = getAdminCreds();

    let role = null;
    if (email === mgr.email && password === mgr.password) role = 'manager';
    else if (email === adm.email && password === adm.password) role = 'admin';

    if (!role) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, email, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/auth/verify — check if token is still valid
exports.verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({ email: decoded.email, role: decoded.role });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
