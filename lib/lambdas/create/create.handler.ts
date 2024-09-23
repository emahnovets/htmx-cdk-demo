import { randomUUID } from 'node:crypto';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { render } from 'squirrelly';
import { toDoTemplate } from '../shared/todos/todos.partial';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = DynamoDBDocument.from(new DynamoDB());

export async function handler(
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: '',
      };
    }

    const formData = new URLSearchParams(event.body);
    const item = {
      [PRIMARY_KEY]: randomUUID(),
      text: formData.get('text') ?? '',
      createdAt: new Date().getTime(),
    };

    await db.put({
      TableName: TABLE_NAME,
      Item: item,
    });

    return {
      statusCode: 200,
      body: render(toDoTemplate, {
        ...item,
        createdAt: new Date(item.createdAt).toLocaleString(),
      }),
      headers: { 'Content-Type': 'text/html' },
    };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
}
