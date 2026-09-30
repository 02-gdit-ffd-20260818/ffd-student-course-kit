/**
 * 用户数据格式化工具
 * 统一处理用户数据格式化逻辑
 */

/**
 * 格式化用户数据，确保包含profile字段和头像
 * @param {Object} user - 用户对象
 * @param {Object} db - 数据库对象
 * @returns {Object} 格式化后的用户对象
 */
const formatUserData = (user, db) => {
  // 确保返回的数据结构与前端期望的一致
  const { password: _, ...userInfo } = user;
  
  // 获取班级信息（如果有班级ID）
  let classInfo = null;
  if (user.classId && db && db.data.classes) {
    classInfo = db.data.classes.find(c => c.id === user.classId);
  }
  
  return {
    ...userInfo,
    // 确保有头像字段，如果没有则生成默认头像
    avatar: user.avatar || `https://picsum.photos/seed/${user.email}/200/200.jpg`,
    classId: user.classId || null,
    className: classInfo ? classInfo.name : null,
    // 创建或完善profile字段
    profile: user.profile || {
      name: user.name || '',
      hometown: '',
      phone: '',
      hobbies: [],
      bio: ''
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
};

module.exports = {
  formatUserData
};