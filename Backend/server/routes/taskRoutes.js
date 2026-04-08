const express = require('express');
const { Task } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await Task.findAll({ where: { deleted_at: null } });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
