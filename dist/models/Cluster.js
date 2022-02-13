"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterState = void 0;
const uuid_1 = require("uuid");
const Device_1 = __importDefault(require("./Device"));
class Cluster {
    constructor() {
        this.state = ClusterState.Inactive;
        this.devices = [];
        this.uuid = (0, uuid_1.v4)();
        this.state = ClusterState.Active;
        this.lastUpdate = new Date();
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
}
exports.default = Cluster;
var ClusterState;
(function (ClusterState) {
    ClusterState[ClusterState["Active"] = 0] = "Active";
    ClusterState[ClusterState["Busy"] = 1] = "Busy";
    ClusterState[ClusterState["Inactive"] = 2] = "Inactive";
})(ClusterState = exports.ClusterState || (exports.ClusterState = {}));
