/// <reference types="node" />

import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { basename, dirname, extname, join, relative } from "node:path"

// === Configuration ===
// Only these directories, and only .tsx files:
const ROOT_DIRS = ["src/components", "src/pages"]
const OUTPUT_DIR = "src/tests/stubs"
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

// PascalCase helper
function toPascal(name: string): string {
  // eslint-disable-next-line antfu/consistent-list-newline
  return name.replace(/(^\w|[-_]\w)/g, (m) =>
    m.replace(/[-_]/, "").toUpperCase(),
  )
}

// Walk, but only recursing into directories and files ending in .tsx
function walk(dir: string, cb: (filePath: string) => void) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walk(full, cb)
    } else if (full.endsWith(".tsx")) {
      cb(full)
    }
  }
}

// Stub template
function makeStub(componentName: string, importPath: string): string {
  return `import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ${componentName} from '${importPath}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
  });
});
`
}

// Generate
for (const root of ROOT_DIRS) {
  if (!existsSync(root)) {
    continue
  }
  walk(root, (filePath) => {
    const rel = relative(root, filePath)
    const name = basename(rel, extname(rel))
    const compName = toPascal(name)

    const stubPath = join(OUTPUT_DIR, `${compName}.test.tsx`)
    const stubDir = dirname(stubPath)
    const compNoExt = filePath.replace(/\.tsx$/, "")
    let importPath = relative(stubDir, compNoExt).replace(/\\/g, "/")
    if (!importPath.startsWith(".")) {
      importPath = `./${importPath}`
    }

    if (!existsSync(stubPath)) {
      writeFileSync(stubPath, makeStub(compName, importPath), "utf8")
      console.log(`🌱 Created stub: ${stubPath}`)
    }
  })
}
