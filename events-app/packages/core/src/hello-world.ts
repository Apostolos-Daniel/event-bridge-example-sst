export * as HelloWorld from "./hello-world";
import { z } from "zod";

import { event } from "./event";

// Define the schema directly
export const HelloWorldSchema = z.object({
    message: z.string(),
});

// Use the schema in your event definition
export const Events = {
    HelloWorldReceived: event(
        "hello-world.received",
        HelloWorldSchema
    ),
};
export async function receiveHelloWorld(message: string) {
    const response = await Events.HelloWorldReceived.publish({
        message
    });
    console.log(`${Events.HelloWorldReceived.type} published with message ${message} and response ${JSON.stringify(response)}`);
}