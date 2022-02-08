import ServiceRequest from "../models/ServiceRequest";
import { CronJob } from 'cron';
import Cluster from "../models/Cluster";
import ClusterManager from "./clusterManager";
import Device from "../models/Device";
import util from "util";

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

    static clearQueue() {
        this.queue = [];
    }

    private static async processQueue(clusters: Cluster[], requests: ServiceRequest[]): Promise<void> {
        requests.forEach(request => {
            console.log(util.inspect(request, {showHidden: false, depth: null, colors: true}))
            let mxScore = 0;
            let mxDevice: Device | undefined;
            clusters.forEach(cluster => {
                const result = cluster.getHighestScore();
                console.log("highest score: ", result.score, " cluster: ", cluster.uuid);
                if (result.score > mxScore) {
                    mxScore = result.score;
                    mxDevice = result.device;
                }
            });

            if (mxDevice && mxScore > 0){
                console.log("assigned to device ", mxDevice.id);
                mxDevice.assign(request);
            } else {
                console.log("readded to queue")
                //if no device is free at the moment add the request back to the queue for next iteration
                Scheduler.addToQueue(request);
            }
        });
    }
}