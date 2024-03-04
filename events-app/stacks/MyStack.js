import { Api, EventBus, Function, Queue, Config, } from "sst/constructs";
import * as events from "aws-cdk-lib/aws-events";
export function API({ stack }) {
    stack.tags.setTag("AppManagerCFNStackKey", stack.stage.toLowerCase());
    const SERVICEBUS_CONNECTION_STRING = new Config.Secret(stack, "SERVICEBUS_CONNECTION_STRING");
    const importedTamasBus = events.EventBus.fromEventBusName(stack, "ImportedBus", "tamas-loyalty-LoyaltyEventBus");
    new Queue(stack, "queue", {
        consumer: {
            function: "packages/functions/src/queues/consumer.main",
            cdk: {
                eventSource: {
                    batchSize: 5,
                    maxConcurrency: 18,
                    reportBatchItemFailures: true,
                },
            },
        },
    });
    const tamasEventBus = new EventBus(stack, "TamasBus", {
        cdk: {
            eventBus: importedTamasBus,
        },
        defaults: {
            retries: 10,
        },
        rules: {
            helloWorld: {
                pattern: {
                    source: ["dotnetHelloWorldApp"],
                    detailType: ["HelloWorld"],
                },
                targets: {
                    helloWorld: new Function(stack, "helloWorld", {
                        handler: "packages/functions/src/events/hello-world.main",
                    }),
                    consumer: new Function(stack, "consumer", {
                        handler: "packages/functions/src/queues/consumer.main",
                    }),
                },
            },
            // storeUpdated: {
            //   pattern: { source: ["zeus"] },
            //   targets: {
            //     zeus: new Function(stack, "zeus", {
            //       handler: "packages/functions/src/events/zeus.main",
            //     }),
            //   },
            // },=
            loyalty360: {
                pattern: {
                    source: ["events-app"],
                    detailType: ["todo.created"],
                },
                targets: {
                    loyalty360: new Function(stack, "loyalty360", {
                        handler: "packages/functions/src/events/loyalty-360.main",
                        bind: [SERVICEBUS_CONNECTION_STRING],
                    }),
                },
            },
        },
    });
    const api = new Api(stack, "api", {
        defaults: {
            function: {
                bind: [tamasEventBus, SERVICEBUS_CONNECTION_STRING],
            },
        },
        routes: {
            "GET /": "packages/functions/src/lambda.handler",
            "GET /todo": "packages/functions/src/todo.list",
            "POST /todo": "packages/functions/src/todo.create",
        },
    });
    stack.addOutputs({
        ApiEndpoint: api.url,
    });
}
