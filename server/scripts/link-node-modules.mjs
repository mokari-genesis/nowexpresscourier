#!/usr/bin/env node
/**
 * ESM does not honor NODE_PATH the way CommonJS did.
 * Point server/node_modules at layers/node/node_modules so bare imports
 * (mssql, libs/..., entityQueries/..., etc.) resolve from any file under server/.
 *
 * Runtime dependencies are installed only in layers/node.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const layerNodeModules = path.join(serverRoot, 'layers/node/node_modules')
const serverNodeModules = path.join(serverRoot, 'node_modules')

const localPackages = [
  { name: 'libs', target: path.join(serverRoot, 'libs') },
  { name: 'entityQueries', target: path.join(serverRoot, 'entityQueries') },
  { name: 'vendor', target: path.join(serverRoot, 'vendor') },
]

if (!fs.existsSync(layerNodeModules)) {
  console.error(
    `Missing ${layerNodeModules}. Run: npm --prefix layers/node install`
  )
  process.exit(1)
}

for (const { name, target } of localPackages) {
  if (!fs.existsSync(target)) continue
  const linkPath = path.join(layerNodeModules, name)
  fs.rmSync(linkPath, { recursive: true, force: true })
  fs.symlinkSync(path.relative(layerNodeModules, target), linkPath)
  console.log(`linked layers/node/node_modules/${name} -> ${name}/`)
}

const existing = fs.existsSync(serverNodeModules)
  ? fs.lstatSync(serverNodeModules)
  : null

if (existing?.isSymbolicLink()) {
  fs.unlinkSync(serverNodeModules)
} else if (existing) {
  fs.rmSync(serverNodeModules, { recursive: true, force: true })
}

fs.symlinkSync(
  path.relative(serverRoot, layerNodeModules),
  serverNodeModules
)
console.log('linked server/node_modules -> layers/node/node_modules')
