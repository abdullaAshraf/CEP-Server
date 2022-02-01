import Device from "./Device";
import {v4 as uuidv4} from 'uuid';
import Cluster from "./Cluster";

export default class ServiceRequest {
    uuid: string;
    name: string;
    command: string[];
    device: Device;
    cluster: Cluster;

    constructor(name: string, command: string[], device: Device, cluster: Cluster) {
        this.uuid = uuidv4();
        this.name = name;
        this.command = command;
        this.device = device;
        this.cluster = cluster;
    }
}