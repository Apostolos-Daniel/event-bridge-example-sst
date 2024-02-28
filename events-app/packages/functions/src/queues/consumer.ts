import { SQSEvent } from "aws-lambda";

export async function main(event: any) {
  console.log(`Hello World from SQS consumer ${JSON.stringify(event)}`);
  console.log(`Message: ${JSON.stringify(event.detail)}`);

  return {};
}
