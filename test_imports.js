const fs = require('fs');
const code = fs.readFileSync('customer_app/src/components/navigation/DrawerContent.tsx', 'utf8');
const imports = code.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
imports.forEach(imp => {
  const match = imp.match(/from\s+['"]([^'"]+)['"]/);
  if (match) {
    const path = match[1];
    if (path.startsWith('.')) {
      let fullPath = 'customer_app/src/components/navigation/' + path;
      if (!fs.existsSync(fullPath) && !fs.existsSync(fullPath + '.ts') && !fs.existsSync(fullPath + '.tsx')) {
        console.log('Missing file for import:', path);
      }
    }
  }
});
