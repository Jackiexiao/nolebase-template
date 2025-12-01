import matter from 'gray-matter'
import fs from 'fs-extra'

/**
 * 解析日期格式
 * 新格式："2025年-12月-01日 19:19"
 */
function parseChineseDateString(dateStr: string): number | undefined {
  if (!dateStr || typeof dateStr !== 'string') return undefined
  
  try {
    // 新格式：2025年-12月-01日 19:19
    const match = dateStr.match(/(\d{4})年-(\d{1,2})月-(\d{1,2})日\s+(\d{1,2}):(\d{2})/)
    
    if (match) {
      const year = Number.parseInt(match[1])
      const month = Number.parseInt(match[2]) - 1
      const day = Number.parseInt(match[3])
      const hour = Number.parseInt(match[4])
      const minute = Number.parseInt(match[5])
      
      const date = new Date(year, month, day, hour, minute, 0)
      return date.getTime()
    }
    
    return undefined
  } catch (e) {
    console.warn('Failed to parse date string:', dateStr, e)
    return undefined
  }
}

// 测试解析一个实际文件
const testFile = '笔记/JavaSE/printf.md'
const content = fs.readFileSync(testFile, 'utf-8')
const parsedContent = matter(content)

console.log('=== Frontmatter Data ===')
console.log(parsedContent.data)
console.log('\n=== Created Field ===')
console.log('Raw value:', parsedContent.data.created)
if (parsedContent.data.created) {
  const parsed = parseChineseDateString(parsedContent.data.created)
  console.log('Parsed timestamp:', parsed)
  console.log('Parsed date:', new Date(parsed ||  0).toLocaleString())
} else {
 console.log('No created field found!')
}
