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
const Cluster_1 = require("../models/Cluster");
const cron_1 = require("cron");
const dateUtils_1 = __importDefault(require("../utilities/dateUtils"));
const Cluster_2 = __importDefault(require("../schema/Cluster"));
const uuid_1 = require("uuid");
const mapper_1 = __importDefault(require("./mapper"));
const Service_1 = require("../schema/Service");
class ClusterManager {
    static initialize() {
        this.cronJob = new cron_1.CronJob(this.cronUpdateActivity, () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.updateClustersState();
            }
            catch (e) {
                console.error(e);
            }
        }));
    }
    static register(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cluster = new Cluster_2.default({
                uuid: (0, uuid_1.v4)(),
                owner: userId,
                state: Cluster_1.ClusterState[Cluster_1.ClusterState.Active],
                devices: []
            });
            const savedCluster = yield cluster.save();
            return {
                uuid: cluster.uuid,
                benchmarkCycle: this.cronBenchmarkCycle,
                assignmentCycle: this.cronAssignmentCycle
            };
        });
    }
    static getAllClusters() {
        return __awaiter(this, void 0, void 0, function* () {
            const clusters = yield Cluster_2.default.find().populate('owner').populate({
                path: 'devices',
                populate: {
                    path: 'services notifications'
                }
            });
            return clusters.map(cluster => mapper_1.default.toCluster(cluster));
        });
    }
    static getActiveClusters() {
        return __awaiter(this, void 0, void 0, function* () {
            const clusters = yield ClusterManager.getAllClusters();
            return clusters.filter(cluster => cluster.state === Cluster_1.ClusterState.Active);
        });
    }
    static getCluster(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const cluster = yield Cluster_2.default.findOne({ uuid: uuid }).populate('owner').populate({
                path: 'devices',
                populate: {
                    path: 'services notifications'
                }
            });
            return mapper_1.default.toCluster(cluster);
        });
    }
    static revokeAllAssignedServices() {
        return __awaiter(this, void 0, void 0, function* () {
            const clusters = yield ClusterManager.getAllClusters();
            clusters.forEach(cluster => {
                cluster.revokeAssignments();
                cluster.save();
            });
        });
    }
    static updateClustersState() {
        return __awaiter(this, void 0, void 0, function* () {
            const clusters = yield ClusterManager.getAllClusters();
            clusters.forEach(cluster => {
                const minsDiff = dateUtils_1.default.minutesBetween(cluster.lastUpdate, new Date());
                if (minsDiff >= this.deleteAfter) {
                    cluster.delete();
                    const index = clusters.indexOf(cluster);
                    if (index > -1) {
                        clusters.splice(index, 1);
                    }
                }
                else if (minsDiff >= this.inactiveAfter) {
                    cluster.state = Cluster_1.ClusterState.Inactive;
                    const requests = cluster.revokeAssignments();
                    requests.forEach(request => {
                        request.state = Service_1.ServiceState[Service_1.ServiceState.Queue];
                        request.save();
                    });
                    cluster.save(false);
                }
                else if (minsDiff >= this.busyAfter) {
                    cluster.state = Cluster_1.ClusterState.Busy;
                    cluster.save(false);
                }
                else {
                    cluster.state = Cluster_1.ClusterState.Active;
                    cluster.save(false);
                }
            });
        });
    }
}
exports.default = ClusterManager;
// give cluster checkups time before updating inactive and busy clusters
ClusterManager.cronBenchmarkCycle = '0 3/5 * * * *';
ClusterManager.cronAssignmentCycle = '0 1/5 * * * *';
ClusterManager.cronUpdateActivity = '0 2/5 * * * *';
ClusterManager.busyAfter = 5; // 5 mins
ClusterManager.inactiveAfter = 20; // 20 mins
ClusterManager.deleteAfter = 1440; // 1 day
