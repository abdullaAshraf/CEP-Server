import ServiceRequest from "../models/ServiceRequest";
import { CronJob } from 'cron';
import Cluster from "../models/Cluster";
import ClusterManager from "./clusterManager";
import Device from "../models/Device";

export default class Scheduler {
    private static cronExpression = '0 0/5 * * * *';

    private static queue: ServiceRequest[] = []; 
    private static cronJob: CronJob;

    static initialize() {
        this.cronJob = new CronJob(this.cronExpression, async () => {
            try {
              this.triggerProcessQueue()
            } catch (e) {
              console.error(e);
            }
          });
    }

    static addToQueue(serviceRequest: ServiceRequest) {
        this.queue.push(serviceRequest);
    }

    static triggerProcessQueue() {
        try {
            // copy queue contents to an offline copy so it is not disturbed by incoming requests
            const queueCopy = [...this.queue];
            this.queue = [];
            this.processQueue(ClusterManager.getActiveClusters(), queueCopy);
          } catch (e) {
            console.error(e);
          }
    }

    private static async processQueue(clusters: Cluster[], requests: ServiceRequest[]): Promise<void> {
        requests.forEach(request => {
            console.log(request);
            let mxScore = 0;
            let mxDevice: Device | undefined;
            clusters.forEach(cluster => {
                const result = cluster.getHighestScore();
                if (result.score > mxScore) {
                    mxScore = result.score;
                    mxDevice = result.device;
                }
            });

            if (mxDevice && mxScore > 0){
                mxDevice.assign(request);
            } else {
                //if no device is free at the moment add the request back to the queue for next iteration
                Scheduler.addToQueue(request);
            }
        });
    }
}