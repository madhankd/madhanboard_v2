import { BoardList,ListItem } from '../interfaces/interfaces';

export const defaultBoardLists: BoardList[] = [
  {
    title: "To-Do",
    items: [
      {
        title: "Sample To-Do Item",
        description: "This is an example of a task you can add to your board.",
        created_at: new Date().toISOString()
      }
    ],
    created_at: new Date().toISOString(),
    order:0
  },
  {
    title: "Done",
    items: [
      {
        title: "Sample Done Item",
        description: "This is an example of a completed task.",
        created_at: new Date().toISOString()
      }
    ],
    created_at: new Date().toISOString(),
    order:1
  },
  {
    title: "Pending",
    items: [
      {
        title: "Sample Pending Item",
        description: "This is an example of a pending task.",
        created_at: new Date().toISOString()
      }
    ],
    created_at: new Date().toISOString(),
    order:2
  }
];
