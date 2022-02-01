"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ServiceRequest_1 = __importDefault(require("../models/ServiceRequest"));
const clusterManager_1 = __importDefault(require("../services/clusterManager"));
const scheduler_1 = __importDefault(require("../services/scheduler"));
const router = express_1.default.Router();
// TODO: define DTOs for request body
router.post('/', (req, res, next) => {
    const cluster = clusterManager_1.default.getCluster(req.body.clusterId);
    if (!cluster) {
        res.status(400);
        res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid.'));
    }
    else {
        const device = cluster.getOrCreateDevice(req.body.deviceId);
        const request = new ServiceRequest_1.default(req.body.name, req.body.command, device, cluster);
        scheduler_1.default.addToQueue(request);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(request.uuid));
    }
});
router.put('/finished', (req, res, next) => {
    const cluster = clusterManager_1.default.getCluster(req.body.clusterId);
    if (!cluster) {
        res.status(400);
        res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid.'));
    }
    else {
        const device = cluster.getOrCreateDevice(req.body.deviceId);
        const serviceIndex = device.assigned.findIndex(request => request.uuid === req.body.uuid);
        if (serviceIndex === -1) {
            res.status(400);
            res.end(JSON.stringify('There is no service with this uuid assigned to this device.'));
        }
        device.assigned.splice(serviceIndex, 1);
        // TODO: send notification to the original requester with finished state
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify('sucess'));
    }
});
router.get('/', (req, res, next) => {
    const cluster = clusterManager_1.default.getCluster(req.body.clusterId);
    res.setHeader('Content-Type', 'application/json');
    if (!cluster) {
        res.status(400);
        res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid'));
    }
    else {
        cluster.updateBenchmarks(req.body.benchmarks);
        res.end(JSON.stringify(cluster.getAssignments()));
    }
});
router.put('/schedule', (req, res, next) => {
    scheduler_1.default.triggerProcessQueue();
    res.end("done");
});
exports.default = router;
