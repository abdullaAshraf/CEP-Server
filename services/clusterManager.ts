import Cluster, { ClusterState } from "../models/Cluster";
import Scheduler from './scheduler';
import { CronJob } from 'cron';
import Utils from "../utilities/dateUtils";

export default class ClusterManager {
    // give cluster checkups time before updating inactive and busy clusters
    private static cronClusterCycle = '0 1/5 * * * *';
    private static cronUpdateActivty = '0 2/5 * * * *';
    private static busyAfter = 5;
    private static inactiveAfter = 20;

    private static clusters: Cluster[] = [];
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
        this.clusters.push(cluster);
        return {
            uuid: cluster.uuid,
            cycle: this.cronClusterCycle
        }
    }

    static getActiveClusters():  Cluster[] {
        return this.clusters.filter(cluster => cluster.state === ClusterState.Active);
    }

    static getCluster(uuid: string) {
        return this.clusters.find(cluster => cluster.uuid === uuid);
    }

    static revokeAllAssingedServices() {
        this.clusters.forEach(cluster => cluster.revokeAssignments());
    }

    static async updateClustersState(): Promise<void> {
        this.clusters.forEach(cluster => {
            if (Utils.minutesBetween(cluster.lastUpdate, new Date()) >= this.inactiveAfter) {
                cluster.state = ClusterState.Inactive;
                const requests = cluster.revokeAssignments();
                requests.forEach(request => Scheduler.addToQueue(request));
            } else if (Utils.minutesBetween(cluster.lastUpdate, new Date()) >= this.busyAfter) {
                cluster.state = ClusterState.Busy;
            } else {
                cluster.state = ClusterState.Active;
            }
        });
    }
}