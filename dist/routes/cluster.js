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
const verify_1 = require("./verify");
const router = express_1.default.Router();
router.post('/', verify_1.key, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield clusterManager_1.default.register(req.user._id);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
}));
// Testing endpoint
router.put('/schedule', (req, res, next) => {
    clusterManager_1.default.updateClustersState();
    res.end("done");
});
// Update Benchmarks
router.post('/benchmark', verify_1.key, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cluster = yield clusterManager_1.default.getCluster(req.body.clusterId);
    res.setHeader('Content-Type', 'application/json');
    if (!cluster) {
        res.status(400);
        res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid'));
    }
    else {
        cluster.updateBenchmarks(req.body.benchmarks);
        yield cluster.save();
        res.end(JSON.stringify("Success"));
    }
}));
exports.default = router;
