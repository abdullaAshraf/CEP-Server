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
        var _a, _b, _c;
        const cpuUsage = (_a = this.benchmarks.find(b => b.type === 'cpuUsage')) === null || _a === void 0 ? void 0 : _a.value;
        const cpuCount = (_b = this.benchmarks.find(b => b.type === 'cpuCount')) === null || _b === void 0 ? void 0 : _b.value;
        const cpuFreq = (_c = this.benchmarks.find(b => b.type === 'cpuFreq')) === null || _c === void 0 ? void 0 : _c.value;
        return this.cpuScore(cpuUsage, cpuCount, cpuFreq);
    }
    cpuScore(usage = 0, count = 0, freq = 0) {
        return ((1 / (5.66 * Math.pow(freq, -0.66))) +
            (1 / (3.22 * Math.pow(usage, -0.241))) +
            (1 / (4 * Math.pow(count, -0.3)))) / 3;
    }
}
exports.default = Device;
