const express = require('express');
const multer = require('multer');
const { Organization } = require('../server/db');
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

module.exports = router;
