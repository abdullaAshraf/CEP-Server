import { CronJob } from 'cron';
import Cluster from "../models/Cluster";
import ClusterManager from "./clusterManager";
import Device from "../models/Device";
import util from "util";
import Service, { IService, ServiceState } from '../schema/Service';
import {v4 as uuidv4} from 'uuid';
import Utils from '../utilities/Utils';

export default class Scheduler {
    private static cronExpression = '0 0/5 * * * *';

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

    static async addToQueue(name: string, command: string[], requester: Device) {
        const service = new Service({
            uuid: uuidv4(),
            name: name,
            command: command,
            requester:requester._id
          });
          await service.save();
          return service.uuid;
    }

    static async triggerProcessQueue() {
        try {
            const queue = await Service.find({state: ServiceState[ServiceState.Queue]}).populate({
                path : 'requester',
                populate : {
                  path : 'cluster',
                  populate: {
                    path : 'owner',
                  }
                }
              });
            const clusters = await ClusterManager.getActiveClusters();
            this.processQueue(clusters, queue);
          } catch (e) {
            console.error(e);
          }
    }

    static async clearQueue() {
        await Service.remove();
    }


    private static async processQueue(clusters: Cluster[], requests: IService[]): Promise<void> {
        //console.log('requests', util.inspect(requests, {showHidden: false, depth: null, colors: true}));
        //console.log('clusters', util.inspect(clusters, {showHidden: false, depth: null, colors: true}));
        requests.forEach(request => {
            const validCommunities = request.requester.cluster.owner.communities;
            let mxScore = 0;
            let mxDevice: Device | undefined;
            clusters.filter(cluster =>  Utils.arrayIntersect(cluster.owner.communities, validCommunities)).forEach(cluster => {
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
                console.log("keep in queue");
            }
        });
    }
}