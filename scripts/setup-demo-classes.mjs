import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const databasePath = path.join(projectRoot, 'backend', 'db.json')
const database = JSON.parse(await readFile(databasePath, 'utf8'))

const classDefinitions = [
  {
    id: 'class-test-1',
    name: '测试1班',
    description: '照片墙演示班级，共30名学生',
    teacher: '测试教师1',
    targetCount: 30
  },
  {
    id: 'class-test-2',
    name: '测试2班',
    description: '照片墙演示班级，共10名学生',
    teacher: '测试教师2',
    targetCount: 10
  },
  {
    id: 'class-test-3',
    name: '测试3班',
    description: '照片墙演示班级，共2名学生',
    teacher: '测试教师3',
    targetCount: 2
  }
]

const studentNames = [
  '江砚', '林溪', '沈知微', '许清和', '苏木', '陆川', '温言', '顾舟',
  '周既明', '叶听澜', '程见月', '宋知许', '白露', '秦川', '夏栀', '贺云归',
  '唐宁', '楚辞', '傅青禾', '姜南星', '谢景行', '乔松', '宁远', '裴安',
  '洛川', '时雨', '云舒', '景明', '罗清越', '韩怀瑾', '徐知夏', '郑星野',
  '梁予安', '陈若溪', '方听雪', '赵昭然', '孙明澈', '何嘉禾', '吴长风', '曹望舒',
  '彭青岚', '袁亦安'
]
const hometowns = ['北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '武汉']
const hobbySets = [
  ['摄影', '旅行'],
  ['阅读', '音乐'],
  ['运动', '电影'],
  ['绘画', '美食'],
  ['编程', '科技'],
  ['徒步', '自然']
]

const administrators = database.users.filter(user => user.role === 'admin')
const existingStudents = database.users.filter(
  user => user.role !== 'admin' && !String(user.id || '').startsWith('demo-student-')
)

if (existingStudents.length > 42) {
  throw new Error(`现有普通用户为 ${existingStudents.length} 人，超过目标总数 42 人，请先确认是否允许删除用户。`)
}

const generatedCount = 42 - existingStudents.length
const generatedStudents = Array.from({ length: generatedCount }, (_, index) => {
  const name = studentNames[existingStudents.length + index]
  return {
    id: `demo-student-${String(index + 1).padStart(3, '0')}`,
    name,
    username: name,
    email: `demo.student${String(index + 1).padStart(2, '0')}@example.com`,
    password: 'demo123',
    avatar: '',
    role: 'user',
    classId: null,
    profile: {
      name,
      hometown: hometowns[index % hometowns.length],
      phone: '',
      hobbies: hobbySets[index % hobbySets.length],
      bio: '热爱生活，乐于分享校园中的美好瞬间。'
    },
    createdAt: '2026-08-31T00:00:00.000Z',
    updatedAt: '2026-08-31T00:00:00.000Z'
  }
})

// 让三个班都保留一部分原有用户，再使用新增演示用户补足目标人数。
const originalClass3 = existingStudents.slice(-2)
const originalClass2 = existingStudents.slice(Math.max(0, existingStudents.length - 6), -2)
const originalClass1 = existingStudents.slice(0, Math.max(0, existingStudents.length - 6))
const generatedQueue = [...generatedStudents]

const fillClass = (originalUsers, classDefinition) => {
  const users = [...originalUsers]
  while (users.length < classDefinition.targetCount) {
    const generatedUser = generatedQueue.shift()
    if (!generatedUser) throw new Error(`无法补足 ${classDefinition.name} 的人数`)
    users.push(generatedUser)
  }
  return users.map(user => ({ ...user, classId: classDefinition.id }))
}

const class1Students = fillClass(originalClass1, classDefinitions[0])
const class2Students = fillClass(originalClass2, classDefinitions[1])
const class3Students = fillClass(originalClass3, classDefinitions[2])

if (generatedQueue.length > 0) {
  throw new Error(`仍有 ${generatedQueue.length} 名演示用户未分配班级`)
}

database.classes = classDefinitions.map(({ targetCount, ...classInfo }) => ({
  ...classInfo,
  createdAt: '2026-08-31T00:00:00.000Z'
}))
const namedStudents = [...class1Students, ...class2Students, ...class3Students].map((user, index) => {
  const name = studentNames[index]
  return {
    ...user,
    avatarIndex: index + 1,
    name,
    username: name,
    profile: {
      ...(user.profile || {}),
      name
    }
  }
})
database.users = [...administrators, ...namedStudents]

await writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`, 'utf8')

console.log('演示班级数据已更新：测试1班 30 人，测试2班 10 人，测试3班 2 人。')
