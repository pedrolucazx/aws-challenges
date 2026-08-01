import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "aws-challenges-habit-reminders";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async () => {
  const { Items } = await client.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "dueToday = :dueToday",
      ExpressionAttributeValues: { ":dueToday": true },
    }),
  );

  return {
    dueReminders: (Items ?? []).map(({ reminderId, habitName, fakeUserId }) => ({
      reminderId,
      habitName,
      fakeUserId,
    })),
  };
};
