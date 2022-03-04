import express from 'express';
import ClusterManager from '../services/clusterManager';
import {key} from './verify';

const router = express.Router();

router.post('/', key, async (req: any, res, next) => {
  const response = await ClusterManager.register(req.user._id);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(response));
});

// Testing endpoint
router.put('/schedule', (req, res, next) => {
  ClusterManager.updateClustersState();
  res.end("done");
});

// Update Benchmarks
router.post('/benchmark', key, async (req, res, next) => {
  const cluster = await ClusterManager.getCluster(req.body.clusterId);
  res.setHeader('Content-Type', 'application/json');
  if (!cluster) {
    res.status(400);
    res.end(JSON.stringify('No cluster was found with this uuid, use register endpoint to get a valid uuid'));
  } else {
    cluster.updateBenchmarks(req.body.benchmarks);
    await cluster.save(true, true);
    res.end(JSON.stringify("Success"));
  }
});

export default router;
