const express = require('express');
const { Comment, User, Task } = require('../db');
const router = express.Router();

// Opciones de include compartidas (populate básico)
const includeOptions = [
  { model: User, attributes: ['id', 'name', 'email'] },
  { model: Task, attributes: ['id', 'title'] },
];

// ─── GET /api/comments ────────────────────────────────────────────────────────
// Lista todos los comentarios activos.
// Filtro opcional por tarea: GET /api/comments?task_id=<uuid>
router.get('/', async (req, res) => {
  try {
    const where = { deleted_at: null };

    if (req.query.task_id) {
      where.task_id = req.query.task_id;
    }

    const items = await Comment.findAll({
      where,
      include:  includeOptions,
      order:    [['created_at', 'ASC']],
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/comments/task/:taskId ──────────────────────────────────────────
// Ruta dedicada: todos los comentarios de una tarea específica.
router.get('/task/:taskId', async (req, res) => {
  try {
    const items = await Comment.findAll({
      where:   { task_id: req.params.taskId, deleted_at: null },
      include: includeOptions,
      order:   [['created_at', 'ASC']],
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/comments/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const item = await Comment.findOne({
      where:   { id: req.params.id, deleted_at: null },
      include: includeOptions,
    });

    if (!item) return res.status(404).json({ error: 'Comentario no encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/comments ───────────────────────────────────────────────────────
// Body requerido: { task_id, user_id, content }
router.post('/', async (req, res) => {
  try {
    const { task_id, user_id, content } = req.body;

    if (!task_id || !user_id || !content) {
      return res.status(400).json({ error: 'task_id, user_id y content son obligatorios' });
    }

    const item = await Comment.create({ task_id, user_id, content });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── PUT /api/comments/:id ────────────────────────────────────────────────────
// Solo permite editar el contenido del comentario.
router.put('/:id', async (req, res) => {
  try {
    const item = await Comment.findByPk(req.params.id);
    if (!item || item.deleted_at) return res.status(404).json({ error: 'Comentario no encontrado' });

    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'El campo content es obligatorio' });

    await item.update({ content, updated_at: new Date() });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── DELETE /api/comments/:id ─────────────────────────────────────────────────
// Soft-delete: marca deleted_at con la fecha actual.
router.delete('/:id', async (req, res) => {
  try {
    const item = await Comment.findByPk(req.params.id);
    if (!item || item.deleted_at) return res.status(404).json({ error: 'Comentario no encontrado' });

    item.deleted_at = new Date();
    item.updated_at = new Date();
    await item.save();

    res.json({ message: 'Comentario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
