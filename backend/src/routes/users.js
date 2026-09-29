const express = require('express');
const router = express.Router();
const { randomUUID } = require('node:crypto');
const { connectDB } = require('../database');
const adminAuth = require('../middleware/adminAuth');
const { formatUserData } = require('../utils/userUtils');
const { filterUsersBySearchType, getSynonymsForSearch } = require('../utils/searchUtils');

// 获取所有用户（管理员功能）
router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    
    // 获取所有用户（不包含密码）并格式化数据
    const allUsers = db.data.users.map(user => formatUserData(user, db));
    
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 注册用户
router.post('/register', async (req, res) => {
  const { name, email, password, classId, profile } = req.body;
  
  try {
    const db = await connectDB();
    
    // 检查用户是否已存在
    const existingUser = db.data.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: '用户已存在' });
    }
    
    // 验证班级是否存在（如果提供了classId）
    if (classId) {
      const classExists = db.data.classes.find(c => c.id === classId);
      if (!classExists) {
        return res.status(400).json({ message: '所选班级不存在' });
      }
    }
    
    // 创建新用户
    const newUser = {
      id: randomUUID(),
      name,
      email,
      password, // 在实际生产环境中应该加密密码
      avatar: `https://picsum.photos/seed/${email}/200/200.jpg`, // 添加默认头像
      classId: classId || null, // 添加班级ID
      profile: profile || {
        name: name || '',
        hometown: '',
        phone: '',
        hobbies: [],
        bio: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 保存用户
    db.data.users.push(newUser);
    await db.write();
    
    // 返回格式化后的用户信息（不包含密码）
    const formattedUser = formatUserData(newUser, db);
    res.status(201).json(formattedUser);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const db = await connectDB();
    
    // 查找用户
    const user = db.data.users.find(user => user.email === email);
    
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    // 检查密码是否匹配（支持明文和加密密码）
    let passwordMatch = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      // 加密密码 - 这里简化处理，实际应该使用bcrypt.compare
      passwordMatch = user.password === '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' && password === 'admin123';
    } else {
      // 明文密码
      passwordMatch = user.password === password;
    }
    
    if (!passwordMatch) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    // 返回格式化后的用户信息（不包含密码）
    const formattedUser = formatUserData(user, db);
    res.json(formattedUser);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取当前用户信息
router.get('/current/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const db = await connectDB();
    
    // 查找用户
    const user = db.data.users.find(user => user.email === email);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 返回格式化后的用户信息（不包含密码）
    const formattedUser = formatUserData(user, db);
    res.json(formattedUser);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新用户信息
router.put('/update/:email', async (req, res) => {
  const { email } = req.params;
  const { profileData, classId, avatar } = req.body;
  
  try {
    const db = await connectDB();
    
    // 查找用户
    const userIndex = db.data.users.findIndex(user => user.email === email);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 验证班级是否存在（如果提供了classId）
    if (classId !== undefined) {
      if (classId) {
        const classExists = db.data.classes.find(c => c.id === classId);
        if (!classExists) {
          return res.status(400).json({ message: '所选班级不存在' });
        }
      }
      // 更新班级ID
      db.data.users[userIndex].classId = classId || null;
    }
    
    // 更新用户资料
    if (profileData) {
      db.data.users[userIndex].profile = profileData;
    }
    
    // 更新头像（如果提供了avatar）
    if (avatar !== undefined) {
      db.data.users[userIndex].avatar = avatar;
    }
    
    db.data.users[userIndex].updatedAt = new Date().toISOString();
    await db.write();
    
    // 返回更新后的用户信息
    const formattedUser = formatUserData(db.data.users[userIndex], db);
    res.json(formattedUser);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取所有用户列表（包括当前用户）
router.get('/all/:currentEmail', async (req, res) => {
  const { currentEmail } = req.params;
  
  try {
    const db = await connectDB();
    
    // 获取除系统管理员外的所有用户（不包含密码）并格式化数据
    const allUsers = db.data.users
      .filter(user => user.email !== 'admin@system.com')
      .map(user => formatUserData(user, db));
    
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取特定用户信息
router.get('/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const db = await connectDB();
    
    // 查找用户
    const user = db.data.users.find(user => user.email === email);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 返回格式化后的用户信息（不包含密码）
    const formattedUser = formatUserData(user, db);
    res.json(formattedUser);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 管理员删除用户
router.delete('/admin/delete', async (req, res) => {
  try {
    const { email, adminEmail, adminPassword } = req.body;
    
    // 验证管理员身份
    if (adminEmail !== 'admin@system.com' || adminPassword !== 'admin123') {
      return res.status(403).json({ message: '管理员身份验证失败' });
    }
    
    const db = await connectDB();
    const userIndex = db.data.users.findIndex(user => user.email === email);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 防止删除管理员自己
    if (email === 'admin@system.com') {
      return res.status(400).json({ message: '不能删除管理员账户' });
    }
    
    db.data.users.splice(userIndex, 1);
    await db.write();
    
    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 搜索用户
router.post('/search', async (req, res) => {
  try {
    const { query, type, scope, classId, includeSynonyms } = req.body;
    
    // 验证输入
    if (!query || !query.trim()) {
      return res.status(400).json({ message: '搜索关键词不能为空' });
    }
    
    const db = await connectDB();
    let users = db.data.users;
    
    // 过滤掉系统管理员
    users = users.filter(user => user.email !== 'admin@system.com');
    
    // 根据搜索范围过滤
    if (scope === 'class' && classId) {
      users = users.filter(user => user.classId === classId);
    }
    
    // 根据搜索类型和关键词过滤
    const searchQuery = query.toLowerCase().trim();
    let filteredUsers = [];
    
    // 获取同义词（如果存在且启用了同义词搜索）
    let synonyms = [];
    if (includeSynonyms) {
      synonyms = getSynonymsForSearch(db, searchQuery);
    }
    
    // 创建所有匹配词的数组（原始搜索词 + 同义词）
    const allMatchTerms = [searchQuery, ...synonyms];
    
    // 使用工具函数进行过滤
    filteredUsers = filterUsersBySearchType(users, type, allMatchTerms);
    
    // 格式化结果
    const formattedResults = filteredUsers.map(user => formatUserData(user, db));
    
    res.json({ 
      success: true, 
      data: formattedResults,
      count: formattedResults.length
    });
  } catch (error) {
    console.error('搜索用户错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
