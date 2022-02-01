import express from 'express';
import ClusterManager from '../services/clusterManager';
const router = express.Router();

router.post('/', (req, res, next) => {
  const response = ClusterManager.register();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(response));
});

router.put('/schedule', (req, res, next) => {
  ClusterManager.updateClustersState();
  res.end("done");
});

export default router;
