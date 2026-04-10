const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    user_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    task_id: {
      type:      DataTypes.UUID,
      allowNull: true,
    },
    project_id: {
      type:      DataTypes.UUID,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(
        'task_assigned', 'task_updated', 'task_completed',
        'comment_added', 'mention', 'due_date_reminder',
        'project_update', 'crm_sync'
      ),
      allowNull: false,
    },
    message: {
      type:      DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: false,
    },
    created_at: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName:  'notifications',
    timestamps: false,
  });

  return Notification;
};
