import { handler } from "./hello-world";
import { describe, it, expect, vitest } from "vitest";
import { createMock } from "zodock";
import {
  HelloWorldSchema,
} from "../../../../packages/core/src/hello-world";
import { EventBridgeEvent } from "aws-lambda";
import { ZodError } from "zod";
import { ValidationError } from "zod-validation-error";

describe("when calling the hello world handler with valid event detail", () => {
  it("the handler should log the event", async () => {
    const consoleSpy = vitest.spyOn(console, "log");
    const mockData = createMock(HelloWorldSchema);

    // Mock Event that matches the expected structure for HelloWorldReceived
    const mockHelloWorldReceivedEvent: EventBridgeEvent<string, any> = {
      id: "1",
      version: "0",
      account: "123456789012",
      time: new Date().toISOString(),
      region: "us-east-1",
      resources: [],
      source: "example.source",
      "detail-type": "hello-world.received",
      detail: mockData,
    };
    console.log("Hello world: ", mockHelloWorldReceivedEvent);
    await handler(mockHelloWorldReceivedEvent);
    expect(consoleSpy).toHaveBeenCalledWith("Hello world: ", {
      type: "hello-world.received",
      properties: undefined,
      metadata: undefined,
      attempts: 0,
    });
    consoleSpy.mockRestore();
  });
});

describe("when calling the hello world handler with invalid event detail", () => {
  it("the handler log 'validation failed'", async () => {
    // Spy on console.error to assert it's called with validation failure
    const errorSpy = vitest.spyOn(console, "error");
    const mockData = { message: 1 };

    // Mock Event that matches the expected structure for HelloWorldReceived
    const invalidEvent: EventBridgeEvent<string, any> = {
      id: "1",
      version: "0",
      account: "123456789012",
      time: new Date().toISOString(),
      region: "us-east-1",
      resources: [],
      source: "example.source",
      "detail-type": "hello-world.received",
      detail: mockData,
    };

    // Attempt to handle the event, catching any thrown error
    let caughtError;
    try {
      await handler(invalidEvent);
    } catch (error) { 
      caughtError = error;
    }

    // Assert that console.error was called due to validation failure
     expect(errorSpy).toHaveBeenCalled();
     expect(errorSpy.mock.calls[0][0]).toContain("Validation error: Required at");

    // Optionally, check if the caught error is a ZodError if using Zod for validation
    // This depends on your validation library; adjust accordingly
    expect(caughtError).toBeInstanceOf(ValidationError);
    errorSpy.mockRestore();
  });
});
