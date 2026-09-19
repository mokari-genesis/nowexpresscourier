import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'
import { PutObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const MYSQL_SECRET_ID = 'nowExpress/MySql'
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'

const secretsClient = new SecretsManagerClient({
  region: AWS_REGION,
})

const s3Client = new S3Client({
  region: AWS_REGION,
})

/** In-memory cache for warm Lambda containers — avoids Secrets Manager calls per request. */
const secretCache = new Map()

/**
 * Fetch a secret by id/name. JSON SecretString values are parsed automatically.
 * @param {string} secretId
 * @param {{ forceRefresh?: boolean }} [options]
 */
export async function getSecret(secretId, { forceRefresh = false } = {}) {
  if (!forceRefresh && secretCache.has(secretId)) {
    return secretCache.get(secretId)
  }

  const response = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: secretId,
      VersionStage: 'AWSCURRENT',
    })
  )

  const raw =
    response.SecretString ?? Buffer.from(response.SecretBinary ?? []).toString('utf8')

  let value
  try {
    value = JSON.parse(raw)
  } catch {
    value = raw
  }

  secretCache.set(secretId, value)
  return value
}

/**
 * Logical env for app secrets: `prod` | `dev` (see serverless custom.secretEnv).
 */
export function resolveAppEnv(
  env = process.env.APP_ENV || process.env.STAGE || process.env.CURRENT_ENV
) {
  const normalized = String(env || 'dev').toLowerCase()
  if (normalized === 'production' || normalized === 'prod') return 'prod'
  return 'dev'
}

/** Shared MySQL cluster credentials (`nowExpress/MySql`). */
export function getMysqlSecret(options) {
  return getSecret(MYSQL_SECRET_ID, options)
}

/**
 * General app secret (`dev/nowExpress` | `prod/nowExpress`).
 * Same naming as serverless `custom.apisecret`.
 */
export function getAppConfigSecretId(appEnv = resolveAppEnv()) {
  return `${appEnv}/nowExpress`
}

export function getAppConfig(options = {}) {
  const appEnv = options.appEnv ?? resolveAppEnv(options.stage)
  return getSecret(getAppConfigSecretId(appEnv), options)
}

export async function getMysqlConfig(options = {}) {
  const mysqlSecret = await getMysqlSecret(options)

  const database =
    options.database ?? process.env.DATABASE_NAME ?? (await getAppConfig(options)).DB_NAME

  if (!database) {
    throw new Error(
      'Missing DATABASE_NAME (set via serverless apisecret.DB_NAME or options.database)'
    )
  }

  return {
    host: mysqlSecret.host ?? mysqlSecret.hostname ?? mysqlSecret.HOST,
    port: Number(mysqlSecret.port ?? mysqlSecret.PORT ?? 3306),
    user: mysqlSecret.username ?? mysqlSecret.user ?? mysqlSecret.USERNAME,
    password: mysqlSecret.password ?? mysqlSecret.PASSWORD,
    database,
    ...(mysqlSecret.ssl !== undefined ? { ssl: mysqlSecret.ssl } : {}),
  }
}

/**
 * Upload a file to S3 and return a short-lived presigned GET URL.
 * Pure infra helper — caller owns key naming and file contents.
 */
export async function uploadExportFile({
  bucket,
  key,
  body,
  contentType = 'text/csv; charset=utf-8',
  contentDisposition = 'attachment; filename="guides.csv"',
  expiresIn = 900,
} = {}) {
  if (!bucket) throw new Error('bucket is required')
  if (!key) throw new Error('key is required')
  if (body === undefined || body === null) throw new Error('body is required')

  const ttl = Math.max(1, Number(expiresIn) || 900)

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ContentDisposition: contentDisposition,
    })
  )

  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn: ttl }
  )

  return {
    url,
    key,
    expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    expiresIn: ttl,
  }
}
