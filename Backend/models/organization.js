const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Organization = sequelize.define('Organization', {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    name: {
      type:      DataTypes.STRING(255),
      allowNull: false,
    },
    crm_company_id: {
      type:      DataTypes.STRING(100),
      allowNull: true,
    },
    logo: {
      type:      DataTypes.BLOB,
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
    tableName:  'organizations',
    timestamps: false,       // gestionado manualmente / por triggers
    paranoid:   false,
  });

  return Organization;
};
