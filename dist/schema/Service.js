"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceState = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var ServiceState;
(function (ServiceState) {
    ServiceState[ServiceState["Queue"] = 0] = "Queue";
    ServiceState[ServiceState["Assigned"] = 1] = "Assigned";
    ServiceState[ServiceState["Done"] = 2] = "Done";
    ServiceState[ServiceState["Failed"] = 3] = "Failed";
})(ServiceState = exports.ServiceState || (exports.ServiceState = {}));
const serviceSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Device',
    },
    state: {
        type: String,
        enum: ['Queue', 'Assigned', 'Done', 'Failed'],
        default: 'Queue'
    },
});
exports.default = mongoose_1.default.model('Service', serviceSchema);
