const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    const memberRole = req.memberRole;
    if (!roles.includes(memberRole)) {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
    next();
  };
};

const checkWorkspaceMember = async (req, res, next) => {
  const Workspace = require('../models/Workspace');
  const workspaceId = req.params.workspaceId || req.body.workspaceId;

  if (!workspaceId) {
    return res.status(400).json({ message: 'Workspace ID is required' });
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    return res.status(404).json({ message: 'Workspace not found' });
  }

  const member = workspace.members.find(
    (m) => m.userId.toString() === req.user._id.toString()
  );

  if (!member) {
    return res.status(403).json({ message: 'Not a member of this workspace' });
  }

  req.workspace = workspace;
  req.memberRole = member.role;
  next();
};

module.exports = { protect, authorize, checkWorkspaceMember };
