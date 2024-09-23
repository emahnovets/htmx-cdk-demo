import type { NativeAttributeValue } from '@aws-sdk/lib-dynamodb';

export const toDoTemplate = `
  <li id="{{it.id}}">
    <strong>{{it.text}}</strong> - <i>{{it.createdAt}}</i>
    <button
      hx-delete="/todos/{{it.id}}"
      hx-target="closest li"
      hx-swap="delete"
      hx-indicator="#loading-indicator"
    >
      Delete
    </button>
  </li>
`;

export const toDosTemplate = `
  {{@each(it.items) => item}}
    <li id="{{item.id}}">
      <strong>{{item.text}}</strong> - <i>{{item.createdAt}}</i>
      <button
        hx-delete="/todos/{{item.id}}"
        hx-target="closest li"
        hx-swap="delete"
        hx-indicator="#loading-indicator"
      >
        Delete
      </button>
    </li>
  {{/each}}
`;

export const toDosSectionTemplate = `<ul id="todos-list">${toDosTemplate}</ul>`;

export interface ToDoItem {
  id: string;
  text: string;
  createdAt: string;
}

export function mapToDos(
  items?: Record<string, NativeAttributeValue>[],
): ToDoItem[] {
  return (
    items?.map((todoItem) => ({
      id: todoItem.id,
      text: todoItem.text,
      createdAt: new Date(todoItem.createdAt).toLocaleString(),
    })) ?? []
  );
}
