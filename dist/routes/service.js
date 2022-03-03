"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const Service_1 = __importStar(require("../schema/Service"));
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
        const device = cluster.getOrCreateDevice(req.body.deviceId);
        const serviceIndex = device.assigned.findIndex(request => request.uuid === req.body.uuid);
        if (serviceIndex === -1) {
            res.status(400);
            return res.end(JSON.stringify('There is no service with this uuid assigned to this device.'));
        }
        device.assigned.splice(serviceIndex, 1);
        // TODO: send notification to the original requester with finished state
        yield cluster.save();
        const service = yield Service_1.default.findOne({ uuid: req.body.uuid });
        //TODO: check if failed
        service.state = Service_1.ServiceState[Service_1.ServiceState.Done];
        yield service.save();
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
            services: cluster.getAssignments()
        };
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
