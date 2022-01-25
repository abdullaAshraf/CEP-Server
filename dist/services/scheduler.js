"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Scheduler {
    static addToQueue(serviceRequest) {
        this.queue.push(serviceRequest);
    }
    static processQueue() {
        const result = [...this.queue];
        this.queue.forEach(serviceRequest => {
            console.log(serviceRequest);
            this.queue.shift();
        });
        return result;
    }
}
exports.default = Scheduler;
Scheduler.queue = [];
