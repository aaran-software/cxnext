import type {
  MediaFolderListResponse,
  MediaFolderResponse,
  MediaResponse,
  MediaListResponse,
  MediaUpsertPayload,
} from '@shared/index'
import {
  mediaFolderListResponseSchema,
  mediaFolderResponseSchema,
  mediaFolderUpsertPayloadSchema,
  mediaListResponseSchema,
  mediaResponseSchema,
  mediaUpsertPayloadSchema,
} from '@shared/index'
import type { MediaRepository } from '../data/media-repository'
import { ApplicationError } from '../../../shared/errors/application-error'
import { normalizeStoragePath } from '../../../shared/media/storage'

interface PersistenceError {
  code?: string
  sqlMessage?: string
  message?: string
}

export class MediaService {
  constructor(private readonly repository: MediaRepository) {}

  async list() {
    const items = await this.repository.list()
    return mediaListResponseSchema.parse({ items } satisfies MediaListResponse)
  }

  async getById(id: string) {
    const item = await this.repository.findById(id)

    if (!item) {
      throw new ApplicationError('Media asset not found.', { id }, 404)
    }

    return mediaResponseSchema.parse({ item } satisfies MediaResponse)
  }

  async create(payload: unknown) {
    const parsedPayload = this.parsePayload(payload)

    try {
      const item = await this.repository.create(parsedPayload)
      return mediaResponseSchema.parse({ item } satisfies MediaResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'create')
    }
  }

  async update(id: string, payload: unknown) {
    const parsedPayload = this.parsePayload(payload)

    try {
      const item = await this.repository.update(id, parsedPayload)
      return mediaResponseSchema.parse({ item } satisfies MediaResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'update', id)
    }
  }

  async deactivate(id: string) {
    try {
      const item = await this.repository.setActiveState(id, false)
      return mediaResponseSchema.parse({ item } satisfies MediaResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'deactivate', id)
    }
  }

  async restore(id: string) {
    try {
      const item = await this.repository.setActiveState(id, true)
      return mediaResponseSchema.parse({ item } satisfies MediaResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'restore', id)
    }
  }

  async listFolders() {
    const items = await this.repository.listFolders()
    return mediaFolderListResponseSchema.parse({ items } satisfies MediaFolderListResponse)
  }

  async createFolder(payload: unknown) {
    const parsedPayload = this.parseFolderPayload(payload)
    this.validateFolderPayload(parsedPayload)

    try {
      const item = await this.repository.createFolder(parsedPayload)
      return mediaFolderResponseSchema.parse({ item } satisfies MediaFolderResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'create-folder')
    }
  }

  async updateFolder(id: string, payload: unknown) {
    const parsedPayload = this.parseFolderPayload(payload)
    this.validateFolderPayload(parsedPayload, id)

    try {
      const item = await this.repository.updateFolder(id, parsedPayload)
      return mediaFolderResponseSchema.parse({ item } satisfies MediaFolderResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'update-folder', id)
    }
  }

  async deactivateFolder(id: string) {
    try {
      const item = await this.repository.setFolderActiveState(id, false)
      return mediaFolderResponseSchema.parse({ item } satisfies MediaFolderResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'deactivate-folder', id)
    }
  }

  async restoreFolder(id: string) {
    try {
      const item = await this.repository.setFolderActiveState(id, true)
      return mediaFolderResponseSchema.parse({ item } satisfies MediaFolderResponse)
    } catch (error) {
      this.throwPersistenceError(error, 'restore-folder', id)
    }
  }

  private parsePayload(payload: unknown) {
    const parsedPayload = mediaUpsertPayloadSchema.parse(payload)
    this.validatePayload(parsedPayload)
    return parsedPayload
  }

  private parseFolderPayload(payload: unknown) {
    return mediaFolderUpsertPayloadSchema.parse(payload)
  }

  private validatePayload(payload: MediaUpsertPayload) {
    normalizeStoragePath(payload.filePath)

    if (payload.thumbnailPath) {
      normalizeStoragePath(payload.thumbnailPath)
    }

    const versionTypes = new Set<string>()
    for (const version of payload.versions) {
      normalizeStoragePath(version.filePath)

      if (versionTypes.has(version.versionType)) {
        throw new ApplicationError('Media version types must be unique.', { versionType: version.versionType }, 400)
      }

      versionTypes.add(version.versionType)
    }
  }

  private validateFolderPayload(payload: ReturnType<typeof mediaFolderUpsertPayloadSchema.parse>, folderId?: string) {
    if (payload.parentId && folderId && payload.parentId === folderId) {
      throw new ApplicationError('A media folder cannot be its own parent.', { folderId }, 400)
    }
  }

  private throwPersistenceError(
    error: unknown,
    action:
      | 'create'
      | 'update'
      | 'deactivate'
      | 'restore'
      | 'create-folder'
      | 'update-folder'
      | 'deactivate-folder'
      | 'restore-folder',
    id?: string,
  ): never {
    if (error instanceof ApplicationError) {
      throw error
    }

    const persistenceError = error as PersistenceError

    if (persistenceError.code === 'ER_DUP_ENTRY') {
      throw new ApplicationError(
        'A media record with the same unique value already exists.',
        { action, detail: persistenceError.sqlMessage ?? persistenceError.message ?? 'duplicate entry' },
        409,
      )
    }

    if (persistenceError.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new ApplicationError(
        'One or more referenced media records do not exist.',
        { action, detail: persistenceError.sqlMessage ?? persistenceError.message ?? 'missing reference' },
        400,
      )
    }

    throw new ApplicationError(
      'Failed to persist media data.',
      { action, id: id ?? 'new', detail: persistenceError.sqlMessage ?? persistenceError.message ?? 'unknown persistence error' },
      500,
    )
  }
}
