import { EventHandler } from "sst/node/event-bus";
import { Order } from "@events-app/core/order";

export const handler = EventHandler(Order.Events.OrderPlaced, async (evt) => {
  console.log("Order placed", evt);
});
