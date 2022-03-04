import express from 'express';
import ClusterManager from '../services/clusterManager';
import Scheduler from '../services/scheduler';
import {key} from './verify';
import Service, { ServiceState } from '../schema/Service';
import NotificationManager from '../services/notificationManager';

const router = express.Router();

// TODO: define DTOs for request body
// Request Service
router.post('/', key, async (req, res, next) => {
  const cluster = await ClusterManager.getCluster(req.body.clusterId);
  if (!cluster) {
    res.status(400);
    res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid.'));
  } else {
    const device = cluster.getOrCreateDevice(req.body.deviceId);
    await cluster.save(true, false);
    const uuid = await Scheduler.addToQueue(req.body.name, req.body.command, device);
    res.setHeader('Content-Type', 'application/json');
    const response = {
      uuid: uuid
    }
    res.end(JSON.stringify(response));
  }
});

// Report Done Service
router.put('/finished', key, async (req, res, next) => {
  const cluster = await ClusterManager.getCluster(req.body.clusterId);
  if (!cluster) {
    res.status(400);
    return res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid.'));
  } else {
    const found = await cluster.revokeAssignment(req.body.uuid);
    if (!found) {
      res.status(400);
      return res.end(JSON.stringify('There is no service with this uuid assigned to this cluster.'));
    }
    await NotificationManager.notify(req.body.uuid);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify('success'));
  }
});

// Get Assigned service
router.get('/', key, async (req, res, next) => {
  const cluster = await ClusterManager.getCluster(req.body.clusterId);
  res.setHeader('Content-Type', 'application/json');
  if (!cluster) {
    res.status(400);
    res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid'));
  } else {
    const response = {
      services: cluster.getAssignments(),
      notifications: NotificationManager.getNotifications(cluster)
    }
    await cluster.save(true, true);
    res.end(JSON.stringify(response));
  }
});

// Testing endpoint
router.put('/schedule', (req, res, next) => {
  Scheduler.triggerProcessQueue();
  res.end("done");
});

// Testing endpoint
router.delete('/clear', (req, res, next) => {
  ClusterManager.revokeAllAssignedServices();
  Scheduler.clearQueue();
  res.end("done");
});

export default router;
