"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const invitationSchema = new mongoose_1.default.Schema({
    community: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Community',
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
});
exports.default = mongoose_1.default.model('Invitation', invitationSchema);
