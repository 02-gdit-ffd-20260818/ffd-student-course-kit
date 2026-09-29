const express = require('express');
const router = express.Router();
const { connectDB } = require('../db');
const { normalizeAvatar } = require('../utils/userUtils');

// 获取所有用户（用于照片墙）
router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    
    // 获取所有用户，过滤掉管理员账号（role为'admin'的用户）
    const users = db.data.users ? db.data.users.filter(user => user.role !== 'admin') : [];
    
    // 为每个用户添加班级信息和默认头像
    const usersWithClassInfo = users.map(user => {
      let className = '未分配班级';
      
      if (user.classId && db.data.classes) {
        const classDoc = db.data.classes.find(c => c.id === user.classId);
        if (classDoc) {
          className = classDoc.name;
        }
      }
      
      // 移除敏感信息
      const { password, ...safeUser } = user;
      
      return {
        ...safeUser,
        // 确保有头像字段，如果没有则生成默认头像
        avatar: normalizeAvatar(user.avatar),
        className
      };
    });
    
    res.json({
      success: true,
      data: usersWithClassInfo
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error.message
    });
  }
});

// 根据班级ID获取用户
router.get('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const db = await connectDB();
    
    // 验证班级是否存在
    const classDoc = db.data.classes ? db.data.classes.find(c => c.id === classId) : null;
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: '班级不存在'
      });
    }
    
    // 获取该班级的所有用户，过滤掉管理员账号（role为'admin'的用户）
    const users = db.data.users ? db.data.users.filter(user => user.classId === classId && user.role !== 'admin') : [];
    
    // 为每个用户添加班级信息
          // ============ TODO 05（中等）：绝对不能把密码发到前端 ============
      // 页面上看得到的结果：F12 → Network → 照片墙那条请求的响应里，
      // **搜 password 搜不到**。
      //
      // TODO：用解构赋值把 password 挑出去：
      //   const { password, ...safeUser } = user
      //   意思是"把 password 单独取出来（然后不用它），
      //   剩下的全部收进 safeUser"。
      //
      // 这是 JavaScript 里剔除字段最简洁的写法。
      // 对比 delete user.password——那会**改动原对象**，
      // 而原对象还挂在 db.data 上，改了就等于把内存里的数据弄坏了。
      //
      // **凡是要发给前端的对象，都要先想一想：里面有没有不该出去的字段。**
      // ========================================================
    const usersWithClassInfo = users.map(user => {
      const safeUser = user;
      
      return {
        ...safeUser,
        // 确保有头像字段，如果没有则生成默认头像
        avatar: normalizeAvatar(user.avatar),
        className: classDoc.name
      };
    });
    
    res.json({
      success: true,
      data: usersWithClassInfo
    });
  } catch (error) {
    console.error('获取班级用户失败:', error);
    res.status(500).json({
      success: false,
      message: '获取班级用户失败',
      error: error.message
    });
  }
});

// 获取单个用户详情
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();
    
    // 查找用户
    const user = db.data.users ? db.data.users.find(u => u.id === id) : null;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 获取班级信息
    let className = '未分配班级';
    if (user.classId && db.data.classes) {
      const classDoc = db.data.classes.find(c => c.id === user.classId);
      if (classDoc) {
        className = classDoc.name;
      }
    }
    
    // 移除敏感信息
    const { password, ...safeUser } = user;
    
    // 返回用户详情
    res.json({
      success: true,
      data: {
        ...safeUser,
        // 确保有头像字段，如果没有则生成默认头像
        avatar: normalizeAvatar(user.avatar),
        className
      }
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户详情失败',
      error: error.message
    });
  }
});

module.exports = router;
