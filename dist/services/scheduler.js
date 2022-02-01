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
const cron_1 = require("cron");
const clusterManager_1 = __importDefault(require("./clusterManager"));
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
    static addToQueue(serviceRequest) {
        this.queue.push(serviceRequest);
    }
    static triggerProcessQueue() {
        try {
            // copy queue contents to an offline copy so it is not disturbed by incoming requests
            const queueCopy = [...this.queue];
            this.queue = [];
            this.processQueue(clusterManager_1.default.getActiveClusters(), queueCopy);
        }
        catch (e) {
            console.error(e);
        }
    }
    static processQueue(clusters, requests) {
        return __awaiter(this, void 0, void 0, function* () {
            requests.forEach(request => {
                console.log(request);
                let mxScore = 0;
                let mxDevice;
                clusters.forEach(cluster => {
                    const result = cluster.getHighestScore();
                    if (result.score > mxScore) {
                        mxScore = result.score;
                        mxDevice = result.device;
                    }
                });
                if (mxDevice && mxScore > 0) {
                    mxDevice.assign(request);
                }
                else {
                    //if no device is free at the moment add the request back to the queue for next iteration
                    Scheduler.addToQueue(request);
                }
            });
        });
    }
}
exports.default = Scheduler;
Scheduler.cronExpression = '0 0/5 * * * *';
Scheduler.queue = [];
