import mongoose from 'mongoose';
import { IDevice } from './Device';
import { IUser } from './User';

export interface ICluster extends mongoose.Document  {
    _id: string;
    uuid: string;
    state: string;
    devices: IDevice[];
    lastUpdate: Date;
    owner: IUser;
}

const clusterSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        enum : ['Active','Busy', 'Inactive'],
        default: 'Active'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    },
    devices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
    }]
});

export default mongoose.model('Cluster', clusterSchema);