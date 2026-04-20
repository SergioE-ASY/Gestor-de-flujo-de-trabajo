const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProjectMember = sequelize.define('ProjectMember', {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    project_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type:         DataTypes.ENUM('owner', 'manager', 'member', 'viewer'),
      allowNull:    false,
      defaultValue: 'member',
    },
    joined_at: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName:  'project_members',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['project_id', 'user_id'] },
    ],
  });

  return ProjectMember;
};
