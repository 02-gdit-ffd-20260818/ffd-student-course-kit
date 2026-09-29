import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, unlink } from 'node:fs/promises'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
// 上传到持久化目录；先落盘到临时目录，检查文件头后才公开。
export function mediaUpload(root = process.env.MEDIA_PATH || './var/media') {
  const directory = resolve(root),
    temp = join(directory, '.incoming')
  mkdirSync(temp, { recursive: true })
  // ============ TODO 02（简单）：只收白名单里的文件类型 ============
  // 页面上看得到的结果：试着上传一个 .exe 或 .html 文件，
  // **被明确拒绝**；上传正常的 jpg/png/mp3/mp4 则成功。
  //
  // 现在这个集合是空的，等于什么类型都不收，上传永远失败。
  //
  // TODO：把九种允许的 MIME 类型补回去：
  //   图片 image/png  image/jpeg  image/webp
  //   音频 audio/mpeg audio/wav   audio/x-wav  audio/ogg
  //   视频 video/mp4  video/webm
  //
  // 为什么用白名单不用黑名单：危险的类型列不完（exe、bat、html、svg……），
  // 漏一个就出事。白名单只有九种，列得全。
  //
  // 为什么 html 和 svg 不能收：它们能带 <script>。
  // 和网站同域名的话，上传上去再打开，脚本就在你的域下执行了。
  // ========================================================
  const accept = new Set([])
  const upload = multer({
    dest: temp,
    limits: { fileSize: 40 * 1024 * 1024, files: 1, fields: 0 },
    fileFilter(req, file, done) {
      if (!accept.has(file.mimetype))
        return done(
          Object.assign(new Error('只接受PNG/JPEG/WebP、MP3/WAV/OGG、MP4/WebM'), { status: 400 }),
        )
      done(null, true)
    },
  }).single('file')
  async function save(req, res, next) {
    if (!req.file) return res.status(400).json({ error: { message: '请选择文件' } })
    const file = req.file
    try {
      const bytes = await readFile(file.path),
        tag = bytes.subarray(0, 12),
        ascii = tag.toString('latin1')
      let type, extension
      if (tag.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
        type = 'image'
        extension = 'png'
      } else if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
        type = 'image'
        extension = 'jpg'
      } else if (ascii.startsWith('RIFF') && ascii.slice(8) === 'WEBP') {
        type = 'image'
        extension = 'webp'
      } else if (ascii.startsWith('RIFF') && ascii.slice(8) === 'WAVE') {
        type = 'audio'
        extension = 'wav'
      } else if (ascii.startsWith('OggS')) {
        type = 'audio'
        extension = 'ogg'
      } else if (ascii.startsWith('ID3') || (bytes[0] === 255 && (bytes[1] & 224) === 224)) {
        type = 'audio'
        extension = 'mp3'
      } else if (ascii.slice(4, 8) === 'ftyp') {
        type = 'video'
        extension = 'mp4'
      } else if (tag.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163]))) {
        type = 'video'
        extension = 'webm'
      }
      if (
        !type ||
        !file.mimetype.startsWith(
          type === 'image' ? 'image/' : type === 'audio' ? 'audio/' : 'video/',
        )
      )
        return res.status(400).json({ error: { message: '文件实际格式与声明不一致' } })
      const name = randomUUID() + '.' + extension
      await rename(file.path, join(directory, name))
      res.status(201).json({ data: { url: '/media/uploads/' + name, type, size: file.size } })
    } catch (e) {
      next(e)
    } finally {
      if (existsSync(file.path)) await unlink(file.path).catch(() => {})
    }
  }
  return { upload, save, directory }
}
