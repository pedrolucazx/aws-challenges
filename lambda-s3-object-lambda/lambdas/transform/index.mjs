const textLikeContentType =
  /^(text\/|application\/(json|xml|javascript|x-javascript)|[^;]+\+(json|xml))/i;

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

export const isTextContentType = (contentType = "") =>
  textLikeContentType.test(contentType.trim());

export const transformBody = (body, contentType = "") => {
  if (!body.byteLength || !isTextContentType(contentType)) {
    return body;
  }

  return encoder.encode(decoder.decode(body).toUpperCase());
};

const writeGetObjectResponse = async (params) => {
  const { S3Client, WriteGetObjectResponseCommand } = await import("@aws-sdk/client-s3");
  const s3 = new S3Client({});

  await s3.send(new WriteGetObjectResponseCommand(params));
};

export const handleObjectLambdaEvent = async (
  event = {},
  { fetchObject = fetch, writeResponse = writeGetObjectResponse } = {},
) => {
  const { inputS3Url, outputRoute, outputToken } = event.getObjectContext ?? {};

  if (!inputS3Url || !outputRoute || !outputToken) {
    throw new Error("Missing S3 Object Lambda getObjectContext");
  }

  const response = await fetchObject(inputS3Url);
  if (!response.ok) {
    throw new Error(`Failed to read original object: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const body = transformBody(new Uint8Array(await response.arrayBuffer()), contentType);

  await writeResponse({
    RequestRoute: outputRoute,
    RequestToken: outputToken,
    Body: body,
    ...(contentType ? { ContentType: contentType } : {}),
  });

  return { statusCode: 200 };
};

export const handler = (event) => handleObjectLambdaEvent(event);
