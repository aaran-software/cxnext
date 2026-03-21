import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import type { ServerResponse } from 'node:http'
import type { MediaStorageScope } from '@shared/index'
import { environment } from '../config/environment'
import { ApplicationError } from '../errors/application-error'

const contentTypesByExtension: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

export function normalizeStoragePath(value: string) {
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '').trim()

  if (!normalized) {
    throw new ApplicationError('Storage path is required.', { value }, 400)
  }

  if (normalized.split('/').some((segment) => segment === '..' || segment.length === 0)) {
    throw new ApplicationError('Storage path contains invalid segments.', { value }, 400)
  }

  return normalized
}

export function createMediaUrl(storageScope: MediaStorageScope, filePath: string) {
  const normalized = normalizeStoragePath(filePath)

  if (storageScope === 'public') {
    const encodedPath = normalized.split('/').map(encodeURIComponent).join('/')
    return `${environment.media.publicBaseUrl}/${encodedPath}`
  }

  return `private://${normalized}`
}

export function resolveStorageFilePath(storageScope: MediaStorageScope, filePath: string) {
  const normalized = normalizeStoragePath(filePath)
  const baseDirectory =
    storageScope === 'public' ? environment.media.publicDirectory : environment.media.privateDirectory

  return path.join(baseDirectory, ...normalized.split('/'))
}

export async function ensureMediaStorage() {
  await fsp.mkdir(environment.media.publicDirectory, { recursive: true })
  await fsp.mkdir(environment.media.privateDirectory, { recursive: true })
  await fsp.mkdir(path.dirname(environment.media.webPublicSymlink), { recursive: true })

  const placeholderDirectory = path.join(environment.media.publicDirectory, 'placeholders')
  const placeholderFile = path.join(placeholderDirectory, 'default.txt')
  await fsp.mkdir(placeholderDirectory, { recursive: true })

  try {
    await fsp.access(placeholderFile)
  } catch {
    await fsp.writeFile(
      placeholderFile,
      'Default public media placeholder created by the media manager bootstrap.\n',
      'utf8',
    )
  }

  try {
    const linkStats = await fsp.lstat(environment.media.webPublicSymlink)
    if (linkStats.isSymbolicLink() || linkStats.isDirectory()) {
      return
    }
  } catch {
    await fsp.symlink(environment.media.publicDirectory, environment.media.webPublicSymlink, 'junction')
  }
}

export async function servePublicMediaAsset(response: ServerResponse, relativePath: string) {
  const normalized = normalizeStoragePath(relativePath)
  const filePath = resolveStorageFilePath('public', normalized)

  let stats
  try {
    stats = await fsp.stat(filePath)
  } catch {
    throw new ApplicationError('Public media file not found.', { path: normalized }, 404)
  }

  if (!stats.isFile()) {
    throw new ApplicationError('Requested public media path is not a file.', { path: normalized }, 404)
  }

  const extension = path.extname(filePath).toLowerCase()
  const contentType = contentTypesByExtension[extension] ?? 'application/octet-stream'

  response.writeHead(200, {
    'content-type': contentType,
    'content-length': stats.size,
    'cache-control': 'public, max-age=300',
    'access-control-allow-origin': environment.corsOrigin,
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  })

  await new Promise<void>((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
    stream.on('error', reject)
    stream.on('end', () => resolve())
    stream.pipe(response)
  })
}
