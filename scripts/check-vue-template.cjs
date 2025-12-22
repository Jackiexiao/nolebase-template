const fs = require('fs')
const path = require('path')

const MarkdownIt = require('markdown-it')

function requireFromPnpm(pkgName, pnpmDirnamePrefix) {
  try {
    // eslint-disable-next-line import/no-dynamic-require
    return require(pkgName)
  } catch {}

  const pnpmRoot = path.resolve('node_modules/.pnpm')
  if (!fs.existsSync(pnpmRoot)) {
    throw new Error(`Cannot resolve ${pkgName}: node_modules/.pnpm not found`)
  }

  const prefix = pnpmDirnamePrefix || pkgName.replace('/', '+').replace(/^@/, '@')
  const entries = fs.readdirSync(pnpmRoot)
  const match = entries.find((entry) => entry.startsWith(`${prefix}@`) || entry.startsWith(`${prefix}_`))
  if (!match) {
    throw new Error(`Cannot resolve ${pkgName}: pnpm entry not found for prefix "${prefix}"`)
  }

  const resolved = path.join(pnpmRoot, match, 'node_modules', pkgName)
  // eslint-disable-next-line import/no-dynamic-require
  return require(resolved)
}

const { parse } = requireFromPnpm('@vue/compiler-dom', '@vue+compiler-dom')

function getAllMarkdownFiles(dirPath) {
  /** @type {string[]} */
  let files = []
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(getAllMarkdownFiles(fullPath))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(fullPath)
  }
  return files
}

function tryParseAsVueTemplate(filePath, template) {
  try {
    parse(template, { comments: true })
    return null
  } catch (error) {
    return error
  }
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
})

function stripFrontMatter(raw) {
  const lines = raw.split(/\r?\n/)
  if (lines[0] !== '---') return raw
  const endIndex = lines.findIndex((line, i) => i > 0 && (line === '---' || line === '...'))
  if (endIndex === -1) return raw
  return lines.slice(endIndex + 1).join('\n')
}

const roots = ['index.md', 'README.md', 'toc.md', '🔌 知识库插件列表.md', '笔记', '视图']
  .map((p) => path.resolve(p))
  .filter((p) => fs.existsSync(p))

/** @type {string[]} */
const files = []
for (const p of roots) {
  if (fs.statSync(p).isDirectory()) files.push(...getAllMarkdownFiles(p))
  else files.push(p)
}

console.log(`Checking ${files.length} markdown files...`)

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8')
  const html = md.render(stripFrontMatter(raw))
  const error = tryParseAsVueTemplate(file, html)
  if (!error) continue

  console.error(`\nVue template parse failed: ${path.relative(process.cwd(), file)}`)
  console.error(String(error && error.message ? error.message : error))
  if (error && error.loc) {
    const { line, column, source } = error.loc
    if (typeof line === 'number' && typeof column === 'number') {
      console.error(`at ${line}:${column}`)
    }
    if (typeof source === 'string' && source.trim()) {
      console.error(`source: ${source.trim().slice(0, 200)}`)
    }
  }
  process.exitCode = 1
  break
}
