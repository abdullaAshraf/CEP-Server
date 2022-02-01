"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clusterManager_1 = __importDefault(require("../services/clusterManager"));
const router = express_1.default.Router();
router.post('/', (req, res, next) => {
    const response = clusterManager_1.default.register();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
});
exports.default = router;
