import { EventHandler } from "sst/node/event-bus";
import { Todo } from "@event-bridge-example-sst-app/core/todo";
import chalk from "chalk";

export const handler = EventHandler(Todo.Events.Created, async (evt) => {
  const message = `Received 'Todo created' event: ${JSON.stringify(evt)}`;
  console.log(chalk.green(message));
});
