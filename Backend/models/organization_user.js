const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrganizationUser = sequelize.define('OrganizationUser', {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    organization_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type:         DataTypes.ENUM('admin', 'manager', 'member', 'viewer'),
      allowNull:    false,
      defaultValue: 'member',
    },
    joined_at: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName:  'organization_users',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['organization_id', 'user_id'] },
    ],
  });

  return OrganizationUser;
};
