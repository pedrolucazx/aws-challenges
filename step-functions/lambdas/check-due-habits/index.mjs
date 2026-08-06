const TABLE_NAME = "aws-challenges-habit-reminders";

const scanDueReminders = async () => {
  const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
  const { DynamoDBDocumentClient, ScanCommand } = await import("@aws-sdk/lib-dynamodb");
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

  const { Items } = await client.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "dueToday = :dueToday",
      ExpressionAttributeValues: { ":dueToday": true },
    }),
  );
  return Items ?? [];
};

export const toDueReminders = (items) =>
  items.map(({ reminderId, habitName, fakeUserId }) => ({ reminderId, habitName, fakeUserId }));

export const handler = async (_event, { scan = scanDueReminders } = {}) => ({
  dueReminders: toDueReminders(await scan()),
});
