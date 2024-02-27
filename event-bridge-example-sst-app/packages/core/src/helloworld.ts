export * as HelloWorld from "./helloworld";
import { z } from "zod";

import { event } from "./event";

export const Events = {
  HelloWorld: event(
    "HelloWorld",
    z.object({
    })
  ),
};