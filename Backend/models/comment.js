const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    task_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    content: {
      type:      DataTypes.TEXT,
      allowNull: false,
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
    tableName:  'comments',
    timestamps: false,
    paranoid:   false,
  });

  return Comment;
};
