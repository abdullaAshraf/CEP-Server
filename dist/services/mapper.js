"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Cluster_1 = __importStar(require("../models/Cluster"));
const Device_1 = __importDefault(require("../models/Device"));
class Mapper {
    static toCluster(data) {
        const state = Cluster_1.ClusterState[data.state];
        const devices = data.devices.map(device => Mapper.toDevice(device));
        const cluster = new Cluster_1.default(data.uuid, state, devices, data.lastUpdate, data.owner);
        cluster._id = data._id;
        return cluster;
    }
    static toDevice(data) {
        const device = new Device_1.default(data.id);
        device.benchmarks = data.benchmarks;
        device.assigned = data.services;
        device.notifications = data.notifications;
        device._id = data._id;
        return device;
    }
}
exports.default = Mapper;
