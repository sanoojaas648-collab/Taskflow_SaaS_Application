const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    const workspace = await Workspace.create({
      name,
      owner: req.user._id,
      members: [{ userId: req.user._id, role: 'owner' }],
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { workspaces: workspace._id },
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      'members.userId': req.user._id,
    }).populate('owner', 'name email');

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.userId', 'name email');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isMember = workspace.members.some(
      (m) => m.userId._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'owner') {
      return res.status(403).json({ message: 'Only owner can update workspace' });
    }

    workspace.name = req.body.name || workspace.name;
    await workspace.save();

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'owner') {
      return res.status(403).json({ message: 'Only owner can delete workspace' });
    }

    const projects = await Project.find({ workspaceId: workspace._id });
    const projectIds = projects.map((p) => p._id);

    await Task.deleteMany({ projectId: { $in: projectIds } });
    await Project.deleteMany({ workspaceId: workspace._id });

    await User.updateMany(
      { workspaces: workspace._id },
      { $pull: { workspaces: workspace._id } }
    );

    await workspace.deleteOne();

    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const currentMember = workspace.members.find(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
      return res.status(403).json({ message: 'Not authorized to invite members' });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    const alreadyMember = workspace.members.some(
      (m) => m.userId.toString() === userToInvite._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    const allowedRole = role === 'admin' ? 'admin' : 'member';
    if (role === 'owner') {
      return res.status(400).json({ message: 'Cannot assign owner role via invite' });
    }

    workspace.members.push({ userId: userToInvite._id, role: allowedRole });
    await workspace.save();

    await User.findByIdAndUpdate(userToInvite._id, {
      $push: { workspaces: workspace._id },
    });

    const updated = await Workspace.findById(workspace._id).populate(
      'members.userId',
      'name email'
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const currentMember = workspace.members.find(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (!currentMember || currentMember.role !== 'owner') {
      return res.status(403).json({ message: 'Only owner can remove members' });
    }

    const memberToRemove = workspace.members.find(
      (m) => m.userId.toString() === req.params.userId
    );

    if (!memberToRemove) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (memberToRemove.role === 'owner') {
      return res.status(400).json({ message: 'Cannot remove workspace owner' });
    }

    workspace.members = workspace.members.filter(
      (m) => m.userId.toString() !== req.params.userId
    );
    await workspace.save();

    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { workspaces: workspace._id },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isMember = workspace.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const projects = await Project.find({ workspaceId });
    const projectIds = projects.map((p) => p._id);
    const tasks = await Task.find({ projectId: { $in: projectIds } })
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .sort({ updatedAt: -1 })
      .limit(10);

    const totalProjects = projects.length;
    const completedTasks = await Task.countDocuments({
      projectId: { $in: projectIds },
      status: 'completed',
    });
    const pendingTasks = await Task.countDocuments({
      projectId: { $in: projectIds },
      status: { $in: ['todo', 'in_progress'] },
    });
    const teamMembers = workspace.members.length;

    res.json({
      totalProjects,
      completedTasks,
      pendingTasks,
      teamMembers,
      recentActivity: tasks,
      projects: projects.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  getDashboard,
};
