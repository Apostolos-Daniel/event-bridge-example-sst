import { StackContext, Api, EventBus, Function } from "sst/constructs";
import * as events from "aws-cdk-lib/aws-events";

export function API({ stack }: StackContext) {
  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 10,
    },
    rules: {
      helloWorldRule: {
        pattern: { source: ["todoapp"], detailType: ["todo.created"] },
        // targets: {
        //   helloWorld:
        //   new Function(stack, "todoCreated", {
        //   handler: "packages/functions/src/events/todo-created.main",
        // })
        // },
      },
    },
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [bus],
      },
    },
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
      "GET /todo": "packages/functions/src/todo.list",
      "POST /todo": "packages/functions/src/todo.create",
    },
  });

  bus.subscribe("todo.created", {
    handler: "packages/functions/src/events/todo-created.handler",
  });

  const tamasBus = events.EventBus.fromEventBusName(
    stack,
    "ImportedBus",
    "tamas-loyalty-LoyaltyBus"
  );
  const importedBus = new EventBus(stack, "TamasBus", {
    cdk: {
      eventBus: tamasBus,
    },
    defaults: {
      retries: 10,
    },
    rules: {
      helloWorldRule: {
        pattern: {
          source: ["dotnetHelloWorldApp"],
          detailType: ["HelloWorld"],
        },
        targets: {
          helloWorld: new Function(stack, "helloWorld", {
            handler: "packages/functions/src/events/dotnet-hello-world.main",
          }),
        },
      },
      storeUpdated: {
        pattern: { source: ["zeus"] },
        targets: {
          zeus: new Function(stack, "zeus", {
            handler: "packages/functions/src/events/zeus.main",
          }),
        },
      },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
