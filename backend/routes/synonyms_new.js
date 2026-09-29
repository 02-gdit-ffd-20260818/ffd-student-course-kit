const express = require('express');
const router = express.Router();
const { connectDB } = require('../db');
const adminAuth = require('../middleware/adminAuth');

// 获取所有同义词组
router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    
    // 如果同义词数据不存在，初始化一个空数组
    if (!db.data.synonymGroups) {
      db.data.synonymGroups = [];
      await db.write();
    }
    
    res.json({
      success: true,
      data: db.data.synonymGroups
    });
  } catch (error) {
    console.error('获取同义词错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取所有同义词（扁平化，用于搜索）
router.get('/all', async (req, res) => {
  try {
    const db = await connectDB();
    
    // 如果同义词数据不存在，初始化一个空数组
    if (!db.data.synonymGroups) {
      db.data.synonymGroups = [];
      await db.write();
    }
    
    // 将所有同义词组合并成一个数组，保持向后兼容
    const allSynonyms = db.data.synonymGroups.flatMap(group => group.synonyms);
    
    res.json({
      success: true,
      data: allSynonyms
    });
  } catch (error) {
    console.error('获取同义词错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 添加同义词组
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, category, synonyms } = req.body;
    
    // 验证输入
    if (!name || !category || !synonyms || !Array.isArray(synonyms) || synonyms.length < 2) {
      return res.status(400).json({ message: '请提供组名、分类和至少两个同义词' });
    }
    
    // 去重并转换为小写
    const normalizedSynonyms = [...new Set(synonyms.map(s => s.trim().toLowerCase()))];
    
    if (normalizedSynonyms.length < 2) {
      return res.status(400).json({ message: '至少需要提供两个不同的同义词' });
    }
    
    const db = await connectDB();
    
    // 如果同义词数据不存在，初始化一个空数组
    if (!db.data.synonymGroups) {
      db.data.synonymGroups = [];
    }
    
    // 检查是否与现有同义词组有重叠
    for (const existingGroup of db.data.synonymGroups) {
      const hasOverlap = normalizedSynonyms.some(synonym => 
        existingGroup.synonyms.includes(synonym)
      );
      
      if (hasOverlap) {
        // 合并同义词组
        const mergedSynonyms = [...new Set([...existingGroup.synonyms, ...normalizedSynonyms])];
        
        // 更新现有组
        const groupIndex = db.data.synonymGroups.indexOf(existingGroup);
        db.data.synonymGroups[groupIndex] = {
          id: existingGroup.id,
          name: existingGroup.name,
          category: existingGroup.category,
          synonyms: mergedSynonyms
        };
        
        await db.write();
        
        return res.json({
          success: true,
          message: '同义词已合并到现有组',
          data: db.data.synonymGroups[groupIndex]
        });
      }
    }
    
    // 添加新的同义词组
    const newGroup = {
      id: Date.now().toString(),
      name,
      category,
      synonyms: normalizedSynonyms
    };
    
    db.data.synonymGroups.push(newGroup);
    await db.write();
    
    res.json({
      success: true,
      message: '同义词组添加成功',
      data: newGroup
    });
  } catch (error) {
    console.error('添加同义词错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新同义词组
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, synonyms } = req.body;
    
    // 验证输入
    if (!name || !category || !synonyms || !Array.isArray(synonyms) || synonyms.length < 2) {
      return res.status(400).json({ message: '请提供组名、分类和至少两个同义词' });
    }
    
    // 去重并转换为小写
    const normalizedSynonyms = [...new Set(synonyms.map(s => s.trim().toLowerCase()))];
    
    if (normalizedSynonyms.length < 2) {
      return res.status(400).json({ message: '至少需要提供两个不同的同义词' });
    }
    
    const db = await connectDB();
    
    // 如果同义词数据不存在，返回错误
    if (!db.data.synonymGroups) {
      return res.status(404).json({ message: '同义词数据不存在' });
    }
    
    // 查找要更新的组
    const groupIndex = db.data.synonymGroups.findIndex(group => group.id === id);
    
    if (groupIndex === -1) {
      return res.status(404).json({ message: '同义词组不存在' });
    }
    
    // 更新同义词组
    db.data.synonymGroups[groupIndex] = {
      id,
      name,
      category,
      synonyms: normalizedSynonyms
    };
    
    await db.write();
    
    res.json({
      success: true,
      message: '同义词组更新成功',
      data: db.data.synonymGroups[groupIndex]
    });
  } catch (error) {
    console.error('更新同义词错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除同义词组
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = await connectDB();
    
    // 如果同义词数据不存在，返回错误
    if (!db.data.synonymGroups) {
      return res.status(404).json({ message: '同义词数据不存在' });
    }
    
    // 查找要删除的组
    const groupIndex = db.data.synonymGroups.findIndex(group => group.id === id);
    
    if (groupIndex === -1) {
      return res.status(404).json({ message: '同义词组不存在' });
    }
    
    // 删除同义词组
    db.data.synonymGroups.splice(groupIndex, 1);
    await db.write();
    
    res.json({
      success: true,
      message: '同义词组删除成功'
    });
  } catch (error) {
    console.error('删除同义词错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 初始化默认同义词组
router.post('/init', adminAuth, async (req, res) => {
  try {
    const db = await connectDB();
    
    // 初始化同义词组
    db.data.synonymGroups = [
      {
        id: 'sports',
        name: '运动类',
        category: '运动',
        synonyms: ['篮球', '篮球运动', 'basketball', '打篮球', '足球', '足球运动', 'soccer', 'football', '踢足球', '羽毛球', 'badminton', '运动', 'sports']
      },
      {
        id: 'programming',
        name: '编程类',
        category: '技术',
        synonyms: ['编程', '程序设计', 'programming', 'coding', '写代码', '软件开发']
      },
      {
        id: 'reading',
        name: '阅读类',
        category: '文化',
        synonyms: ['阅读', '读书', 'reading', '看书', '阅读书籍']
      },
      {
        id: 'travel',
        name: '旅行类',
        category: '休闲',
        synonyms: ['旅行', '旅游', 'travel', '出游', '观光']
      },
      {
        id: 'photography',
        name: '摄影类',
        category: '艺术',
        synonyms: ['摄影', '拍照', 'photography', '照相', '拍摄']
      },
      {
        id: 'food',
        name: '美食类',
        category: '美食',
        synonyms: ['美食', '美食探店', 'food', '品尝美食', '美食文化']
      },
      {
        id: 'gaming',
        name: '游戏类',
        category: '娱乐',
        synonyms: ['游戏', '玩游戏', 'gaming', '电子游戏', '电竞']
      },
      {
        id: 'movie',
        name: '电影类',
        category: '娱乐',
        synonyms: ['电影', '看电影', 'movie', 'film', '观影']
      },
      {
        id: 'music',
        name: '音乐类',
        category: '艺术',
        synonyms: ['音乐', 'music', '听音乐', '音乐欣赏']
      }
    ];
    
    await db.write();
    
    res.json({
      success: true,
      message: '同义词组初始化成功',
      data: db.data.synonymGroups
    });
  } catch (error) {
    console.error('初始化同义词错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;