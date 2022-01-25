export default class Scheduler {
    static queue: ServiceRequest[] = [];

    static addToQueue(serviceRequest: ServiceRequest) {
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