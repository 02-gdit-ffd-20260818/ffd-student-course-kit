const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
// 一个后端进程共享同一份内存数据。调用 write 才落盘；重启才重新读取文件。
// 这样 TODO02 的重名检查可以先完成，不依赖 TODO03 的文件写入。
let sharedConnection = null;

// 简单的数据库连接函数
const connectDB = async () => {
  if (sharedConnection) return sharedConnection;
  try {
    let data = { users: [], synonymGroups: [] };
    
    // 如果数据库文件存在，读取它
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, 'utf8');
      try {
        data = JSON.parse(fileData);
      } catch (e) {
        throw new Error(`数据文件不是有效 JSON，已停止读取且未覆盖原文件：${dbPath}`);
      }
    }
    
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('db.json 根节点必须是对象；请修复或从备份恢复，不要覆盖原文件');
    }
    for (const key of ['users', 'classes', 'synonymGroups']) {
      if (data[key] !== undefined && !Array.isArray(data[key])) throw new Error(`db.json 的 ${key} 必须是数组`);
    }
    // 确保有users数组
    if (!data.users) {
      data.users = [];
    }
    
    // 确保有synonymGroups数组
    if (!data.synonymGroups) {
      data.synonymGroups = [];
    }
    
    // 向后兼容：如果还有旧的synonyms数组，将其转换为synonymGroups
    if (data.synonyms && Array.isArray(data.synonyms) && data.synonyms.length > 0) {
      console.log('检测到旧的同义词数据，正在迁移...');
      data.synonymGroups = data.synonyms.map((group, index) => ({
        id: `migrated-${index}`,
        name: `迁移的同义词组 ${index + 1}`,
        category: '未分类',
        synonyms: group
      }));
      delete data.synonyms; // 删除旧的同义词数组
      console.log('同义词数据迁移完成');
    }
    
    // 返回数据库对象
    sharedConnection = {
      data,
      write: async () => {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      }
    };
    return sharedConnection;
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
};

module.exports = { connectDB };
