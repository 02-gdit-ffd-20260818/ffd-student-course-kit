const express = require('express');
const repository = require('../repository');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const normalize = words => [...new Set(words.map(word => String(word).trim().toLowerCase()).filter(Boolean))];
const validate = body => body.name && body.category && Array.isArray(body.synonyms) && normalize(body.synonyms).length >= 2;

router.use(authenticate);
router.get('/', async (req, res, next) => {
  try { res.json({ success: true, data: await repository.listSynonyms() }); } catch (error) { next(error); }
});
router.get('/all', async (req, res, next) => {
  try { res.json({ success: true, data: (await repository.listSynonyms()).flatMap(group => group.synonyms) }); } catch (error) { next(error); }
});
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    if (!validate(req.body)) return res.status(400).json({ message: '请提供组名、分类和至少两个同义词' });
    const words = normalize(req.body.synonyms);
    const existing = (await repository.listSynonyms()).find(group => words.some(word => group.synonyms.includes(word)));
    const data = existing
      ? await repository.updateSynonym(existing.id, { ...existing, synonyms: normalize([...existing.synonyms, ...words]) })
      : await repository.createSynonym({ id: Date.now().toString(), name: req.body.name, category: req.body.category, synonyms: words });
    await repository.audit({ actor: req.user, action: existing ? 'merge' : 'create', entityType: 'synonym_group', entityId: data.id, ip: req.ip });
    res.json({ success: true, message: existing ? '同义词已合并到现有组' : '同义词组添加成功', data });
  } catch (error) { next(error); }
});
router.post('/init', requireAdmin, async (req, res, next) => {
  try {
    const groups = require('../../data/seed.json').synonymGroups;
    await repository.replaceSynonyms(groups);
    await repository.audit({ actor: req.user, action: 'initialize', entityType: 'synonym_group', ip: req.ip });
    res.json({ success: true, message: '同义词组初始化成功', data: groups });
  } catch (error) { next(error); }
});
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!validate(req.body)) return res.status(400).json({ message: '请提供组名、分类和至少两个同义词' });
    const data = await repository.updateSynonym(req.params.id, { ...req.body, synonyms: normalize(req.body.synonyms) });
    if (!data) return res.status(404).json({ message: '同义词组不存在' });
    await repository.audit({ actor: req.user, action: 'update', entityType: 'synonym_group', entityId: data.id, ip: req.ip });
    res.json({ success: true, message: '同义词组更新成功', data });
  } catch (error) { next(error); }
});
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!(await repository.deleteSynonym(req.params.id))) return res.status(404).json({ message: '同义词组不存在' });
    await repository.audit({ actor: req.user, action: 'delete', entityType: 'synonym_group', entityId: req.params.id, ip: req.ip });
    res.json({ success: true, message: '同义词组删除成功' });
  } catch (error) { next(error); }
});
module.exports = router;
