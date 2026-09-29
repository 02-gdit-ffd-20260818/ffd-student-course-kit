param(
  [string]$DbHost = $env:DB_HOST,
  [int]$DbPort = $(if ($env:DB_PORT) { [int]$env:DB_PORT } else { 3306 }),
  [string]$DbUser = $env:DB_USER,
  [string]$DbName = $env:DB_NAME,
  [string]$OutputDirectory = ".\backups",
  [string]$ProjectDirectory = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
if (-not $DbHost -or -not $DbUser -or -not $DbName) {
  throw 'Set DB_HOST, DB_USER and DB_NAME first, or pass script parameters.'
}
if (-not (Get-Command mysqldump -ErrorAction SilentlyContinue)) {
  throw 'mysqldump was not found. Install MySQL Client and add its bin directory to PATH.'
}

$resolvedOutput = if ([System.IO.Path]::IsPathRooted($OutputDirectory)) {
  [System.IO.Path]::GetFullPath($OutputDirectory)
} else {
  [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $OutputDirectory))
}
New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupFile = Join-Path $resolvedOutput "$DbName-$timestamp.sql"
$temporaryFile = "$backupFile.tmp"
$checksumFile = "$backupFile.sha256"
$commitFile = "$backupFile.git-commit"

Write-Host "Backing up $DbHost`:$DbPort/$DbName"
Write-Host 'MySQL will ask for the password. No characters are shown while you type.'
try {
  # ============ TODO 04（中等）：MySQL 怎么备份 ============
# 第 13 课的 SQLite 备份就是复制一个文件。
# MySQL 是独立服务，数据分散在很多文件里，**不能直接复制目录**
# （复制到一半数据库还在写，拿到的是一个坏掉的快照）。
#
# 正确做法是用 mysqldump：它连上数据库，把数据导成一份 SQL 文本，
# 里面是一条条 CREATE TABLE 和 INSERT。
#
# 终端里看得到的结果：跑一次备份，生成一个 .sql 文件，
# 用记事本打开能看到熟悉的 SQL 语句。
#
# TODO：补全 mysqldump 命令。做完**一定要演练一次恢复**：
#   备份 → 删库 → 用 mysql < 备份文件 恢复 → db:verify 数字对得上
#
# 顺便对照一下三课的备份方式：
#   第 12 课 JSON  复制一个 .json 文件
#   第 13 课 SQLite 复制一个 .sqlite 文件（注意 WAL）
#   第 14 课 MySQL  mysqldump 导出 SQL 文本
# **存储方式变了，备份方式也跟着变**——这是本课一条重要的认知。
#
# 几个关键参数的意思：
#   --single-transaction  在一个事务里导出，**导出期间数据库照常读写**，
#                         拿到的是一个一致的快照，不用停服务
#   --quick               逐行取而不是一次全读进内存，大表才不会撑爆
#   --result-file=        直接写文件，比用 > 重定向更可靠（不会有编码问题）
#   --default-character-set=utf8mb4   中文和 emoji 才不会变成问号
# ================================================
  & mysqldump --result-file=$temporaryFile $DbName
  if ($LASTEXITCODE -ne 0) { throw 'mysqldump failed.' }
  if (-not (Test-Path -LiteralPath $temporaryFile) -or (Get-Item -LiteralPath $temporaryFile).Length -eq 0) { throw 'mysqldump created an empty file.' }
  Move-Item -LiteralPath $temporaryFile -Destination $backupFile
} finally {
  if (Test-Path -LiteralPath $temporaryFile) { Remove-Item -LiteralPath $temporaryFile -Force }
}

$hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $backupFile).Hash
$size = (Get-Item -LiteralPath $backupFile).Length
$hashLine = "$($hash.ToLowerInvariant())  $([System.IO.Path]::GetFileName($backupFile))"
Set-Content -LiteralPath $checksumFile -Value $hashLine -Encoding ascii
$gitCommit = if (Get-Command git -ErrorAction SilentlyContinue) { (& git -C $ProjectDirectory rev-parse HEAD 2>$null) } else { $null }
if (-not $gitCommit) { $gitCommit = 'unknown' }
Set-Content -LiteralPath $commitFile -Value $gitCommit -Encoding ascii
Write-Host "Backup created: $backupFile"
Write-Host "Size: $size bytes"
Write-Host "SHA256: $hash"
Write-Host "Checksum file: $checksumFile"
Write-Host "Git commit file: $commitFile"
Write-Host 'Copy the SQL, SHA256 and Git commit files to another machine or object storage.'
