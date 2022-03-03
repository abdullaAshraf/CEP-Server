"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const clusterSchema = new mongoose_1.default.Schema({
    uuid: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        enum: ['Active', 'Busy', 'Inactive'],
        default: 'Active'
    },
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    },
    devices: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Device',
        }]
});
exports.default = mongoose_1.default.model('Cluster', clusterSchema);
