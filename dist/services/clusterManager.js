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
const Cluster_1 = __importStar(require("../models/Cluster"));
const scheduler_1 = __importDefault(require("./scheduler"));
const cron_1 = require("cron");
class ClusterManager {
    static initialize() {
        this.cronJob = new cron_1.CronJob(this.cronUpdateActivty, () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.updateClustersState();
            }
            catch (e) {
                console.error(e);
            }
        }));
    }
    static register() {
        const cluster = new Cluster_1.default();
        this.queue.push(cluster);
        return {
            uuid: cluster.uuid,
            cycle: this.cronClusterCycle
        };
    }
    static getActiveClusters() {
        return this.queue.filter(cluster => cluster.state === Cluster_1.ClusterState.Active);
    }
    static getCluster(uuid) {
        return this.queue.find(cluster => cluster.uuid === uuid);
    }
    static updateClustersState() {
        return __awaiter(this, void 0, void 0, function* () {
            this.queue.forEach(cluster => {
                if (minutesBetween(cluster.lastUpdate, new Date()) >= this.inactiveAfter) {
                    cluster.state = Cluster_1.ClusterState.Inactive;
                    const requests = cluster.revokeAssignments();
                    requests.forEach(request => scheduler_1.default.addToQueue(request));
                }
                else if (minutesBetween(cluster.lastUpdate, new Date()) >= this.busyAfter) {
                    cluster.state = Cluster_1.ClusterState.Busy;
                }
                else {
                    cluster.state = Cluster_1.ClusterState.Active;
                }
            });
        });
    }
}
exports.default = ClusterManager;
// give cluster checkups time before updating inactive and busy clusters
ClusterManager.cronClusterCycle = '0 1/5 * * * *';
ClusterManager.cronUpdateActivty = '0 2/5 * * * *';
ClusterManager.busyAfter = 5;
ClusterManager.inactiveAfter = 20;
ClusterManager.queue = [];
