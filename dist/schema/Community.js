"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const communitySchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
exports.default = mongoose_1.default.model('Community', communitySchema);
