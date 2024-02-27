import { SSTConfig } from "sst";
import { API } from "./stacks/MyStack";

export default {
  config(_input) {
    return {
      name: "event-bridge-example-sst-app",
      region: "eu-west-1",
    };
  },
  stacks(app) {
    app.stack(API);
  }
} satisfies SSTConfig;
