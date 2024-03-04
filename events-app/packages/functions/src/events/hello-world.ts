import { EventHandler } from "sst/node/event-bus";
import { HelloWorld } from "../../../core/src/hello-world";
import { fromZodError } from "zod-validation-error";

export const handler = EventHandler(
  HelloWorld.Events.HelloWorldReceived,
  async (evt) => {
    try {
      HelloWorld.HelloWorldSchema.parse(evt);

      // If validation is successful, proceed with handling the event
      console.log("Hello world: ", evt);
    } catch (error) {
      const validationError = fromZodError(error as any);
      console.error(validationError.toString());
      // Optionally, throw the error to indicate a failure in handling this event
      throw validationError;
    }
  }
);
