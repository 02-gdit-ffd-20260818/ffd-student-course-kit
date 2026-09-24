const express = require('express');
const { randomUUID } = require('node:crypto');
const bcrypt = require('bcryptjs');
const repository = require('../repository');
const { authenticate, requireAdmin, requireSelfOrAdmin, signToken } = require('../middleware/auth');
const { formatUserData } = require('../utils/userUtils');
const { filterUsersBySearchType, getSynonymsForSearch } = require('../utils/searchUtils');

const router = express.Router();
const withToken = user => ({ ...formatUserData(user), token: signToken(user) });
const clientIp = req => req.ip?.replace('::ffff:', '');

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, classId, profile } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: '姓名、邮箱和密码不能为空' });
    if (password.length < 8) return res.status(400).json({ message: '密码至少需要 8 位' });
    if (await repository.getUserByEmail(email)) return res.status(400).json({ message: '用户已存在' });
    if (classId && !(await repository.getClass(classId))) return res.status(400).json({ message: '所选班级不存在' });
    const now = new Date().toISOString();
    const user = await repository.createUser({
      id: randomUUID(), name, email, password: await bcrypt.hash(password, 12),
      avatar: `https://picsum.photos/seed/${encodeURIComponent(email)}/200/200.jpg`,
      classId: classId || null, role: 'user', profile: profile || { name, hometown: '', phone: '', hobbies: [], bio: '' },
      createdAt: now, updatedAt: now
    });
    await repository.audit({ actor: user, action: 'register', entityType: 'user', entityId: user.id, ip: clientIp(req) });
    res.status(201).json(withToken(user));
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = email ? await repository.getUserByEmail(email) : null;
    if (!user) return res.status(401).json({ message: '邮箱或密码错误' });
    const matched = await bcrypt.compare(password || '', user.password || '');
    if (!matched) return res.status(401).json({ message: '邮箱或密码错误' });
    await repository.audit({ actor: user, action: 'login', entityType: 'session', entityId: user.id, ip: clientIp(req) });
    res.json(withToken(user));
  } catch (error) { next(error); }
});

router.use(authenticate);

router.get('/', requireAdmin, async (req, res, next) => {
  try { res.json((await repository.listUsers()).map(formatUserData)); } catch (error) { next(error); }
});
router.get('/current/:email', requireSelfOrAdmin('email'), async (req, res, next) => {
  try {
    const user = await repository.getUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ message: '用户不存在' });
    res.json(withToken(user));
  } catch (error) { next(error); }
});
router.put('/update/:email', requireSelfOrAdmin('email'), async (req, res, next) => {
  try {
    const { profileData, classId, avatar } = req.body;
    if (classId && !(await repository.getClass(classId))) return res.status(400).json({ message: '所选班级不存在' });
    const user = await repository.updateUser(req.params.email, {
      hasProfile: profileData !== undefined, profile: profileData,
      hasClassId: classId !== undefined, classId,
      hasAvatar: avatar !== undefined, avatar
    });
    if (!user) return res.status(404).json({ message: '用户不存在' });
    await repository.audit({ actor: req.user, action: 'update', entityType: 'user', entityId: user.id, ip: clientIp(req) });
    res.json(withToken(user));
  } catch (error) { next(error); }
});
router.get('/all/:currentEmail', async (req, res, next) => {
  try { res.json((await repository.listUsers({ includeAdmin: false })).map(formatUserData)); } catch (error) { next(error); }
});
router.delete('/admin/delete', requireAdmin, async (req, res, next) => {
  try {
    if (!req.body.email) return res.status(400).json({ message: '请指定用户' });
    const deleted = await repository.deleteUser(req.body.email);
    if (!deleted) return res.status(404).json({ message: '用户不存在或不能删除管理员' });
    await repository.audit({ actor: req.user, action: 'delete', entityType: 'user', entityId: deleted.id, details: { email: req.body.email }, ip: clientIp(req) });
    res.json({ message: '用户删除成功' });
  } catch (error) { next(error); }
});
router.post('/search', async (req, res, next) => {
  try {
    const { query, type, scope, classId, includeSynonyms } = req.body;
    if (!query?.trim()) return res.status(400).json({ message: '搜索关键词不能为空' });
    const users = await repository.listUsers({ includeAdmin: false, classId: scope === 'class' ? classId : undefined });
    const normalized = query.toLowerCase().trim();
    const synonyms = includeSynonyms ? getSynonymsForSearch(await repository.listSynonyms(), normalized) : [];
    const data = filterUsersBySearchType(users, type, [normalized, ...synonyms]).map(formatUserData);
    res.json({ success: true, data, count: data.length });
  } catch (error) { next(error); }
});
router.get('/:email', async (req, res, next) => {
  try {
    const user = await repository.getUserByEmail(req.params.email);
    if (!user || user.role === 'admin') return res.status(404).json({ message: '用户不存在' });
    res.json(formatUserData(user));
  } catch (error) { next(error); }
});

module.exports = router;
