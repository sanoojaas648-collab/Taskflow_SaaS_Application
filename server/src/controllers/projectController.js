const Project = require('../models/Project');
const Task = require('../models/Task');
const Workspace = require('../models/Workspace');

const checkProjectAccess = async (workspaceId, userId, requiredRoles = ['owner', 'admin', 'member']) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return { error: 'Workspace not found', status: 404 };

  const member = workspace.members.find((m) => m.userId.toString() === userId.toString());
  if (!member) return { error: 'Not a member of this workspace', status: 403 };
  if (!requiredRoles.includes(member.role)) {
    return { error: 'Not authorized for this action', status: 403 };
  }

  return { workspace, memberRole: member.role };
};

const createProject = async (req, res) => {
  try {
    const { title, description, workspaceId } = req.body;

    if (!title || !workspaceId) {
      return res.status(400).json({ message: 'Title and workspaceId are required' });
    }

    const access = await checkProjectAccess(workspaceId, req.user._id, ['owner', 'admin']);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const project = await Project.create({
      title,
      description,
      workspaceId,
      createdBy: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId) {
      return res.status(400).json({ message: 'workspaceId is required' });
    }

    const access = await checkProjectAccess(workspaceId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const projects = await Project.find({ workspaceId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const access = await checkProjectAccess(project.workspaceId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const taskCount = await Task.countDocuments({ projectId: project._id });
    const completedCount = await Task.countDocuments({
      projectId: project._id,
      status: 'completed',
    });

    res.json({ ...project.toObject(), taskCount, completedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const access = await checkProjectAccess(project.workspaceId, req.user._id, ['owner', 'admin']);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    project.title = req.body.title ?? project.title;
    project.description = req.body.description ?? project.description;
    project.status = req.body.status ?? project.status;
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const access = await checkProjectAccess(project.workspaceId, req.user._id, ['owner', 'admin']);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
