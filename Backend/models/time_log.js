const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TimeLog = sequelize.define('TimeLog', {
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
    minutes: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    note: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    logged_date: {
      type:         DataTypes.DATEONLY,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName:  'time_logs',
    timestamps: false,
  });

  return TimeLog;
};
