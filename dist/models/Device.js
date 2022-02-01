"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Device {
    constructor(id) {
        this.benchmarks = [];
        this.assigned = [];
        this.id = id;
    }
    assign(request) {
        this.assigned.push(request);
    }
    addBenchmark(benchmark, override = true) {
        if (override) {
            this.benchmarks = this.benchmarks.filter(item => item.type !== benchmark.type);
        }
        this.benchmarks.push(benchmark);
    }
    getScore() {
        //TODO calculate score
        return 0;
    }
}
exports.default = Device;
