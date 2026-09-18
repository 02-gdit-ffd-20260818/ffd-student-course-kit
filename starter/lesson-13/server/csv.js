import { normalizeList, toMemberRecord, validateMemberInput } from './memberInput.js'

const requiredHeaders = ['name', 'role', 'email', 'skills']

function parseLine(line) {
  const cells = []
  let value = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1 }
    else if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) { cells.push(value); value = '' }
    else value += char
  }
  if (quoted) throw new Error('unclosed quote')
  cells.push(value)
  return cells.map((cell) => cell.trim())
}

export function safeSpreadsheetCell(value) {
  const text = String(value ?? '')
  return /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text
}

export function parseMemberCsv(csv = '') {
  const lines = String(csv).replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) return { rows: [], errors: [{ line: 1, message: 'header and at least one row are required' }] }
  let headers
  try { headers = parseLine(lines[0]).map((item) => item.toLowerCase()) } catch (error) { return { rows: [], errors: [{ line: 1, message: error.message }] } }
  const missing = requiredHeaders.filter((header) => !headers.includes(header))
  if (missing.length) return { rows: [], errors: [{ line: 1, message: `missing headers: ${missing.join(', ')}` }] }
  const rows = []
  const errors = []
  const emails = new Set()
  for (let index = 1; index < lines.length; index += 1) {
    try {
      const cells = parseLine(lines[index])
      const raw = Object.fromEntries(headers.map((header, cellIndex) => [header, safeSpreadsheetCell(cells[cellIndex] ?? '')]))
      raw.skills = normalizeList(raw.skills.replaceAll('|', ','))
      raw.interests = normalizeList(String(raw.interests ?? '').replaceAll('|', ','))
      const validation = validateMemberInput(raw)
      if (emails.has(raw.email.toLowerCase())) validation.email = 'duplicate email in file'
      emails.add(raw.email.toLowerCase())
      if (Object.keys(validation).length) errors.push({ line: index + 1, fields: validation })
      else rows.push(toMemberRecord(raw))
    } catch (error) { errors.push({ line: index + 1, message: error.message }) }
  }
  return { rows, errors }
}

function quote(value) {
  const safe = safeSpreadsheetCell(value)
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe
}

function maskEmail(email = '') {
  const [name, domain] = email.split('@')
  return domain ? `${name.slice(0, 1)}***@${domain}` : ''
}

export function exportMembersCsv(records = []) {
  const header = ['name', 'role', 'status', 'masked_email', 'skills']
  const rows = records.map((item) => [item.name, item.role, item.status, maskEmail(item.email), (item.skills ?? []).join('|')])
  return [header, ...rows].map((row) => row.map(quote).join(',')).join('\r\n')
}
