import type { DatabaseSetupPayload } from '@shared/index'
import { environment } from '../config/environment'
import { getRuntimeDatabaseSettings } from '../config/runtime-settings'

export type DatabaseConfigSource = 'environment' | 'runtime_file'

export interface ResolvedDatabaseConfig extends DatabaseSetupPayload {
  source: DatabaseConfigSource
}

export function getConfiguredDatabaseSettings(): ResolvedDatabaseConfig | null {
  const runtimeSettings = getRuntimeDatabaseSettings()

  if (runtimeSettings) {
    return {
      ...runtimeSettings,
      source: 'runtime_file',
    }
  }

  if (!environment.database.enabled) {
    return null
  }

  return {
    host: environment.database.host,
    port: environment.database.port,
    user: environment.database.user,
    password: environment.database.password,
    name: environment.database.name,
    source: 'environment',
  }
}
