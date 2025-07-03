const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

function getRelativeImportPath(from, to) {
  let rel = path.relative(path.dirname(from), to);
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.replace(/\\/g, '/');
}

walkDir(pagesDir, (filePath) => {
  if (filePath.endsWith('.jsx')) {
    const astroPath = filePath.replace(/\.jsx$/, '.astro');
    const importName = 'PageComponent';
    const relImport = getRelativeImportPath(astroPath, filePath);
    const astroContent = `---\nimport ${importName} from '${relImport}';\n---\n\n<${importName} client:load />\n`;
    if (fs.existsSync(astroPath)) {
      console.log(`Skip (already exists): ${astroPath}`);
    } else {
      fs.writeFileSync(astroPath, astroContent, 'utf8');
      console.log(`Created: ${astroPath}`);
    }
  }
});

console.log('✅ JSX to Astro conversion complete!'); 