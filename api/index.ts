import express from 'express';
import { adminRouter } from '../src/server/adminRoutes';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use('/api/admin', adminRouter);

export default app;
