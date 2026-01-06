import { promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

type StorageProvider = 'local' | 's3' | 'none';

const STORAGE_ROOT = process.env.KB_STORAGE_PATH;
const STORAGE_PROVIDER = ((process.env.KB_STORAGE_PROVIDER ?? '').toLowerCase() ||
  (STORAGE_ROOT ? 'local' : process.env.KB_STORAGE_S3_BUCKET ? 's3' : 'none')) as StorageProvider;

const S3_BUCKET = process.env.KB_STORAGE_S3_BUCKET;
const S3_REGION = process.env.KB_STORAGE_S3_REGION ?? 'auto';
const S3_ENDPOINT = process.env.KB_STORAGE_S3_ENDPOINT;
const S3_ACCESS_KEY_ID = process.env.KB_STORAGE_S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.KB_STORAGE_S3_SECRET_ACCESS_KEY;

let s3Client: S3Client | null = null;

function resolveS3Client() {
  if (s3Client) {
    return s3Client;
  }

  if (!S3_BUCKET) {
    throw new Error('KB storage S3 bucket is not configured');
  }

  s3Client = new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT,
    forcePathStyle: Boolean(S3_ENDPOINT),
    credentials:
      S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY
        ? { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY }
        : undefined
  });

  return s3Client;
}

function resolveS3Bucket() {
  if (!S3_BUCKET) {
    throw new Error('KB storage S3 bucket is not configured');
  }
  return S3_BUCKET;
}

function buildStorageKey(params: {
  tenantId: string;
  agentInstanceId: string;
  sourceId: string;
  filename: string;
}) {
  const safeName = params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${params.tenantId}/${params.agentInstanceId}/${params.sourceId}-${safeName}`;
}

async function streamToBuffer(stream: unknown) {
  if (stream instanceof Uint8Array) {
    return Buffer.from(stream);
  }
  if (stream && typeof (stream as { arrayBuffer?: () => Promise<ArrayBuffer> }).arrayBuffer === 'function') {
    const buffer = await (stream as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer();
    return Buffer.from(buffer);
  }
  if (stream && typeof (stream as Readable).on === 'function') {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      (stream as Readable)
        .on('data', (chunk) => chunks.push(Buffer.from(chunk)))
        .once('error', reject)
        .once('end', () => resolve(Buffer.concat(chunks)));
    });
  }
  throw new Error('Unsupported storage stream');
}

export async function savePdfFile(params: {
  tenantId: string;
  agentInstanceId: string;
  sourceId: string;
  filename: string;
  data: Uint8Array;
}) {
  const key = buildStorageKey(params);

  if (STORAGE_PROVIDER === 's3') {
    const client = resolveS3Client();
    const bucket = resolveS3Bucket();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: params.data,
        ContentType: 'application/pdf'
      })
    );
    return key;
  }

  if (STORAGE_PROVIDER === 'local') {
    if (!STORAGE_ROOT) {
      throw new Error('KB storage path is not configured');
    }
    const fullPath = path.join(STORAGE_ROOT, key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, params.data);
    return key.replace(/\\/g, '/');
  }

  return null;
}

export async function readStoredFile(fileKey: string) {
  if (STORAGE_PROVIDER === 's3') {
    const client = resolveS3Client();
    const bucket = resolveS3Bucket();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: fileKey
      })
    );
    if (!response.Body) {
      throw new Error('Storage object not found');
    }
    return streamToBuffer(response.Body);
  }

  if (STORAGE_PROVIDER === 'local') {
    if (!STORAGE_ROOT) {
      throw new Error('KB storage path is not configured');
    }
    const fullPath = path.join(STORAGE_ROOT, fileKey);
    return fs.readFile(fullPath);
  }

  throw new Error('KB storage is not configured');
}
