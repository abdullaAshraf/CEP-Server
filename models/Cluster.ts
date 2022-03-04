import Device from './Device';
import DeviceSchema from '../schema/Device'
import ClusterSchema from '../schema/Cluster'
import { IService } from '../schema/Service';
import { IUser } from '../schema/User';
import cluster from 'cluster';

export default class Cluster {
    _id: string | undefined;
    uuid: string;
    state: ClusterState = ClusterState.Inactive;
    devices: Device[] = [];
    lastUpdate: Date;
    owner: IUser;

    constructor(uuid: string, state: ClusterState, devices: Device[], lastUpdate: Date, owner: IUser) {
        this.uuid = uuid;
        this.state = state;
        this.devices = devices;
        this.lastUpdate = lastUpdate;
        this.owner = owner;
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

    revokeAssignments(): IService[] {
        let assignments: IService[] = [];
        this.devices.forEach(device => {
            assignments = assignments.concat(device.assigned);
            device.assigned = [];
        });
        return assignments;
    }

    async revokeAssignment(uuid: string): Promise<boolean> {
        for(const device of this.devices) {
            const service = device.assigned.find(request => request.uuid === uuid);
            if (service) {
                await DeviceSchema.updateOne({_id: device._id}, {
                    $pullAll: {
                        services: [{_id: service._id}],
                    },
                  });
                return true;
            }
        }
        return false;
    }

    async save(saveDevice: boolean = true, updateDate: boolean = false) {
        let promises: Promise<any>[] = []; 
        if (saveDevice) {
            promises = this.devices.map( async device => {
                if (device._id) {
                    await DeviceSchema.updateOne({_id: device._id}, {
                        benchmarks: device.benchmarks,
                        services: device.assigned.map(service => service._id),
                        notifications: device.notifications.map(service => service._id)
                    });
                } else {
                    const schema = new DeviceSchema({
                        id: device.id,
                        cluster: this._id,
                        benchmarks: device.benchmarks,
                        notifications: device.notifications,
                        services: []
                    });
                    const savedDevice = await schema.save();
                    device._id = savedDevice._id;
                }
            });
        }
        await Promise.all(promises);
        await ClusterSchema.updateOne({_id: this._id}, {
            state: ClusterState[this.state],
            lastUpdate: updateDate ? this.lastUpdate : Date.now(),
            devices: this.devices.map(device => device._id)
        });
    }

    async delete() {
        await DeviceSchema.deleteMany({_id: [this.devices.map(device => device._id)]});
        await ClusterSchema.deleteOne({_id: this._id});
    }
}

export enum ClusterState {
    Active,
    Busy,
    Inactive,
}