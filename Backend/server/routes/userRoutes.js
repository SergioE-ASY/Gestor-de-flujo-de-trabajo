const express = require('express');
const multer = require('multer');
const { User } = require('../db');
const { Op } = require('sequelize');
const router = express.Router();

// Configuración de Multer: Almacenar en memoria (Buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
});

console.log("USER MODEL:", User);
/**
 * @route   PUT /api/users/:id/avatar
 * @desc    Subir imagen de perfil (Avatar) y guardarla en bytea
 */
router.put('/:id/avatar', upload.single('avatar'), async (req, res) => {
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
    console.error('--- DEBUG AVATAR ERROR ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    if (error.errors) {
      console.error('Validation Errors:', error.errors.map(e => e.message));
    }
    res.status(500).json({ 
      error: 'Error interno del servidor al procesar el avatar.',
      details: error.message 
    });
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

// ======================
// Autenticación
// ======================

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username (email/name) and password are required' });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { name: username },
          { email: username }
        ],
        deleted_at: null
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado o credenciales inválidas' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Usuario no encontrado o credenciales inválidas' });
    }

    // Actualizar last_login_at
    user.last_login_at = new Date();
    await user.save();

    // Devuelve el objeto usuario omitiendo el password y el buffer pesado
    const data = user.toJSON();
    data.hasAvatar = !!data.avatar;
    delete data.password_hash;
    delete data.avatar;
    res.json(data);
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/forgot-password', async (req, res) => {
  try {
    const { identity, newPassword } = req.body;

    if (!identity || !newPassword) {
      return res.status(400).json({ error: 'Identity (email/name) and new password are required' });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { name: identity },
          { email: identity }
        ],
        deleted_at: null
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.password_hash = newPassword;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ======================
// Rutas CRUD estándar
// ======================

router.get('/', async (req, res) => {
  try {
    const items = await User.findAll({ where: { deleted_at: null } });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await User.findOne({ where: { id: req.params.id, deleted_at: null } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await User.create(req.body);
    const data = item.toJSON();
    data.hasAvatar = !!data.avatar;
    delete data.avatar;
    res.status(201).json(data);
  } catch (error) {
    // Si Sequelize lanza error de unicidad u otro fallo de validación
    res.status(400).json({ error: error.errors?.[0]?.message || error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await User.findByPk(req.params.id);
    if (!item || item.deleted_at) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await User.findByPk(req.params.id);
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
