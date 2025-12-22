const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      if (file.endsWith('.md')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles('笔记');
console.log(`Checking ${files.length} files...`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove code blocks
  content = content.replace(/`{3,}[\s\S]*?`{3,}/gm, '');
  content = content.replace(/`[^`]+`/g, '');
  
  // Remove HTML comments
  content = content.replace(/<!--[\s\S]*?-->/g, '');

  // Find anything that looks like a tag start
  const regex = /<([a-zA-Z][a-zA-Z0-9-]*)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    // Filter out common false positives if necessary
    // e.g. <http
    if (match[0].startsWith('<http')) continue;
    
    // Print context
    const index = match.index;
    const snippet = content.substring(Math.max(0, index - 10), Math.min(content.length, index + 30));
    console.log(`Found possible tag "${match[0]}" in ${file}: ...${snippet.replace(/\n/g, ' ')}...`);
  }
});