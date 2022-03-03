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
const cron_1 = require("cron");
const clusterManager_1 = __importDefault(require("./clusterManager"));
const Service_1 = __importStar(require("../schema/Service"));
const uuid_1 = require("uuid");
const Utils_1 = __importDefault(require("../utilities/Utils"));
class Scheduler {
    static initialize() {
        this.cronJob = new cron_1.CronJob(this.cronExpression, () => __awaiter(this, void 0, void 0, function* () {
            try {
                this.triggerProcessQueue();
            }
            catch (e) {
                console.error(e);
            }
        }));
    }
    static addToQueue(name, command, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = new Service_1.default({
                uuid: (0, uuid_1.v4)(),
                name: name,
                command: command,
                requester: requester._id
            });
            yield service.save();
            return service.uuid;
        });
    }
    static triggerProcessQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const queue = yield Service_1.default.find({ state: Service_1.ServiceState[Service_1.ServiceState.Queue] }).populate({
                    path: 'requester',
                    populate: {
                        path: 'cluster',
                        populate: {
                            path: 'owner',
                        }
                    }
                });
                const clusters = yield clusterManager_1.default.getActiveClusters();
                this.processQueue(clusters, queue);
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    static clearQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Service_1.default.remove();
        });
    }
    static processQueue(clusters, requests) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log('requests', util.inspect(requests, {showHidden: false, depth: null, colors: true}));
            //console.log('clusters', util.inspect(clusters, {showHidden: false, depth: null, colors: true}));
            requests.forEach(request => {
                const validCommunities = request.requester.cluster.owner.communities;
                let mxScore = 0;
                let mxDevice;
                clusters.filter(cluster => Utils_1.default.arrayIntersect(cluster.owner.communities, validCommunities)).forEach(cluster => {
                    const result = cluster.getHighestScore();
                    console.log("highest score: ", result.score, " cluster: ", cluster.uuid);
                    if (result.score > mxScore) {
                        mxScore = result.score;
                        mxDevice = result.device;
                    }
                });
                if (mxDevice && mxScore > 0) {
                    console.log("assigned to device ", mxDevice.id);
                    mxDevice.assign(request);
                }
                else {
                    console.log("keep in queue");
                }
            });
        });
    }
}
exports.default = Scheduler;
Scheduler.cronExpression = '0 0/5 * * * *';
