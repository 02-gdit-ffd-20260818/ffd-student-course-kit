export function createToneDataUrl(frequency = 440, seconds = 2) {
  const sampleRate = 8000
  const count = Math.floor(sampleRate * Math.min(Math.max(seconds, 0.2), 4))
  const buffer = new ArrayBuffer(44 + count * 2)
  const view = new DataView(buffer)
  const write = (offset, text) => [...text].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)))
  write(0, 'RIFF'); view.setUint32(4, 36 + count * 2, true); write(8, 'WAVEfmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); write(36, 'data'); view.setUint32(40, count * 2, true)
  for (let i = 0; i < count; i++) {
    const fade = Math.min(1, i / 200, (count - i) / 400)
    view.setInt16(44 + i * 2, Math.sin(2 * Math.PI * frequency * i / sampleRate) * 9000 * fade, true)
  }
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `data:audio/wav;base64,${btoa(binary)}`
}
