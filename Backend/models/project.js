const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    organization_id: {
      type:      DataTypes.UUID,
      allowNull: true,
    },
    owner_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    key: {
      type:      DataTypes.STRING(10),
      allowNull: false,
    },
    name: {
      type:      DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type:         DataTypes.ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled'),
      allowNull:    false,
      defaultValue: 'planning',
    },
    priority: {
      type:         DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull:    false,
      defaultValue: 'medium',
    },
    start_date: {
      type:      DataTypes.DATEONLY,
      allowNull: true,
    },
    due_date: {
      type:      DataTypes.DATEONLY,
      allowNull: true,
    },
    crm_project_id: {
      type:      DataTypes.STRING(100),
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
    tableName:  'projects',
    timestamps: false,
    paranoid:   false,
    indexes: [
      { unique: true, fields: ['organization_id', 'key'] },
    ],
  });

  return Project;
};
