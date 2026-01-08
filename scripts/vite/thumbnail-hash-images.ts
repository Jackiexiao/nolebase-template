import { createHash } from 'node:crypto'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import fg from 'fast-glob'
import sharp from 'sharp'
import { rgbaToThumbHash, thumbHashToDataURL } from 'thumbhash'
import { normalizePath, type Plugin } from 'vite'

type ThumbHashCalculated = {
  dataBase64: string
  dataUrl: string
  width: number
  height: number
  originalWidth: number
  originalHeight: number
}

type ThumbHash = ThumbHashCalculated & {
  assetFileName: string
  assetFullFileName: string
  assetFullHash: string
  assetFileHash: string
  assetUrl: string
  assetUrlWithBase: string
}

type ThumbHashCacheEntry = ThumbHash & {
  assetSize: number
  assetMtimeMs: number
}

function normalizeBase64(base64: string) {
  return base64.replaceAll('/', '_').replaceAll('+', '-').replaceAll('=', '-')
}

function hashSha256Base64(data: Uint8Array) {
  return createHash('sha256').update(data).digest('base64')
}

async function calculateThumbHashForFile(imageData: Uint8Array): Promise<ThumbHashCalculated> {
  const pipeline = sharp(imageData, { failOnError: false })
  const metadata = await pipeline.metadata()
  const width = metadata.width ?? 1
  const height = metadata.height ?? 1

  const scale = 100 / Math.max(width, height)
  const resizedWidth = Math.max(1, Math.round(width * scale))
  const resizedHeight = Math.max(1, Math.round(height * scale))

  const { data, info } = await pipeline
    .resize(resizedWidth, resizedHeight)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const thumbHashBinary = rgbaToThumbHash(info.width, info.height, data)
  const thumbHashBase64 = Buffer.from(thumbHashBinary).toString('base64')
  const thumbHashDataURL = await thumbHashToDataURL(thumbHashBinary)

  return {
    dataBase64: thumbHashBase64,
    dataUrl: thumbHashDataURL,
    width: info.width,
    height: info.height,
    originalWidth: width,
    originalHeight: height,
  }
}

export function ThumbnailHashImagesPatched(): Plugin {
  return {
    name: 'local:thumbnail-hash-images',
    enforce: 'pre',
    async configResolved(config) {
      const root = config.root
      const vitepressConfig = (config as any).vitepress

      const spinnerPrefix = '@nolebase/vitepress-plugin-thumbnail-hash/images:'
      const cacheDir = join(vitepressConfig.cacheDir, '@nolebase', 'vitepress-plugin-thumbnail-hash', 'thumbhashes')
      const mapPath = join(cacheDir, 'map.json')

      await mkdir(cacheDir, { recursive: true })

      const enabled = process.env.VITEPRESS_THUMB_HASH !== '0' && process.env.VITEPRESS_THUMB_HASH !== 'false'
      if (!enabled) {
        try {
          await stat(mapPath)
        }
        catch {
          await writeFile(mapPath, '{}')
        }
        console.log(`${spinnerPrefix} Skipped. (VITEPRESS_THUMB_HASH=0)`)
        return
      }

      let existingMap: Record<string, ThumbHashCacheEntry> = {}
      try {
        const raw = await readFile(mapPath, 'utf8')
        existingMap = JSON.parse(raw) as Record<string, ThumbHashCacheEntry>
      }
      catch {
        existingMap = {}
      }

      console.log(`${spinnerPrefix} Prepare to generate hashes for images...`)

      const files = await fg(`${root}/{public,笔记,视图,.vitepress}/**/*.{jpg,jpeg,png}`, {
        onlyFiles: true,
        unique: true,
        ignore: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.vitepress/dist/**',
          '**/.vitepress/cache/**',
        ],
      })

      const canonicalMap: Record<string, ThumbHashCacheEntry> = {}
      let reusedCount = 0
      let generatedCount = 0

      for (const file of files) {
        const assetFileName = normalizePath(relative(root, file))
        const fileStat = await stat(file)
        const existing = existingMap[assetFileName]

        if (
          existing
          && existing.assetMtimeMs === fileStat.mtimeMs
          && existing.assetSize === fileStat.size
        ) {
          const reused: ThumbHashCacheEntry = {
            ...existing,
            assetFileName,
            assetFullFileName: normalizePath(file),
            assetUrl: normalizePath(join(vitepressConfig.assetsDir, assetFileName)),
            assetUrlWithBase: normalizePath(join(vitepressConfig.site.base, vitepressConfig.assetsDir, assetFileName)),
            assetMtimeMs: fileStat.mtimeMs,
            assetSize: fileStat.size,
          }
          if (!reused.assetUrlWithBase.startsWith('/'))
            reused.assetUrlWithBase = `/${reused.assetUrlWithBase}`

          canonicalMap[assetFileName] = reused
          reusedCount++
          continue
        }

        const readImageRawData = await readFile(file)
        const assetFullHashRaw = normalizeBase64(hashSha256Base64(readImageRawData))
        const assetFileHash = assetFullHashRaw.substring(0, 10)
        const calculated = await calculateThumbHashForFile(readImageRawData)

        const thumbhashData: ThumbHashCacheEntry = {
          ...calculated,
          assetFileName,
          assetFullFileName: normalizePath(file),
          assetFullHash: assetFullHashRaw,
          assetFileHash,
          assetUrl: normalizePath(join(vitepressConfig.assetsDir, assetFileName)),
          assetUrlWithBase: normalizePath(join(vitepressConfig.site.base, vitepressConfig.assetsDir, assetFileName)),
          assetMtimeMs: fileStat.mtimeMs,
          assetSize: fileStat.size,
        }

        if (!thumbhashData.assetUrlWithBase.startsWith('/'))
          thumbhashData.assetUrlWithBase = `/${thumbhashData.assetUrlWithBase}`

        canonicalMap[assetFileName] = thumbhashData
        generatedCount++
      }

      const thumbhashMap: Record<string, ThumbHashCacheEntry> = {}
      for (const [assetFileName, thumbhashData] of Object.entries(canonicalMap)) {
        const encodedAssetFileName = assetFileName.replace(/ /g, '%20')

        thumbhashMap[assetFileName] = thumbhashData
        thumbhashMap[`/${assetFileName}`] = {
          ...thumbhashData,
          assetFileName: `/${assetFileName}`,
        }
        thumbhashMap[encodedAssetFileName] = {
          ...thumbhashData,
          assetFileName: encodedAssetFileName,
        }
        thumbhashMap[`/${encodedAssetFileName}`] = {
          ...thumbhashData,
          assetFileName: `/${encodedAssetFileName}`,
        }
      }

      await writeFile(mapPath, JSON.stringify(thumbhashMap, null, 2))
      console.log(`${spinnerPrefix} Done. (${files.length} images, ${reusedCount} cached, ${generatedCount} generated)`)
    },
  }
}
