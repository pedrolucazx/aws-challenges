const AVATAR_KEY_PATTERN = /^avatars\/([^/]+)\.[a-z0-9]+$/i;

// Mesmos tipos aceitos pelo Lambda real de presigned URL do IMM
// (imm-api/lambda/presigned-url/index.mjs, ALLOWED_TYPES).
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const parseAvatarKey = (key) => {
  const match = AVATAR_KEY_PATTERN.exec(key);
  return match ? { userId: match[1] } : null;
};

export const isAllowedContentType = (contentType) => ALLOWED_CONTENT_TYPES.has(contentType);

const sha256Hex = async (body) => {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(body).digest("hex");
};

const getObject = async ({ bucket, key }) => {
  const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
  const s3 = new S3Client({});
  const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const chunks = [];
  for await (const chunk of object.Body) chunks.push(chunk);
  return { body: Buffer.concat(chunks), contentType: object.ContentType ?? "application/octet-stream" };
};

const putAuditItem = async (item) => {
  const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
  const { DynamoDBDocumentClient, PutCommand } = await import("@aws-sdk/lib-dynamodb");
  const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  await ddb.send(new PutCommand({ TableName: process.env.AUDIT_TABLE_NAME, Item: item }));
};

// Uma entrada de event.Records[] (S3 PUT notification). Ignora silenciosamente
// (não lança) chaves fora do padrão avatars/<userId>.<ext> ou content-type
// inesperado — nunca deve derrubar o processamento de outros records no batch.
export const processAvatarRecord = async (
  record,
  { fetchObject = getObject, putItem = putAuditItem } = {},
) => {
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

  const parsed = parseAvatarKey(key);
  if (!parsed) {
    return { skipped: true, reason: "key does not match avatars/<userId>.<ext>" };
  }

  const { body, contentType } = await fetchObject({ bucket, key });
  if (!isAllowedContentType(contentType)) {
    return { skipped: true, reason: `unexpected content-type ${contentType}` };
  }

  const item = {
    avatarKey: key,
    userId: parsed.userId,
    contentType,
    sizeBytes: body.length,
    sha256: await sha256Hex(body),
    processedAt: new Date().toISOString(),
  };

  await putItem(item);
  return { skipped: false, item };
};

export const handler = async (event, deps) => {
  const results = [];
  for (const record of event.Records ?? []) {
    results.push(await processAvatarRecord(record, deps));
  }
  return results;
};
