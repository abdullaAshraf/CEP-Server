import mongoose from 'mongoose';
import { ICluster } from './Cluster';
import { IService } from './Service';

export interface IDevice extends mongoose.Document  {
    _id: string;
    id: string;
    benchmarks: Benchmark[];
    services: IService[];
    cluster: ICluster;
}

const deviceSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster',
    },
    benchmarks: [{
        type: {
            type: String,
            required: true,
        },
        value: {
            type: Number,
            required: true
        },
        recordedAt: {
            type: Date,
            default: Date.now
        }
    }],
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    }]
});

export default mongoose.model('Device', deviceSchema);