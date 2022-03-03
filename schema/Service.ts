import mongoose from 'mongoose';
import { IDevice } from './Device';

export interface IService extends mongoose.Document {
    _id: string;
    uuid: string;
    name: string;
    command: string[];
    requester: IDevice,
    state: string
}

export enum ServiceState {
    Queue,
    Assigned,
    Done,
    Failed,
}

const serviceSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    command: [{
        type: String
    }],
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
    },
    state: {
        type: String,
        enum : ['Queue','Assigned', 'Done', 'Failed'],
        default: 'Queue'
    },
});

export default mongoose.model('Service', serviceSchema);