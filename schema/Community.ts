import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    description: {
        type: String,
        max: 1024
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Community', communitySchema);