const express = require('express');
const multer = require('multer');
const { Attachment } = require('../db');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10MB para adjuntos
});

/**
 * @route   POST /api/attachments/task/:taskId
 * @desc    Subir un archivo adjunto a una tarea y guardarlo en bytea
 */
router.post('/task/:taskId', upload.single('file'), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { uploaded_by } = req.body; // Se espera el ID del usuario que sube el archivo

    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    if (!uploaded_by) {
        return res.status(400).json({ error: 'El campo uploaded_by es obligatorio.' });
    }

    const attachment = await Attachment.create({
      task_id: taskId,
      uploaded_by,
      filename: req.file.originalname,
      uploaded_photo: req.file.buffer,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
    });

    res.status(201).json({ 
      message: 'Archivo adjunto subido correctamente.',
      attachment: {
        id: attachment.id,
        filename: attachment.filename,
        mime_type: attachment.mime_type
      }
    });
  } catch (error) {
    console.error('Error al subir archivo adjunto:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @route   GET /api/attachments/:id
 * @desc    Obtener/Descargar un archivo adjunto (bytea)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attachment = await Attachment.findByPk(id);

    if (!attachment || !attachment.uploaded_photo) {
      return res.status(404).json({ error: 'Archivo no encontrado.' });
    }

    // Configurar encabezados para la descarga o visualización
    res.set('Content-Type', attachment.mime_type || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="${attachment.filename}"`);
    res.send(attachment.uploaded_photo);
  } catch (error) {
    console.error('Error al obtener archivo adjunto:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ======================
// Rutas CRUD estándar
// ======================

router.get('/', async (req, res) => {
  try {
    const items = await Attachment.findAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Attachment.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Attachment.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Attachment.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    
    res.json({ message: 'Eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
