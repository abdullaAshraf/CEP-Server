import Cluster from "../models/Cluster";
import Device, { IDevice } from "../schema/Device";
import Service, { IService, ServiceState } from "../schema/Service";


export default class NotificationManager {
    static async notify(serviceUuid: string) {
        const service = await Service.findOne({uuid: serviceUuid}).populate('requester');
        //TODO: check if failed
        service.state = ServiceState[ServiceState.Done];
        await service.save();

        const device = service.requester;
        device.notifications.push(service._id);
        await device.save();
    }

    static getNotifications(cluster: Cluster): any[] {
        const notifications: any[] = [];
        cluster.devices.forEach(device => {
            device.notifications.forEach(request => {
                notifications.push({
                    device: device.id,
                    uuid: request.uuid,
                });
            });
            device.notifications = [];
        });
        return notifications;
    }
}