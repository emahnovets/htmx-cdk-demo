import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyResult } from 'aws-lambda';
import { render } from 'squirrelly';
import { mapToDos, toDosTemplate } from '../shared/todos/todos.partial';

const TABLE_NAME = process.env.TABLE_NAME || '';

const db = DynamoDBDocument.from(new DynamoDB());

export async function handler(): Promise<APIGatewayProxyResult> {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const response = await db.scan(params);

    return {
      statusCode: 200,
      body: render(toDosTemplate, {
        items: mapToDos(response.Items),
      }),
      headers: { 'Content-Type': 'text/html' },
    };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
}
