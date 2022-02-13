import {v4 as uuidv4} from 'uuid';
import Device from './Device';
import ServiceRequest from './ServiceRequest';

export default class Cluster {
    uuid: string;
    state: ClusterState = ClusterState.Inactive;
    devices: Device[] = [];
    lastUpdate: Date;

    constructor() {
        this.uuid = uuidv4();
        this.state = ClusterState.Active;
        this.lastUpdate = new Date();
    }

    getHighestScore() {
        let mxScore = 0;
        let mxDevice: Device | undefined;
        this.devices.filter(device => device.assigned.length === 0).forEach(device => {
            if(device.getScore() > mxScore) {
                mxScore = device.getScore();
                mxDevice = device;
            }
        });
        return {
            device: mxDevice,
            score: mxScore
        };
    }

    getOrCreateDevice(id: string) {
        let device = this.devices.find(device => device.id === id);
        if (!device) {
            device = new Device(id);
            this.devices.push(device);
        }
        return device
    }

    updateBenchmarks(benchmarks: {[key: string]: Benchmark[]}) {
        Object.keys(benchmarks).forEach(deviceId => {
            const device = this.getOrCreateDevice(deviceId);
            benchmarks[deviceId].forEach(benchmark => device.addBenchmark(benchmark));
        });
    }

    getAssignments(): any[] {
        this.lastUpdate = new Date();
        const assignments: any[] = [];
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

    revokeAssignments(): ServiceRequest[] {
        let assignments: ServiceRequest[] = [];
        this.devices.forEach(device => {
            assignments = assignments.concat(device.assigned);
            device.assigned = [];
        });
        return assignments;
    }
}

export enum ClusterState {
    Active,
    Busy,
    Inactive,
}