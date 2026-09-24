// 用数学公式现场"造"出一段声音，不需要任何音频文件。
//
// 为什么课程要这么干：只要用了别人的录音，作品就有版权问题，不能公开展示。
// 合成音是自己算出来的，随便用。
//
// 下面在内存里拼出一个完整的 WAV 文件，再编码成 data: 开头的网址，
// <audio src="data:audio/wav;base64,..."> 就能直接播。
// WAV 格式最简单：44 字节的文件头 + 一串采样点，所以适合课堂上手写。
//
// 这个文件的细节不要求学生掌握，理解"声音 = 一串数字"就够了。

export function createToneDataUrl(frequency = 440, seconds = 2) {
  // 采样率：一秒钟取 8000 个点来描述这段声音。数字越大越清晰、文件越大。
  const sampleRate = 8000
  // 一共多少个采样点 = 采样率 × 秒数。时长夹在 0.2~4 秒之间，
  // 免得传个离谱的值进来生成几百 MB 的字符串把浏览器卡死。
  const count = Math.floor(sampleRate * Math.min(Math.max(seconds, 0.2), 4))
  // 44 字节文件头 + 每个采样点 2 字节（16 位）
  const buffer = new ArrayBuffer(44 + count * 2)
  const view = new DataView(buffer)
  const write = (offset, text) =>
    [...text].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)))
  // ↓ 下面这一段全是在填 WAV 的文件头，字段顺序是格式规定死的，不能调换。
  // setUint32/16 的最后一个参数 true 表示"小端序"，WAV 规定就用这个。
  write(0, 'RIFF')
  view.setUint32(4, 36 + count * 2, true)
  write(8, 'WAVEfmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  write(36, 'data')
  view.setUint32(40, count * 2, true)
  // ↓ 真正的声音数据：逐个采样点算出振幅
  for (let i = 0; i < count; i++) {
    // 开头淡入、结尾淡出。不做这个的话声音会"啪"地一声开始和结束（爆音）。
    const fade = Math.min(1, i / 200, (count - i) / 400)
    view.setInt16(
      44 + i * 2,
      // 正弦波：sin 决定音高（frequency 越大越尖），9000 是音量，
      // 16 位能表示到 ±32767，取 9000 留足余量不至于削顶失真
      Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 9000 * fade,
      true,
    )
  }
  // 最后把这一堆字节转成 base64 塞进 data: 网址
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `data:audio/wav;base64,${btoa(binary)}`
}
