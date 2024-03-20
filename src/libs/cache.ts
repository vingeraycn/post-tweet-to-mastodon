import { existsSync, readFileSync, writeFileSync } from 'fs'
import { CACHE_FILE_NAME } from '../config'

export function getPostedId(): string | null {
  if (!existsSync(CACHE_FILE_NAME)) {
    return null
  }
  const unformattedJson = readFileSync(CACHE_FILE_NAME)
  const parsedJson = JSON.parse(unformattedJson?.toString())
  return parsedJson?.id
}

export function getCachedJSON() {
  if (!existsSync(CACHE_FILE_NAME)) {
    return {
      postedIds: [],
    }
  }
  const unformattedJson = readFileSync(CACHE_FILE_NAME)
  const parsedJson = JSON.parse(unformattedJson?.toString())

  return parsedJson
}

export function canPost(id: string): boolean {
  const json = getCachedJSON()
  return !json.postedIds.includes(id)
}

export function cachePostId(id: string): void {
  const json = getCachedJSON()
  json.postedIds.push(id)
  writeFileSync(CACHE_FILE_NAME, JSON.stringify(json, null, 2))
}
