const express = require('express');
const { TaskTag } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await TaskTag.findAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:task_id/:tag_id', async (req, res) => {
  try {
    const item = await TaskTag.findOne({ where: { task_id: req.params.task_id, tag_id: req.params.tag_id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await TaskTag.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:task_id/:tag_id', async (req, res) => {
  try {
    const deleted = await TaskTag.destroy({ where: { task_id: req.params.task_id, tag_id: req.params.tag_id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
