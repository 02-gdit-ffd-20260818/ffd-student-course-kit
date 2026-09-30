const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { connectDB } = require('../db');
const adminAuth = require('../middleware/adminAuth');

// 获取所有班级
router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    const classes = (db.data.classes || []).map(classInfo => ({
      ...classInfo,
      studentCount: (db.data.users || []).filter(
        user => user.role !== 'admin' && user.classId === classInfo.id
      ).length
    }));
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取特定班级信息
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = await connectDB();
    const storedClass = db.data.classes.find(c => c.id === id);
    
    if (!storedClass) {
      return res.status(404).json({ message: '班级不存在' });
    }

    const classInfo = {
      ...storedClass,
      studentCount: (db.data.users || []).filter(
        user => user.role !== 'admin' && user.classId === storedClass.id
      ).length
    };
    
    res.json(classInfo);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 创建新班级（仅管理员）
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, teacher } = req.body;
    
    // 验证必填字段
    if (!name) {
      return res.status(400).json({ message: '班级名称不能为空' });
    }
    
    const db = await connectDB();
    
    // 检查班级名称是否已存在
    const existingClass = db.data.classes.find(c => c.name === name);
    if (existingClass) {
      return res.status(400).json({ message: '班级名称已存在' });
    }
    
    // 创建新班级
    const newClass = {
      id: uuidv4(),
      name,
      description: description || '',
      teacher: teacher || '',
      createdAt: new Date().toISOString()
    };
    
    // 保存班级
    db.data.classes.push(newClass);
    await db.write();
    
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新班级信息（仅管理员）
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, teacher } = req.body;
    
    const db = await connectDB();
    
    // 查找班级
    const classIndex = db.data.classes.findIndex(c => c.id === id);
    
    if (classIndex === -1) {
      return res.status(404).json({ message: '班级不存在' });
    }
    
    // 检查班级名称是否已存在（排除当前班级）
    if (name && name !== db.data.classes[classIndex].name) {
      const existingClass = db.data.classes.find(c => c.name === name);
      if (existingClass) {
        return res.status(400).json({ message: '班级名称已存在' });
      }
    }
    
    // 更新班级信息
    if (name) db.data.classes[classIndex].name = name;
    if (description !== undefined) db.data.classes[classIndex].description = description;
    if (teacher !== undefined) db.data.classes[classIndex].teacher = teacher;
    db.data.classes[classIndex].updatedAt = new Date().toISOString();
    
    await db.write();
    
    res.json(db.data.classes[classIndex]);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除班级（仅管理员）
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = await connectDB();
    
    // 查找班级
    const classIndex = db.data.classes.findIndex(c => c.id === id);
    
    if (classIndex === -1) {
      return res.status(404).json({ message: '班级不存在' });
    }
    
    // 检查班级中是否有学生
    const studentsInClass = db.data.users.filter(user => user.classId === id);
    if (studentsInClass.length > 0) {
      return res.status(400).json({ 
        message: '班级中还有学生，无法删除',
        studentsCount: studentsInClass.length
      });
    }
    
    // 删除班级
    db.data.classes.splice(classIndex, 1);
    await db.write();
    
    res.json({ message: '班级删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取班级中的学生
router.get('/:id/students', async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = await connectDB();
    
    // 验证班级是否存在
    const classInfo = db.data.classes.find(c => c.id === id);
    if (!classInfo) {
      return res.status(404).json({ message: '班级不存在' });
    }
    
    // 获取班级中的学生
    const students = db.data.users
      .filter(user => user.classId === id)
      .map(user => {
        const { password, ...userInfo } = user;
        return userInfo;
      });
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
