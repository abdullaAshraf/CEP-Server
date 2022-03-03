import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Invitation', invitationSchema);