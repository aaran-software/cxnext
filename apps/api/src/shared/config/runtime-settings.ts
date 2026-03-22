import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import { databaseSetupPayloadSchema, type DatabaseSetupPayload } from '@shared/index'
import { environment } from './environment'

const runtimeSettingsFileSchema = z.object({
  database: databaseSetupPayloadSchema.optional(),
})

type RuntimeSettingsFile = z.infer<typeof runtimeSettingsFileSchema>

function readRuntimeSettingsFile(): RuntimeSettingsFile {
  if (!fs.existsSync(environment.runtime.configPath)) {
    return {}
  }

  try {
    const rawValue = fs.readFileSync(environment.runtime.configPath, 'utf8')

    if (!rawValue.trim()) {
      return {}
    }

    const parsedValue = JSON.parse(rawValue) as unknown
    return runtimeSettingsFileSchema.parse(parsedValue)
  } catch (error) {
    console.error('Failed to read runtime settings file.', error)
    return {}
  }
}

let runtimeSettings = readRuntimeSettingsFile()

export function getRuntimeDatabaseSettings() {
  return runtimeSettings.database ?? null
}

export async function saveRuntimeDatabaseSettings(settings: DatabaseSetupPayload) {
  runtimeSettings = {
    ...runtimeSettings,
    database: databaseSetupPayloadSchema.parse(settings),
  }

  await fsp.mkdir(path.dirname(environment.runtime.configPath), { recursive: true })
  await fsp.writeFile(
    environment.runtime.configPath,
    JSON.stringify(runtimeSettings, null, 2),
    'utf8',
  )
}

export function reloadRuntimeSettings() {
  runtimeSettings = readRuntimeSettingsFile()
  return runtimeSettings
}
