export * as Order from "./order";
import { z } from "zod";
import crypto from "crypto";
import {
  DynamoDBClient,
  GetItemCommand,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb"; // ES Modules import

import { event } from "./event";
import { Table } from "sst/node/table";

const client = new DynamoDBClient();

const orderSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
    })
  ),
});

export const Events = {
  OrderPlaced: event("order.placed", orderSchema),
  OrderRefunded: event("order.refunded", orderSchema),
};


export async function create(order: any) {
  // write to database
  // const orderPlacedEvent = {
  //   id: "123",
  //   name: "Tamas",
  //   items: [
  //     {
  //       id: "1",
  //       name: "My item",
  //       price: 10,
  //     },
  //   ],
  // };
  try {
    const orderPlacedEvent = orderSchema.parse(JSON.parse(order));
    const dynamoDbEventItem = {
      pk: { S: `Order#${orderPlacedEvent.id}` },
      sk: { S: new Date().toISOString() },
      type: { S: "Type#orderPlaced" },
      id: { S: orderPlacedEvent.id },
      name: { S: orderPlacedEvent.name },
      items: {
        L: orderPlacedEvent.items.map((item) => ({
          M: {
            id: { S: item.id },
            name: { S: item.name },
            price: { N: item.price.toString() },
          },
        })),
      },
    };

    const input = {
      TransactItems: [
        {
          Put: {
            // Put
            Item: dynamoDbEventItem,
            TableName: Table.EventsTable.tableName,
          },
        },
        {
          Update: {
            TableName: Table.EventsTable.tableName,
            Key: {
              pk: { S: `view#${orderPlacedEvent.id}` },
              sk: { S: "orderStatus" },
            },
            UpdateExpression: "SET #status = :status, #value = :value",
            ExpressionAttributeNames: {
              "#status": "status",
              "#value": "value",
            },
            ExpressionAttributeValues: {
              ":status": { S: "Sold" },
              ":value": {
                N: orderPlacedEvent.items
                  .reduce((total, item) => total + item.price, 0)
                  .toString(),
              },
            },
          },
        },
      ],
    };

    const command = new TransactWriteItemsCommand(input);
    const dbResponse = await client.send(command);

    const response = await Events.OrderPlaced.publish(orderPlacedEvent);
    console.log(
      `${
        Events.OrderPlaced.type
      } published with id ${order.id} and response ${JSON.stringify(response)}`
    );
    // Rest of the code...
  } catch (error) {
    // Handle the error here
    console.error("Error parsing order:", error);
  }
}

export async function refund(order: any) {
  // write to database
  // const orderPlacedEvent = {
  //   id: "123",
  //   name: "Tamas",
  //   items: [
  //     {
  //       id: "1",
  //       name: "My item",
  //       price: 10,
  //     },
  //   ],
  // };
  try {
    const orderRefunded = orderSchema.parse(JSON.parse(order));
    const dynamoDbEventItem = {
      pk: { S: `Order#${orderRefunded.id}` },
      sk: { S: new Date().toISOString() },
      type: { S: "Type#orderRefunded" },
      id: { S: orderRefunded.id },
      name: { S: orderRefunded.name },
      items: {
        L: orderRefunded.items.map((item) => ({
          M: {
            id: { S: item.id },
            name: { S: item.name },
            price: { N: item.price.toString() },
          },
        })),
      },
    };

    const input = {
      TransactItems: [
        {
          Put: {
            // Put
            Item: dynamoDbEventItem,
            TableName: Table.EventsTable.tableName,
          },
        },
        {
          Update: {
            TableName: Table.EventsTable.tableName,
            Key: {
              pk: { S: `view#${orderRefunded.id}` },
              sk: { S: "orderStatus" },
            },
            UpdateExpression: "SET #status = :status, #value = :value",
            ExpressionAttributeNames: {
              "#status": "status",
              "#value": "value",
            },
            ExpressionAttributeValues: {
              ":status": { S: "Refunded" },
              ":value": {
                N: orderRefunded.items
                  .reduce((total, item) => total - item.price, 0)
                  .toString(),
              },
            },
          },
        },
      ],
    };

    const command = new TransactWriteItemsCommand(input);
    const dbResponse = await client.send(command);
    console.log("DB Response: ", dbResponse);

    const response = await Events.OrderPlaced.publish(orderRefunded);
    console.log(
      `${
        Events.OrderRefunded.type
      } published with id ${orderRefunded.id} and response ${JSON.stringify(response)}`
    );
    // Rest of the code...
  } catch (error) {
    // Handle the error here
    console.error("Error parsing order:", error);
  }
}

export async function status(id: string) {
  const input = {
    TableName: Table.EventsTable.tableName,
    Key: {
      pk: { S: `view#${id}` },
      sk: { S: "orderStatus" },
    },
  };
  const command = new GetItemCommand(input);
  const dbResponse = await client.send(command);
  console.log("DB Response: ", dbResponse.Item?.status.S)
  return dbResponse.Item?.status.S || "Unknown";
}

export function list() {
  return Array(50)
    .fill(0)
    .map((_, index) => ({
      id: crypto.randomUUID(),
      title: "Todo #" + index,
    }));
}
