const fs = require('fs');
const filePath = '笔记/前端/Vue2/v-bind.md';
let content = fs.readFileSync(filePath, 'utf8');
const newContent = content.replace(/\u00A0/g, ' ');
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Replaced NBSPs in ' + filePath);
