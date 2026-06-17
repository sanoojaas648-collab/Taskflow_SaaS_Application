const Task = require('../models/Task');
const Project = require('../models/Project');
const Workspace = require('../models/Workspace');

const checkTaskAccess = async (projectId, userId, requiredRoles = ['owner', 'admin', 'member']) => {
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };

  const workspace = await Workspace.findById(project.workspaceId);
  if (!workspace) return { error: 'Workspace not found', status: 404 };

  const member = workspace.members.find((m) => m.userId.toString() === userId.toString());
  if (!member) return { error: 'Not a member of this workspace', status: 403 };
  if (!requiredRoles.includes(member.role)) {
    return { error: 'Not authorized for this action', status: 403 };
  }

  return { project, workspace, memberRole: member.role };
};

const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, status } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required' });
    }

    const access = await checkTaskAccess(projectId, req.user._id, ['owner', 'admin']);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: assignedTo || null,
      priority: priority || 'medium',
      status: status || 'todo',
      createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' });
    }

    const access = await checkTaskAccess(projectId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'title workspaceId');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const access = await checkTaskAccess(task.projectId._id || task.projectId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const access = await checkTaskAccess(task.projectId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const isAdminOrOwner = ['owner', 'admin'].includes(access.memberRole);

    if (req.body.assignedTo !== undefined && !isAdminOrOwner) {
      return res.status(403).json({ message: 'Only admin/owner can assign tasks' });
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.priority = req.body.priority ?? task.priority;
    task.status = req.body.status ?? task.status;

    if (req.body.assignedTo !== undefined) {
      task.assignedTo = req.body.assignedTo || null;
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const access = await checkTaskAccess(task.projectId, req.user._id, ['owner', 'admin']);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};
