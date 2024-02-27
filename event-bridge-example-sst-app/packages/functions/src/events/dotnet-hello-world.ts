export async function main(event: any) {

  console.log(`Event Received: ${JSON.stringify(event)}`);

  // Example of accessing a detail field in an EventBridge event
  const detail = event.detail;
  console.log(`Event detail: ${JSON.stringify(detail, null, 2)}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Event processed successfully" }),
  };
}
