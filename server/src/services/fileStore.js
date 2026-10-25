import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(moduleDir, '../..')
const repoRoot = path.resolve(serverRoot, '..')
const uploadsRoot = path.join(serverRoot, 'uploads')
const manifestPath = path.join(serverRoot, 'data', 'files.json')
const publicRoot = path.join(repoRoot, 'client', 'public')

export const fileSections = ['modules', 'lab-experiments', 'tools', 'resources', 'library']

const readManifest = async () => {
  try {
    return JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    return { files: [], hiddenStaticIds: [] }
  }
}

const writeManifest = async (manifest) => {
  await fs.mkdir(path.dirname(manifestPath), { recursive: true })
  const temporaryPath = `${manifestPath}.${randomUUID()}.tmp`
  await fs.writeFile(temporaryPath, JSON.stringify(manifest, null, 2))
  await fs.rename(temporaryPath, manifestPath)
}

const publicFile = (file) => ({
  ...file,
  has_file: true,
  resource_id: file.id,
  downloadUrl: `/api/files/${file.id}/download`,
})

export async function getSectionFiles(section) {
  const manifest = await readManifest()
  return manifest.files.filter((file) => file.section === section).map(publicFile)
}

export async function getAdminFiles(section) {
  const manifest = await readManifest()
  return {
    items: manifest.files.filter((file) => file.section === section).map(publicFile),
    hiddenStaticIds: manifest.hiddenStaticIds,
  }
}

export async function addManagedFile({ section, category, description, originalFilename, mimeType, buffer }) {
  const safeName = originalFilename.replaceAll('\\', '/').split('/').pop() || 'file'
  const extension = path.extname(safeName).toLowerCase().replace(/[^.a-z0-9]/g, '').slice(0, 12)
  const id = randomUUID()
  const fileKey = `${section}/${id}${extension}`
  const absolutePath = path.join(uploadsRoot, fileKey)
  await fs.mkdir(path.dirname(absolutePath), { recursive: true })
  await fs.writeFile(absolutePath, buffer, { flag: 'wx' })

  try {
    const manifest = await readManifest()
    const file = {
      id,
      section,
      title: safeName,
      original_filename: safeName,
      category: category || '',
      description: description || '',
      mime_type: mimeType || 'application/octet-stream',
      file_size: buffer.length,
      file_key: fileKey,
      created_at: new Date().toISOString(),
    }
    manifest.files.unshift(file)
    await writeManifest(manifest)
    return publicFile(file)
  } catch (error) {
    await fs.unlink(absolutePath).catch(() => {})
    throw error
  }
}

export async function updateManagedFile(id, updates) {
  const manifest = await readManifest()
  const file = manifest.files.find((entry) => entry.id === id)
  if (!file) return null
  Object.assign(file, updates)
  await writeManifest(manifest)
  return publicFile(file)
}

export async function findManagedFile(id) {
  const manifest = await readManifest()
  const file = manifest.files.find((entry) => entry.id === id)
  if (!file) return null
  const absolutePath = path.resolve(uploadsRoot, file.file_key)
  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) throw new Error('Invalid stored file path')
  return { ...file, absolutePath }
}

export async function deleteManagedFile(id) {
  const manifest = await readManifest()
  const file = manifest.files.find((entry) => entry.id === id)
  if (!file) return false
  const absolutePath = path.resolve(uploadsRoot, file.file_key)
  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) throw new Error('Invalid stored file path')
  await fs.unlink(absolutePath).catch((error) => {
    if (error.code !== 'ENOENT') throw error
  })
  manifest.files = manifest.files.filter((entry) => entry.id !== id)
  await writeManifest(manifest)
  return true
}

export async function hideStaticModule(id, publicUrl) {
  const pathname = decodeURIComponent(new URL(publicUrl, 'http://portal.local').pathname)
  if (!pathname.startsWith('/modules/DS 277/')) throw new Error('Invalid module file path')
  const absolutePath = path.resolve(publicRoot, pathname.slice(1))
  if (!absolutePath.startsWith(`${path.join(publicRoot, 'modules')}${path.sep}`)) throw new Error('Invalid module file path')

  await fs.unlink(absolutePath).catch((error) => {
    if (error.code !== 'ENOENT') throw error
  })
  const manifest = await readManifest()
  if (!manifest.hiddenStaticIds.includes(id)) manifest.hiddenStaticIds.push(id)
  await writeManifest(manifest)
}