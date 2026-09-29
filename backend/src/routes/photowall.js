const express = require('express');
const repository = require('../repository');
const { authenticate } = require('../middleware/auth');
const { formatUserData } = require('../utils/userUtils');

const router = express.Router();
router.use(authenticate);
router.get('/', async (req, res, next) => {
  try { res.json({ success: true, data: (await repository.listUsers({ includeAdmin: false })).map(formatUserData) }); }
  catch (error) { next(error); }
});
router.get('/class/:classId', async (req, res, next) => {
  try {
    if (!(await repository.getClass(req.params.classId))) return res.status(404).json({ success: false, message: '班级不存在' });
    res.json({ success: true, data: (await repository.listUsers({ includeAdmin: false, classId: req.params.classId })).map(formatUserData) });
  } catch (error) { next(error); }
});
router.get('/user/:id', async (req, res, next) => {
  try {
    const user = await repository.getUserById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ success: false, message: '用户不存在' });
    res.json({ success: true, data: formatUserData(user) });
  } catch (error) { next(error); }
});
module.exports = router;
