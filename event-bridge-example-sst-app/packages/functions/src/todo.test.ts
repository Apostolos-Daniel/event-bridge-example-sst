import { create } from "./todo";
import { describe, it, expect } from "vitest";

describe("Todo API", () => {
  describe("create", () => {
    it("should create a new todo", async () => {
      // Test implementation here
      const mockAPIGatewayEvent = {
        body: JSON.stringify({ title: "Buy groceries" }),
        headers: { "Content-Type": "application/json" },
        version: "2.0",
        routeKey: "",
        rawPath: "",
        rawQueryString: "",
        requestContext: {
          accountId: "",
          apiId: "",
          domainName: "",
          domainPrefix: "",
          http: {
            method: "",
            path: "",
            protocol: "",
            sourceIp: "",
            userAgent: "",
          },
          requestId: "",
          routeKey: "",
          stage: "",
          time: "",
          timeEpoch: 0,
        },
        isBase64Encoded: false,
      };

      const todo = await create(mockAPIGatewayEvent, { undefined } as any);
      // Assert that the todo was created successfully
      expect(todo).toBeDefined();
      expect(todo.body).toBeDefined();
      expect(todo.statusCode).toBe(200);
      expect(todo.body).toBe("Todo created");
    });
  });
});
