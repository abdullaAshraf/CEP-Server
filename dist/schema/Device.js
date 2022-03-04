"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const deviceSchema = new mongoose_1.default.Schema({
    id: {
        type: String,
        required: true,
    },
    cluster: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Service',
        }],
    notifications: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Service',
        }]
});
exports.default = mongoose_1.default.model('Device', deviceSchema);
