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
exports.ClusterState = void 0;
const Device_1 = __importDefault(require("./Device"));
const Device_2 = __importDefault(require("../schema/Device"));
const Cluster_1 = __importDefault(require("../schema/Cluster"));
class Cluster {
    constructor(uuid, state, devices, lastUpdate, owner) {
        this.state = ClusterState.Inactive;
        this.devices = [];
        this.uuid = uuid;
        this.state = state;
        this.devices = devices;
        this.lastUpdate = lastUpdate;
        this.owner = owner;
    }
    getHighestScore() {
        let mxScore = 0;
        let mxDevice;
        this.devices.filter(device => device.assigned.length === 0).forEach(device => {
            if (device.getScore() > mxScore) {
                mxScore = device.getScore();
                mxDevice = device;
            }
        });
        return {
            device: mxDevice,
            score: mxScore
        };
    }
    getOrCreateDevice(id) {
        let device = this.devices.find(device => device.id === id);
        if (!device) {
            device = new Device_1.default(id);
            this.devices.push(device);
        }
        return device;
    }
    updateBenchmarks(benchmarks) {
        Object.keys(benchmarks).forEach(deviceId => {
            const device = this.getOrCreateDevice(deviceId);
            benchmarks[deviceId].forEach(benchmark => device.addBenchmark(benchmark));
        });
    }
    getAssignments() {
        this.lastUpdate = new Date();
        const assignments = [];
        this.devices.forEach(device => {
            device.assigned.forEach(request => {
                assignments.push({
                    device: device.id,
                    uuid: request.uuid,
                    name: request.name,
                    command: request.command
                });
            });
        });
        return assignments;
    }
    revokeAssignments() {
        let assignments = [];
        this.devices.forEach(device => {
            assignments = assignments.concat(device.assigned);
            device.assigned = [];
        });
        return assignments;
    }
    save(saveDevice = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let promises = [];
            if (saveDevice) {
                promises = this.devices.map((device) => __awaiter(this, void 0, void 0, function* () {
                    if (device._id) {
                        yield Device_2.default.updateOne({ _id: device._id }, {
                            benchmarks: device.benchmarks,
                            services: device.assigned.map(service => service._id),
                            notifications: device.notifications.map(service => service._id)
                        });
                    }
                    else {
                        const schema = new Device_2.default({
                            id: device.id,
                            cluster: this._id,
                            benchmarks: device.benchmarks,
                            notifications: device.notifications,
                            services: []
                        });
                        const savedDevice = yield schema.save();
                        device._id = savedDevice._id;
                    }
                }));
            }
            yield Promise.all(promises);
            yield Cluster_1.default.updateOne({ _id: this._id }, {
                state: ClusterState[this.state],
                lastUpdate: Date.now(),
                devices: this.devices.map(device => device._id)
            });
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Device_2.default.deleteMany({ _id: [this.devices.map(device => device._id)] });
            yield Cluster_1.default.deleteOne({ _id: this._id });
        });
    }
}
exports.default = Cluster;
var ClusterState;
(function (ClusterState) {
    ClusterState[ClusterState["Active"] = 0] = "Active";
    ClusterState[ClusterState["Busy"] = 1] = "Busy";
    ClusterState[ClusterState["Inactive"] = 2] = "Inactive";
})(ClusterState = exports.ClusterState || (exports.ClusterState = {}));
