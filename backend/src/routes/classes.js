const express = require('express');
const { randomUUID } = require('node:crypto');
const repository = require('../repository');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { formatUserData } = require('../utils/userUtils');

const router = express.Router();
router.get('/', async (req, res, next) => {
  try { res.json(await repository.listClasses()); } catch (error) { next(error); }
});
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, description, teacher } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: '班级名称不能为空' });
    const item = await repository.createClass({ id: randomUUID(), name: name.trim(), description, teacher, createdAt: new Date() });
    await repository.audit({ actor: req.user, action: 'create', entityType: 'class', entityId: item.id, ip: req.ip });
    res.status(201).json(item);
  } catch (error) { next(error); }
});
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await repository.updateClass(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: '班级不存在' });
    await repository.audit({ actor: req.user, action: 'update', entityType: 'class', entityId: item.id, ip: req.ip });
    res.json(item);
  } catch (error) { next(error); }
});
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const students = await repository.listUsers({ classId: req.params.id });
    if (students.length) return res.status(400).json({ message: '班级中还有学生，无法删除', studentsCount: students.length });
    if (!(await repository.deleteClass(req.params.id))) return res.status(404).json({ message: '班级不存在' });
    await repository.audit({ actor: req.user, action: 'delete', entityType: 'class', entityId: req.params.id, ip: req.ip });
    res.json({ message: '班级删除成功' });
  } catch (error) { next(error); }
});
router.get('/:id/students', authenticate, async (req, res, next) => {
  try {
    if (!(await repository.getClass(req.params.id))) return res.status(404).json({ message: '班级不存在' });
    res.json((await repository.listUsers({ includeAdmin: false, classId: req.params.id })).map(formatUserData));
  } catch (error) { next(error); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const item = await repository.getClass(req.params.id);
    if (!item) return res.status(404).json({ message: '班级不存在' });
    res.json(item);
  } catch (error) { next(error); }
});
module.exports = router;
