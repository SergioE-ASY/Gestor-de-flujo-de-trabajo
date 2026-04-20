const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tag = sequelize.define('Tag', {
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
      type:      DataTypes.STRING(100),
      allowNull: false,
    },
    color: {
      type:         DataTypes.STRING(7),
      allowNull:    false,
      defaultValue: '#6366f1',
      validate: {
        is: /^#[0-9A-Fa-f]{6}$/,
      },
    },
  }, {
    tableName:  'tags',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['project_id', 'name'] },
    ],
  });

  return Tag;
};
