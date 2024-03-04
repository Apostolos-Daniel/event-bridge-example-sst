import { API } from "./stacks/MyStack";
export default {
    config(_input) {
        return {
            name: "events-app",
            region: "eu-west-1",
        };
    },
    stacks(app) {
        app.stack(API);
    }
};
