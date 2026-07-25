import { readFileSync, writeFileSync, statSync, readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const srcDir = path.resolve(import.meta.dirname, 'src')

function resolveRelative(fromFile, relativePath) {
  const fromDir = path.dirname(fromFile)
  const resolved = path.resolve(fromDir, relativePath)
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss']
  // Try exact
  for (const ext of extensions) {
    const candidate = resolved + ext
    try { if (statSync(candidate).isFile()) return candidate } catch {}
  }
  // Try index files
  for (const idx of ['/index.ts', '/index.tsx', '/index.js', '/index.jsx']) {
    try {
      const candidate = resolved + idx
      if (statSync(candidate).isFile()) return candidate
    } catch {}
  }
  // Try as directory (no extension at all) — check if it exists as-is
  try { if (statSync(resolved).isFile()) return resolved } catch {}
  return null
}

function toAliasPath(absPath, srcDir) {
  const relative = path.relative(srcDir, absPath)
  const normalized = relative.replace(/\\/g, '/')
  const stripped = normalized.replace(/\.(ts|tsx|js|jsx)$/, '')
  return '@/' + stripped
}

function findFiles(dir) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      results.push(...findFiles(fullPath))
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      results.push(fullPath)
    }
  }
  return results
}

const importPattern = /(from\s+['"])(\.\.?\/[^'"]+)(['"])/g
const requirePattern = /(require\s*\(\s*['"])(\.\.?\/[^'"]+)(['"]\s*\))/g
const dynamicPattern = /(import\s*\(\s*['"])(\.\.?\/[^'"]+)(['"]\s*\))/g
const combinedPattern = /(from\s+['"]|require\s*\(\s*['"]|import\s*\(\s*['"])(\.\.?\/[^'"]+)(['"]\s*\)?)/g

function convertFile(filePath, srcDir) {
  let content = readFileSync(filePath, 'utf-8')
  let modified = false
  const original = content

  content = content.replace(combinedPattern, (match, prefix, relPath, suffix) => {
    const resolved = resolveRelative(filePath, relPath)
    if (resolved && resolved.startsWith(srcDir)) {
      const alias = toAliasPath(resolved, srcDir)
      modified = true
      const suffixChar = suffix.trimStart()[0]
      if (suffixChar === ')') {
        return prefix + alias + suffix
      }
      return prefix + alias + suffix
    }
    return match
  })

  if (modified) {
    writeFileSync(filePath, content, 'utf-8')
    return true
  }
  return false
}

const files = findFiles(srcDir)
let fileCount = 0
let importCount = 0
for (const file of files) {
  const changed = convertFile(file, srcDir)
  if (changed) {
    const rel = path.relative(srcDir, file)
    console.log(`  ${rel}`)
    fileCount++
  }
}
console.log(`\nDone. Updated ${fileCount} files.`)
