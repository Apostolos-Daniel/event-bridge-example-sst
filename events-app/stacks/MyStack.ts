import { StackContext, Api, EventBus, Function, Queue } from "sst/constructs";
import * as events from "aws-cdk-lib/aws-events";

export function API({ stack }: StackContext) {
  stack.tags.setTag("AppManagerCFNStackKey", stack.stage.toLowerCase());
  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 10,
    },
    rules: {
      helloWorldRule: {
        pattern: { source: ["todoapp"], detailType: ["todo.created"] },
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

  const queue = new Queue(stack, "queue", {
    consumer: {
      function:  "packages/functions/src/queues/consumer.main",
      cdk: {
        eventSource: {
          batchSize: 5,
          maxConcurrency: 18,
          reportBatchItemFailures: true,
        }
    },
  }});

  new EventBus(stack, "TamasBus", {
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
            handler: "packages/functions/src/events/hello-world.main",
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
      helloWorldReceivedRule: {
        pattern: { source: ["dotnetHelloWorldApp"], detailType: ["HelloWorld"] },
        targets: {
          consumer: new Function(stack, "consumer", {
            handler: "packages/functions/src/queues/consumer.main",
          }),
        },
      },
    },
  });



  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
