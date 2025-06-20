#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileDir = path.dirname(filePath);
  
  // Replace ./constants, ./utils, etc. imports with proper relative paths
  const fixed = content.replace(/from ['"]\.\/([^'"]+)['"]/g, (match, importPath) => {
    let relativePath;
    
    // If we're in app/ and importing constants/utils/etc, need to go up one level
    if (fileDir.includes('/app/') && (importPath.startsWith('constants/') || importPath.startsWith('utils/') || importPath.startsWith('components/'))) {
      relativePath = '../' + importPath;
    }
    // If we're in components/ and importing constants/utils/etc, need to go up one level  
    else if (fileDir.includes('/components/') && (importPath.startsWith('constants/') || importPath.startsWith('utils/'))) {
      relativePath = '../' + importPath;
    }
    // If we're in utils/ and importing constants/etc, need to go up one level
    else if (fileDir.includes('/utils/') && importPath.startsWith('constants/')) {
      relativePath = '../' + importPath;
    }
    // Otherwise keep the same path
    else {
      relativePath = './' + importPath;
    }
    
    return `from '${relativePath}'`;
  });
  
  if (content !== fixed) {
    fs.writeFileSync(filePath, fixed);
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

// Function to find and fix all files
function fixAllFiles(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'my-test-app') {
      fixedCount += fixAllFiles(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (fixImportsInFile(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

// Run the fix
const rootDir = process.cwd();
console.log('Fixing relative import paths...');
const fixedCount = fixAllFiles(rootDir);
console.log(`Fixed ${fixedCount} files`);