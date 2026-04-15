const express = require('express');
const { Task, Project, Organization, sequelize } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, assignee_id, project_id } = req.query;
    const whereClause = { deleted_at: null };
    
    if (status) whereClause.status = status;
    if (assignee_id) whereClause.assignee_id = assignee_id;
    if (project_id) whereClause.project_id = project_id;

    const items = await Task.findAll({ where: whereClause });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Filtrar tareas por proyecto
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const items = await Task.findAll({
      where: {
        project_id: projectId,
        deleted_at: null,
      },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- STATS ENDPOINTS ---

// Porcentaje de tareas completadas
router.get('/stats/completion-percentage', async (req, res) => {
  try {
    const total = await Task.count({ where: { deleted_at: null } });
    if (total === 0) return res.json({ completion_percentage: 0 });
    
    const doneCount = await Task.count({ where: { status: 'done', deleted_at: null } });
    const percentage = ((doneCount / total) * 100).toFixed(2);
    
    res.json({ total, completed: doneCount, completion_percentage: parseFloat(percentage) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Numero de tareas agrupadas por prioridad y estado
router.get('/stats/by-priority-status', async (req, res) => {
  try {
    const stats = await Task.findAll({
      attributes: [
        'priority',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'task_count']
      ],
      where: { deleted_at: null },
      group: ['priority', 'status']
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tareas completadas por usuario
router.get('/stats/completed-by-user', async (req, res) => {
  try {
    const stats = await Task.findAll({
      attributes: [
        'assignee_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'completed_count']
      ],
      where: { status: 'done', deleted_at: null },
      group: ['assignee_id']
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- GROUPED ENDPOINTS ---

// Tareas agrupadas por proyecto
router.get('/grouped/by-project', async (req, res) => {
  try {
    const stats = await Task.findAll({
      attributes: [
        'project_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'task_count']
      ],
      where: { deleted_at: null },
      group: ['project_id']
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tareas agrupadas por organizacion
router.get('/grouped/by-organization', async (req, res) => {
  try {
    // Usamos query raw para agrupar facilmente por la relacion Task->Project->Organization
    const [results] = await sequelize.query(`
      SELECT p.organization_id, COUNT(t.id) as task_count
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.deleted_at IS NULL AND p.deleted_at IS NULL
      GROUP BY p.organization_id
    `);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ASSIGNMENT ENDPOINT ---

// Asignacion de tareas al usuario
router.patch('/:id/assign', async (req, res) => {
  try {
    const { assignee_id } = req.body;
    const item = await Task.findByPk(req.params.id);
    if (!item || item.deleted_at) return res.status(404).json({ error: 'Not found' });
    
    item.assignee_id = assignee_id;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Task.findOne({ where: { id: req.params.id, deleted_at: null } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Task.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Task.findByPk(req.params.id);
    if (!item || item.deleted_at) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Task.findByPk(req.params.id);
    if (!item || item.deleted_at) return res.status(404).json({ error: 'Not found' });
    
    item.deleted_at = new Date();
    await item.save();
    
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
