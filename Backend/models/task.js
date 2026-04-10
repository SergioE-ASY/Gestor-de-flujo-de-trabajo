const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    project_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    sprint_id: {
      type:      DataTypes.UUID,
      allowNull: true,
    },
    assignee_id: {
      type:      DataTypes.UUID,
      allowNull: true,
    },
    parent_task_id: {
      type:      DataTypes.UUID,
      allowNull: true,
    },
    project_sequence: {
      type:      DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type:         DataTypes.ENUM('epic', 'story', 'task', 'bug'),
      allowNull:    false,
      defaultValue: 'task',
    },
    title: {
      type:      DataTypes.STRING(500),
      allowNull: false,
    },
    description: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type:         DataTypes.ENUM('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'),
      allowNull:    false,
      defaultValue: 'backlog',
    },
    priority: {
      type:         DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull:    false,
      defaultValue: 'medium',
    },
    position: {
      type:         DataTypes.INTEGER,
      allowNull:    false,
      defaultValue: 0,
    },
    estimated_min: {
      type:      DataTypes.INTEGER,
      allowNull: true,
    },
    due_date: {
      type:      DataTypes.DATEONLY,
      allowNull: true,
    },
    completed_at: {
      type:      DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type:      DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName:  'tasks',
    timestamps: false,
    paranoid:   false,
    indexes: [
      { unique: true, fields: ['project_id', 'project_sequence'] },
    ],
  });

  return Task;
};
