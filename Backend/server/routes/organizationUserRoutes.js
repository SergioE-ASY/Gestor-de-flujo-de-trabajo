const express = require('express');
const { OrganizationUser } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await OrganizationUser.findAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await OrganizationUser.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await OrganizationUser.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await OrganizationUser.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint para que un admin edite el rol o info de un miembro de la org
router.put('/:organization_id/users/:user_id', async (req, res) => {
  try {
    const { organization_id, user_id } = req.params;
    const { request_user_id, role, ...updateData } = req.body;
    
    // 1. Validar que quien pide (request_user_id) sea admin de la org
    const requester = await OrganizationUser.findOne({
      where: { organization_id, user_id: request_user_id }
    });
    
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Requires admin role in the organization' });
    }
    
    // 2. Buscar al usuario a actualizar
    const targetUser = await OrganizationUser.findOne({
      where: { organization_id, user_id }
    });
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found in this organization' });
    }
    
    // 3. Actualizar al usuario
    if (role) targetUser.role = role;
    Object.assign(targetUser, updateData);
    await targetUser.save();
    
    res.json(targetUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await OrganizationUser.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
