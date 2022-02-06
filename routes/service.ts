import express from 'express';
import ServiceRequest from '../models/ServiceRequest';
import ClusterManager from '../services/clusterManager';
import Scheduler from '../services/scheduler';
const router = express.Router();

// TODO: define DTOs for request body
router.post('/', (req, res, next) => {
  const cluster = ClusterManager.getCluster(req.body.clusterId);
  if (!cluster) {
    res.status(400);
    res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid.'));
  } else {
    const device = cluster.getOrCreateDevice(req.body.deviceId);
    const request = new ServiceRequest(req.body.name, req.body.command, device, cluster);
    Scheduler.addToQueue(request);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(request.uuid));
  }
});

router.put('/finished', (req, res, next) => {
  const cluster = ClusterManager.getCluster(req.body.clusterId);
  if (!cluster) {
    res.status(400);
    res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid.'));
  } else {
    const device = cluster.getOrCreateDevice(req.body.deviceId);
    const serviceIndex = device.assigned.findIndex(request => request.uuid === req.body.uuid);
    if (serviceIndex === -1) {
      res.status(400);
      res.end(JSON.stringify('There is no service with this uuid assigned to this device.'));
    }
    device.assigned.splice(serviceIndex, 1);
    // TODO: send notification to the original requester with finished state
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify('sucess'));
  }
});

router.get('/', (req, res, next) => {
  const cluster = ClusterManager.getCluster(req.body.clusterId);
  res.setHeader('Content-Type', 'application/json');
  if (!cluster) {
    res.status(400);
    res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid'));
  } else {
    cluster.updateBenchmarks(req.body.benchmarks);
    const response = {
      services: cluster.getAssignments()
    }
    res.end(JSON.stringify(response));
  }
});

router.put('/schedule', (req, res, next) => {
  Scheduler.triggerProcessQueue();
  res.end("done");
});

export default router;
