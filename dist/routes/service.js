"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clusterManager_1 = __importDefault(require("../services/clusterManager"));
const scheduler_1 = __importDefault(require("../services/scheduler"));
const verify_1 = require("./verify");
const notificationManager_1 = __importDefault(require("../services/notificationManager"));
const router = express_1.default.Router();
// TODO: define DTOs for request body
// Request Service
router.post('/', verify_1.key, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cluster = yield clusterManager_1.default.getCluster(req.body.clusterId);
    if (!cluster) {
        res.status(400);
        res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid.'));
    }
    else {
        const device = cluster.getOrCreateDevice(req.body.deviceId);
        yield cluster.save();
        const uuid = yield scheduler_1.default.addToQueue(req.body.name, req.body.command, device);
        res.setHeader('Content-Type', 'application/json');
        const response = {
            uuid: uuid
        };
        res.end(JSON.stringify(response));
    }
}));
// Report Done Service
router.put('/finished', verify_1.key, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cluster = yield clusterManager_1.default.getCluster(req.body.clusterId);
    if (!cluster) {
        res.status(400);
        return res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid.'));
    }
    else {
        const found = yield cluster.revokeAssignment(req.body.uuid);
        if (!found) {
            res.status(400);
            return res.end(JSON.stringify('There is no service with this uuid assigned to this cluster.'));
        }
        yield notificationManager_1.default.notify(req.body.uuid);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify('success'));
    }
}));
// Get Assigned service
router.get('/', verify_1.key, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cluster = yield clusterManager_1.default.getCluster(req.body.clusterId);
    res.setHeader('Content-Type', 'application/json');
    if (!cluster) {
        res.status(400);
        res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid'));
    }
    else {
        const response = {
            services: cluster.getAssignments(),
            notifications: notificationManager_1.default.getNotifications(cluster)
        };
        yield cluster.save();
        res.end(JSON.stringify(response));
    }
}));
// Testing endpoint
router.put('/schedule', (req, res, next) => {
    scheduler_1.default.triggerProcessQueue();
    res.end("done");
});
// Testing endpoint
router.delete('/clear', (req, res, next) => {
    clusterManager_1.default.revokeAllAssignedServices();
    scheduler_1.default.clearQueue();
    res.end("done");
});
exports.default = router;
