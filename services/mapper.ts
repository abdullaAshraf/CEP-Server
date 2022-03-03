import Cluster, { ClusterState } from "../models/Cluster";
import Device from "../models/Device";
import { ICluster } from "../schema/Cluster";
import { IDevice } from "../schema/Device";

export default class Mapper {
    static toCluster(data: ICluster): Cluster {
        const state = ClusterState[data.state as keyof typeof ClusterState];
        const devices = data.devices.map(device => Mapper.toDevice(device));
        const cluster = new Cluster(data.uuid, state, devices, data.lastUpdate, data.owner);
        cluster._id = data._id;
        return cluster;
    }

    static toDevice(data: IDevice): Device {
        const device = new Device(data.id);
        device.benchmarks = data.benchmarks;
        device.assigned = data.services;
        device._id = data._id;
        return device;
    }
}