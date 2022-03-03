import mongoose from 'mongoose';

export interface IUser extends mongoose.Document  {
    _id: string
    name: string;
    email: string;
    password: string;
    date: Date;
    key: string;
    communities: string[];
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    date: {
        type: Date,
        default: Date.now
    },
    key: {
        type: String
    },
    communities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
    }]
});

export default mongoose.model('User', userSchema);