const getItem = async (avatarKey) => {
  const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
  const { DynamoDBDocumentClient, GetCommand } = await import("@aws-sdk/lib-dynamodb");
  const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const result = await ddb.send(
    new GetCommand({ TableName: process.env.AUDIT_TABLE_NAME, Key: { avatarKey } }),
  );
  return result.Item ?? null;
};

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// Evento AWS_PROXY do API Gateway: GET /audit/{avatarKey+}
export const handleGetAvatarAudit = async (event, { fetchItem = getItem } = {}) => {
  const avatarKey = event.pathParameters?.avatarKey;
  if (!avatarKey) {
    return jsonResponse(400, { error: "avatarKey é obrigatório na URL" });
  }

  const item = await fetchItem(avatarKey);
  if (!item) {
    return jsonResponse(404, { error: `nenhum registro de auditoria para ${avatarKey}` });
  }

  return jsonResponse(200, item);
};

export const handler = (event) => handleGetAvatarAudit(event);
