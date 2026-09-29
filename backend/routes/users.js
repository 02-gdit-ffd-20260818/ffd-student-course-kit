const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { connectDB } = require('../db');
const adminAuth = require('../middleware/adminAuth');
const { formatUserData } = require('../utils/userUtils');
const { filterUsersBySearchType, getSynonymsForSearch } = require('../utils/searchUtils');

// 获取所有用户（管理员功能）
router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    
    // 获取所有用户（不包含密码）并格式化数据
        // ============ TODO 01（极简单）：让 GET /api/users 真正返回数据 ============
    // 现在这里直接返回空数组，所以照片墙是一片空白。
    //
    // 页面上看得到的结果：刷新照片墙，**全班同学的卡片都出现了**。
    // 这是本课第一个、也是最直观的一个效果。
    //
    // TODO 两步：
    //   1) 把 db.data.users 用 formatUserData(user, db) 逐个格式化
    //      （这个函数的作用是**去掉密码字段**，顺便补上班级名）
    //   2) 用 res.json(...) 返回
    //
    // 想一想 formatUserData 为什么必须用：db.data.users 里每条都带着
    // password 字段。直接 res.json(db.data.users) 会**把所有人的密码
    // 发到浏览器**，F12 一看全在。这是很常见的一类泄密。
    // ==============================================================
    res.json([]);
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
        // ============ TODO 02（简单）：同一个邮箱不能注册两次 ============
    // JSON 文件**没有任何约束能力**——它就是一段文本。
    // 数据库能用 UNIQUE 帮你挡住重复，JSON 文件只能靠代码自己查。
    //
    // 页面上看得到的结果：用已经注册过的邮箱再注册一次，
    // 提示「用户已存在」，而不是悄悄生成两个同邮箱账号
    // （那样登录时不知道该认哪一个）。
    //
    // TODO：先用 find 查一遍，查到就返回 400。
    //
    // **这一条要记住，第 13 课会形成对照**：换成 SQLite 之后，
    // 同样的保护可以交给 UNIQUE 约束，代码里这一段就变成"给人说人话"的角色。
    // ========================================================
    
    // 每位普通用户必须加入一个存在的班级，照片墙才能按班级隔离。
    if (!classId) {
      return res.status(400).json({ message: '请选择班级' });
    }
    const classExists = (db.data.classes || []).find(c => c.id === classId);
    if (!classExists) {
      return res.status(400).json({ message: '所选班级不存在' });
    }
    
    // 创建新用户
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password, // 在实际生产环境中应该加密密码
      avatar: '', // 前端使用项目内置头像，避免依赖外部图片服务
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
        // ============ TODO 03（简单）：把新用户真正写进文件 ============
    // 下面这一行只改了**内存里的数组**。进程一退出，内存就没了。
    //
    // 页面上看得到的结果：
    //   做之前：注册成功、刷新页面还在，但**重启后端就消失**。
    //   做之后：重启后端，新用户仍然在——这就是「持久化」。
    //
    // TODO：补上一行，把内存中的数据整体写回 db.json。
    //       提示：connectDB() 返回的对象里有一个 write 方法，它是异步的。
    //
    // **一定要亲手做一次"注册 → 重启后端 → 看数据没了"的实验**，
    // 再补上这一行。这个对比是整个项目 3 的起点：
    // 数据存在哪，决定了它活多久。
    // ======================================================
    db.data.users.push(newUser);
    // 返回格式化后的用户信息（不包含密码）
    const formattedUser = formatUserData(newUser, db);
    res.status(201).json(formattedUser);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 管理员新增用户：初始密码可指定，未指定时统一为 123456。
router.post('/admin/create', adminAuth, async (req, res) => {
  const { name, email, classId, password = '123456', profile } = req.body;
  try {
    if (!name || !email || !classId) {
      return res.status(400).json({ message: '姓名、邮箱和班级均为必填项' });
    }
    const db = await connectDB();
    if (db.data.users.some(user => user.email === email)) {
      return res.status(400).json({ message: '该邮箱已被使用' });
    }
    if (!(db.data.classes || []).some(classInfo => classInfo.id === classId)) {
      return res.status(400).json({ message: '所选班级不存在' });
    }
    const newUser = {
      id: uuidv4(), name, email, password, classId,
      avatar: '',
      profile: profile || { name, hometown: '', phone: '', hobbies: [], bio: '' },
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    db.data.users.push(newUser);
    await db.write();
    res.status(201).json(formatUserData(newUser, db));
  } catch (error) {
    res.status(500).json({ message: '创建用户失败', error: error.message });
  }
});

// 管理员强制将普通用户密码重置为教学默认密码 123456。
router.put('/admin/reset-password/:email', adminAuth, async (req, res) => {
  try {
    const db = await connectDB();
    const user = db.data.users.find(item => item.email === req.params.email);
    if (!user) return res.status(404).json({ message: '用户不存在' });
    if (user.role === 'admin' || user.email === 'admin@system.com') {
      return res.status(400).json({ message: '不能重置管理员密码' });
    }
    user.password = '123456';
    user.updatedAt = new Date().toISOString();
    await db.write();
    res.json({ message: '密码已重置为 123456' });
  } catch (error) {
    res.status(500).json({ message: '重置密码失败', error: error.message });
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
    
        // ============ TODO 04（简单）：密码不对不能放行 ============
    // 页面上看得到的结果：故意输错密码，提示「邮箱或密码错误」；
    // 输对了能进去。
    //
    // TODO：密码不匹配就返回 401。
    //
    // 注意上面的提示语：**查无此人和密码错误返回的是同一句话**。
    // 分开提示的话，攻击者能靠它一个个试出哪些邮箱真实存在
    // （这叫用户名枚举）。
    //
    // 再注意一件更重要的事：这一版的密码是**明文存在 db.json 里**的。
    // 打开那个文件，所有人的密码一览无余。
    // **第 14 课会专门解决这个问题**（bcrypt 摘要）。
    // 现在先看清楚"不加密是什么样子"，到时候对比才有感觉。
    // ==================================================
    
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
