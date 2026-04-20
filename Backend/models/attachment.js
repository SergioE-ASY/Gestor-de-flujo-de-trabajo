const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attachment = sequelize.define('Attachment', {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    task_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    uploaded_by: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    filename: {
      type:      DataTypes.STRING(500),
      allowNull: false,
    },
    uploaded_photo: {
      type:      DataTypes.BLOB,
      allowNull: false,
    },
    file_size: {
      type:      DataTypes.INTEGER,
      allowNull: true,
    },
    mime_type: {
      type:      DataTypes.STRING(100),
      allowNull: true,
    },
    created_at: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName:  'attachments',
    timestamps: false,
  });

  return Attachment;
};
