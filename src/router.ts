import Router from '@koa/router';

import test from './api/test';

const router = new Router();

// 接口
router.use('/api/test', test);

export default router;
