import express from 'express';
import Scheduler from '../services/scheduler';
const router = express.Router();

router.post('/', (req, res, next) => {
  Scheduler.addToQueue(req.body);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify('success'));
});

router.get('/', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(Scheduler.processQueue()));
});

export default router;
