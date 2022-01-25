"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const scheduler_1 = __importDefault(require("../services/scheduler"));
const router = express_1.default.Router();
router.post('/', (req, res, next) => {
    scheduler_1.default.addToQueue(req.body);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify('success'));
});
router.get('/', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(scheduler_1.default.processQueue()));
});
exports.default = router;
