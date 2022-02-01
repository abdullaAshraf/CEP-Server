"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class ServiceRequest {
    constructor(name, command, device, cluster) {
        this.uuid = (0, uuid_1.v4)();
        this.name = name;
        this.command = command;
        this.device = device;
        this.cluster = cluster;
    }
}
exports.default = ServiceRequest;
