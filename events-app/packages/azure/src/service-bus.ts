import { ServiceBusClient, ServiceBusMessageBatch } from "@azure/service-bus";

async function sendMessagesToServiceBus(connectionString: string, queueName: string, messages: any[]) {
    const sbClient = new ServiceBusClient(connectionString);
    const sender = sbClient.createSender(queueName);
  
    let batch: ServiceBusMessageBatch = await sender.createMessageBatch();
    for (const message of messages) {
      if (!batch.tryAddMessage(message)) {
        await sender.sendMessages(batch);
        batch = await sender.createMessageBatch();
        batch.tryAddMessage(message);
      }
    }
  
    await sender.sendMessages(batch);
    await sender.close();
    await sbClient.close();
  }
  
  export default sendMessagesToServiceBus;