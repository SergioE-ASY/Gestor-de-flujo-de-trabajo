const express = require('express');
const multer = require('multer');
const { User } = require('../server/db');
const router = express.Router();

// Configuración de Multer: Almacenar en memoria (Buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
});

/**
 * @route   POST /api/users/:id/avatar
 * @desc    Subir imagen de perfil (Avatar) y guardarla en bytea
 */
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Actualizar el campo avatar con el buffer binario
    user.avatar = req.file.buffer;
    await user.save();

    res.json({ message: 'Avatar actualizado correctamente.' });
  } catch (error) {
    console.error('Error al subir avatar:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @route   GET /api/users/:id/avatar
 * @desc    Obtener imagen de perfil desde la base de datos (bytea)
 */
router.get('/:id/avatar', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user || !user.avatar) {
      return res.status(404).json({ error: 'Imagen no encontrada.' });
    }

    // Se envía el buffer directamente
    // Nota: Como no guardamos el mime_type en el modelo, intentamos detectar o enviamos genérico
    res.set('Content-Type', 'image/png'); // Por defecto PNG
    res.send(user.avatar);
  } catch (error) {
    console.error('Error al obtener avatar:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
