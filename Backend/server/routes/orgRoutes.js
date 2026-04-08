const express = require('express');
const multer = require('multer');
const { Organization } = require('../db');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * @route   POST /api/organizations/:id/logo
 * @desc    Subir logo de la organización y guardarlo en bytea
 */
router.post('/:id/logo', upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    const org = await Organization.findByPk(id);
    if (!org) {
      return res.status(404).json({ error: 'Organización no encontrada.' });
    }

    org.logo = req.file.buffer;
    await org.save();

    res.json({ message: 'Logo actualizado correctamente.' });
  } catch (error) {
    console.error('Error al subir logo:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @route   GET /api/organizations/:id/logo
 * @desc    Obtener logo de la organización (bytea)
 */
router.get('/:id/logo', async (req, res) => {
  try {
    const { id } = req.params;
    const org = await Organization.findByPk(id);

    if (!org || !org.logo) {
      return res.status(404).json({ error: 'Logo no encontrado.' });
    }

    res.set('Content-Type', 'image/png');
    res.send(org.logo);
  } catch (error) {
    console.error('Error al obtener logo:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ======================
// Rutas CRUD estándar
// ======================

router.get('/', async (req, res) => {
  try {
    const items = await Organization.findAll({ where: { deleted_at: null } });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Organization.findOne({ where: { id: req.params.id, deleted_at: null } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Organization.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Organization.findByPk(req.params.id);
    if (!item || item.deleted_at) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Organization.findByPk(req.params.id);
    if (!item || item.deleted_at) return res.status(404).json({ error: 'Not found' });
    
    // Soft delete: actualizar deleted_at con la fecha del servidor
    item.deleted_at = new Date();
    await item.save();
    
    res.json({ message: 'Borrado lógico exitoso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
