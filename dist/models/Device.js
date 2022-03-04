"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Service_1 = require("../schema/Service");
const Device_1 = __importDefault(require("../schema/Device"));
class Device {
    constructor(id) {
        this.benchmarks = [];
        this.assigned = [];
        this.notifications = [];
        this.id = id;
    }
    assign(request) {
        return __awaiter(this, void 0, void 0, function* () {
            request.state = Service_1.ServiceState[Service_1.ServiceState.Assigned];
            this.assigned.push(request);
            request.save();
            const device = yield Device_1.default.findById(this._id);
            device.services.push(request._id);
            device.save();
        });
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
