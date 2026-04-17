const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TaskTag = sequelize.define('TaskTag', {
    task_id: {
      type:       DataTypes.UUID,
      allowNull:  false,
      primaryKey: true,
    },
    tag_id: {
      type:       DataTypes.UUID,
      allowNull:  false,
      primaryKey: true,
    },
  }, {
    tableName:  'task_tags',
    timestamps: false,
  });

  return TaskTag;
};
