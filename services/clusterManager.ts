import Cluster, { ClusterState } from "../models/Cluster";
import { CronJob } from 'cron';
import DateUtils from "../utilities/dateUtils";
import ClusterSchema from '../schema/Cluster';
import {v4 as uuidv4} from 'uuid';
import Mapper from "./mapper";
import { ServiceState } from "../schema/Service";

export default class ClusterManager {
    // give cluster checkups time before updating inactive and busy clusters
    private static cronBenchmarkCycle = '0 3/5 * * * *';
    private static cronAssignmentCycle = '0 1/5 * * * *';
    private static cronUpdateActivity = '0 2/5 * * * *';
    private static busyAfter = 5; // 5 mins
    private static inactiveAfter = 20; // 20 mins
    private static deleteAfter = 1440; // 1 day

    private static cronJob: CronJob;

    static initialize() {
        this.cronJob = new CronJob(this.cronUpdateActivity, async () => {
            try {
              await this.updateClustersState();
            } catch (e) {
              console.error(e);
            }
          });
    }

    static async register(userId: string): Promise<any> {
        const cluster = new ClusterSchema({
            uuid: uuidv4(),
            owner: userId,
            state: ClusterState[ClusterState.Active],
            devices: []
        });
        const savedCluster =  await cluster.save();
        return {
            uuid: cluster.uuid,
            benchmarkCycle: this.cronBenchmarkCycle,
            assignmentCycle: this.cronAssignmentCycle
        }
    }

    static async getAllClusters(): Promise<Cluster[]> {
        const clusters = await ClusterSchema.find().populate('owner').populate({
            path: 'devices',
            populate: {
                path: 'services notifications'
            }});
        return clusters.map(cluster => Mapper.toCluster(cluster));
    }

    static async getActiveClusters():  Promise<Cluster[]> {
        const clusters = await ClusterManager.getAllClusters();
        return clusters.filter(cluster => cluster.state === ClusterState.Active);
    }

    static async getCluster(uuid: string): Promise<Cluster> {
        const cluster = await ClusterSchema.findOne({uuid: uuid}).populate('owner').populate({
            path: 'devices',
            populate: {
                path: 'services notifications'
            }});
        return Mapper.toCluster(cluster);
    }

    static async revokeAllAssignedServices() {
        const clusters = await ClusterManager.getAllClusters();
        clusters.forEach(cluster => {
            cluster.revokeAssignments();
            cluster.save(true, false);
        });
    }

    static async updateClustersState(): Promise<void> {
        const clusters = await ClusterManager.getAllClusters();
        clusters.forEach(cluster => {
            const minsDiff = DateUtils.minutesBetween(cluster.lastUpdate, new Date());
            if (minsDiff >= this.deleteAfter) {
                cluster.delete();
            } else if (minsDiff >= this.inactiveAfter) {
                cluster.state = ClusterState.Inactive;
                const requests = cluster.revokeAssignments();
                requests.forEach(request => {
                    request.state = ServiceState[ServiceState.Queue];
                    request.save();
                });
                cluster.save(true, false);
            } else if (minsDiff >= this.busyAfter) {
                cluster.state = ClusterState.Busy;
                cluster.save(false, false);
            } else {
                cluster.state = ClusterState.Active;
                cluster.save(false, false);
            }
        });
    }
}