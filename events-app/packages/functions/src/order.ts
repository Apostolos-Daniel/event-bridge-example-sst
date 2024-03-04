import { ApiHandler } from "sst/node/api";
import { Order } from "@events-app/core/order";

export const create = ApiHandler(async (_evt) => {
  console.log(_evt.body);
  await Order.create(_evt.body as any);
  return {
    statusCode: 200,
    body: "Order created",
  };
});

export const refund = ApiHandler(async (_evt) => {
  console.log(_evt.body);
  await Order.refund(_evt.body as any);
  return {
    statusCode: 200,
    body: "Order refunded",
  };
});

export const status = ApiHandler(async (_evt) => {
  console.log(`Path parameters: ${_evt.pathParameters}`);
  const status = await Order.status("123");
  console.log(`Order status: ${status}`);
  return {
    statusCode: 200,
    body: JSON.stringify(status),
  };
});
