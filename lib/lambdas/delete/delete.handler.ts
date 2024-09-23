import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = DynamoDBDocument.from(new DynamoDB());

export async function handler(
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const toDoId = event.pathParameters?.id;

    if (!toDoId) {
      return {
        statusCode: 400,
        body: '',
      };
    }

    await db.delete({
      TableName: TABLE_NAME,
      Key: { [PRIMARY_KEY]: toDoId },
    });

    return {
      statusCode: 204,
      body: '',
    };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
}
