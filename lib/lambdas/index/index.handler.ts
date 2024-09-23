import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyResult } from 'aws-lambda';
import { render } from 'squirrelly';
import { mapToDos, toDosSectionTemplate } from '../shared/todos/todos.partial';

const template = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
     	name="htmx-config"
     	content='{
        "responseHandling": [
          { "code": "[23]..", "swap": true },
          { "code": "422", "swap": true },
          { "code": "[45]..", "swap": false, "error":true },
          { "code": "...", "swap": true }
        ]
      }'
    />

    <title>ToDos Demo App</title>

    <script src="https://unpkg.com/htmx.org@2.0.2" integrity="sha384-Y7hw+L/jvKeWIRRkqWYfPcvVxHzVzn5REgzbawhxAuQGwX1XWe70vji+VSeHOThJ" crossorigin="anonymous"></script>

    <style>
      .htmx-indicator {
        display: none;

        &.htmx-request {
          display: block;
        }
      }
    </style>
  </head>
  <body>
    <h1>ToDos</h1>

    <button
      hx-get="/todos"
      hx-target="#todos-list"
      hx-indicator="#loading-indicator"
    >
      Refresh
    </button>

    <form
      hx-post="/todos"
      hx-target="#todos-list"
      hx-swap="afterbegin"
      hx-indicator="#loading-indicator"
      hx-on:htmx:afterRequest="this.reset()"
    >
      <input type="text" name="text" placeholder="Enter a new ToDo" required />
      <button type="submit">Add</button>
    </form>

    <div id="loading-indicator" class="htmx-indicator">Loading...</div>

    ${toDosSectionTemplate}
  </body>
</html>
`;

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
      body: render(template, {
        items: mapToDos(response.Items),
      }),
      headers: { 'Content-Type': 'text/html' },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
      headers: { 'Content-Type': 'application/json' },
    };
  }
}
