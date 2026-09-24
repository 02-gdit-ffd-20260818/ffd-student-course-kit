const express = require('express');
const router = express.Router();
const { connectDB } = require('../database');

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
        avatar: user.avatar || `https://picsum.photos/seed/${user.email}/200/200.jpg`,
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
    const usersWithClassInfo = users.map(user => {
      // 移除敏感信息
      const { password, ...safeUser } = user;
      
      return {
        ...safeUser,
        // 确保有头像字段，如果没有则生成默认头像
        avatar: user.avatar || `https://picsum.photos/seed/${user.email}/200/200.jpg`,
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
        avatar: user.avatar || `https://picsum.photos/seed/${user.email}/200/200.jpg`,
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
