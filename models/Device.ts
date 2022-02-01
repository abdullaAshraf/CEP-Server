import ServiceRequest from "./ServiceRequest";

export default class Device {
    id: string;
    benchmarks: Benchmark[] = [];
    assigned: ServiceRequest[] = [];

    constructor(id: string) {
        this.id = id;
    }

    assign(request: ServiceRequest){
        this.assigned.push(request);
    }

    addBenchmark(benchmark: Benchmark, override: boolean = true) {
        if (override) {
            this.benchmarks = this.benchmarks.filter(item => item.type !== benchmark.type);
        }
        this.benchmarks.push(benchmark);
    }

    getScore() {
        const cpuUsage = this.benchmarks.find(b => b.type === 'cpuUsage')?.value;
        const cpuCount = this.benchmarks.find(b => b.type === 'cpuCount')?.value;
        const cpuFreq = this.benchmarks.find(b => b.type === 'cpuFreq')?.value;
        return this.cpuScore(cpuUsage, cpuCount, cpuFreq);
    }
    
    cpuScore(usage: number = 0, count: number = 0, freq: number = 0) : number {
        return ((1 / (5.66 * Math.pow(freq, -0.66))) +
            (1 / (3.22 * Math.pow(usage, -0.241))) +
            (1 / (4 * Math.pow(count, -0.3)))) / 3
    }
}