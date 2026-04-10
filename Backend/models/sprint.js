const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sprint = sequelize.define('Sprint', {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    project_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type:      DataTypes.STRING(255),
      allowNull: false,
    },
    goal: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type:         DataTypes.ENUM('planned', 'active', 'closed'),
      allowNull:    false,
      defaultValue: 'planned',
    },
    start_date: {
      type:      DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
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
  }, {
    tableName:  'sprints',
    timestamps: false,
  });

  return Sprint;
};
