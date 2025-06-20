#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Function to get relative path
function getRelativePath(fromDir, toDir) {
  const from = fromDir.split('/').filter(p => p);
  const to = toDir.split('/').filter(p => p);
  
  // Find common base
  let i = 0;
  while (i < from.length && i < to.length && from[i] === to[i]) {
    i++;
  }
  
  // Go up from source
  const up = '../'.repeat(from.length - i);
  
  // Go down to target
  const down = to.slice(i).join('/');
  
  return up + down;
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileDir = path.dirname(filePath);
  
  // Replace @/ imports
  const fixed = content.replace(/from ['"]@\/([^'"]+)['"]/g, (match, importPath) => {
    const targetPath = importPath;
    let relativePath;
    
    // Calculate relative path based on common patterns
    if (fileDir.includes('/app/(tabs)')) {
      relativePath = '../../' + targetPath;
    } else if (fileDir.includes('/app/')) {
      relativePath = '../' + targetPath;
    } else if (fileDir.includes('/components/')) {
      relativePath = '../' + targetPath;
    } else if (fileDir.includes('/utils/')) {
      relativePath = '../' + targetPath;
    } else if (fileDir.includes('/contexts/')) {
      relativePath = '../' + targetPath;
    } else if (fileDir.includes('/hooks/')) {
      relativePath = '../' + targetPath;
    } else if (fileDir.includes('/backend/')) {
      relativePath = '../../' + targetPath;
    } else {
      // Default case
      relativePath = './' + targetPath;
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
console.log('Fixing import paths...');
const fixedCount = fixAllFiles(rootDir);
console.log(`Fixed ${fixedCount} files`);