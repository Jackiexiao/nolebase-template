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
  const content = fs.readFileSync(file, 'utf8');
  // Match lines that start with ``` (at least 3)
  // We use the hex code \x60 for backtick to be safe
  const matches = content.match(/^\s*\x60{3,}/gm);
  if (matches && matches.length % 2 !== 0) {
    console.log('Odd number of code fences in:', file);
  }
});
