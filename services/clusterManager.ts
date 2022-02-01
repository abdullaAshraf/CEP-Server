import Cluster, { ClusterState } from "../models/Cluster";
import Scheduler from './scheduler';
import { CronJob } from 'cron';
import cluster from "cluster";

export default class ClusterManager {
    // give cluster checkups time before updating inactive and busy clusters
    private static cronClusterCycle = '0 1/5 * * * *';
    private static cronUpdateActivty = '0 2/5 * * * *';
    private static busyAfter = 5;
    private static inactiveAfter = 20;

    private static queue: Cluster[] = [];
    private static cronJob: CronJob;

    static initialize() {
        this.cronJob = new CronJob(this.cronUpdateActivty, async () => {
            try {
              await this.updateClustersState();
            } catch (e) {
              console.error(e);
            }
          });
    }

    static register() {
        const cluster = new Cluster();
        this.queue.push(cluster);
        return {
            uuid: cluster.uuid,
            cycle: this.cronClusterCycle
        }
    }

    static getActiveClusters():  Cluster[] {
        return this.queue.filter(cluster => cluster.state === ClusterState.Active);
    }

    static getCluster(uuid: string) {
        return this.queue.find(cluster => cluster.uuid === uuid);
    }

    private static async updateClustersState(): Promise<void> {
        this.queue.forEach(cluster => {
            if (minutesBetween(cluster.lastUpdate, new Date()) >= this.inactiveAfter) {
                cluster.state = ClusterState.Inactive;
                const requests = cluster.revokeAssignments();
                requests.forEach(request => Scheduler.addToQueue(request));
            } else if (minutesBetween(cluster.lastUpdate, new Date()) >= this.busyAfter) {
                cluster.state = ClusterState.Busy;
            } else {
                cluster.state = ClusterState.Active;
            }
        });
    }
}