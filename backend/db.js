const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

// 简单的数据库连接函数
const connectDB = async () => {
  try {
    let data = { users: [], synonymGroups: [] };
    
    // 如果数据库文件存在，读取它
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, 'utf8');
      try {
        data = JSON.parse(fileData);
      } catch (e) {
        console.log('数据库文件损坏，重新创建');
        data = { users: [], synonymGroups: [] };
      }
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
    return {
      data,
      write: async () => {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      }
    };
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
};

module.exports = { connectDB };