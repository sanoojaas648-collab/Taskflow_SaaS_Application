const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const TaskCard = ({ task, onStatusChange, onDelete, canAssign }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task._id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        {task.assignedTo ? (
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 text-xs font-medium">
                {task.assignedTo.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-500">{task.assignedTo.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Unassigned</span>
        )}

        {canAssign && onDelete && (
          <button
            onClick={() => onDelete(task._id)}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
