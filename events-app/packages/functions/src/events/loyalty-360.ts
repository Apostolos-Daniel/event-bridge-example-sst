import { Config } from "sst/node/config";
import sendMessagesToServiceBus from "../../../azure/src/service-bus";

// send this message to Azure service bus using axios
const queueName = process.env.QUEUE_NAME || "events";
const connectionString = Config.SERVICEBUS_CONNECTION_STRING || "";

export async function main(event: EventBridgeEvent) {
  console.log("Hello World");
  console.log(`Event Received: ${JSON.stringify(event)}`);

  const messages = [
    { body: "Hello world message from AWS", eventDetail: event.detail },
  ];
  console.log(`Sending messages to Azure Service Bus`);

  sendMessagesToServiceBus(connectionString, queueName, messages);
  console.log(`Messages sent to Azure Service Bus`);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Event processed successfully" }),
  };
}

type EventBridgeEvent = {
  version: string;
  id: string;
  'detail-type': "order.placed";
  source: "events";
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: JSON;
}