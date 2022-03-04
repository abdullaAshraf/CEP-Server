import { IService, ServiceState } from "../schema/Service";
import DeviceSchema from "../schema/Device";

export default class Device {
    _id: string | undefined;
    id: string;
    benchmarks: Benchmark[] = [];
    assigned: IService[] = [];
    notifications: IService[] = [];

    constructor(id: string) {
        this.id = id;
    }

    async assign(request: IService){
        request.state = ServiceState[ServiceState.Assigned];
        this.assigned.push(request);
        request.save();
        const device = await DeviceSchema.findById(this._id);
        device.services.push(request._id);
        device.save();
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