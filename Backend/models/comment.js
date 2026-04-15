const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },

    // (1,1) obligatorio — FK → tasks(id) ON DELETE CASCADE
    task_id: {
      type:       DataTypes.UUID,
      allowNull:  false,
      references: { model: 'tasks', key: 'id' },
      onDelete:   'CASCADE',
    },

    // (1,1) obligatorio — FK → users(id) ON DELETE RESTRICT
    user_id: {
      type:       DataTypes.UUID,
      allowNull:  false,
      references: { model: 'users', key: 'id' },
      onDelete:   'RESTRICT',
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

    // Campos extra para auditoría / soft-delete (ya presentes en el esquema SQL)
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
    tableName:  'comments',  // nombre real en PostgreSQL
    timestamps: false,       // gestionamos las fechas manualmente
    paranoid:   false,
  });

  return Comment;
};
