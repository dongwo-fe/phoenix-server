import Router from '@koa/router';

import test from './api/test';
import website from './api/website';
import logs from './api/logs';
import house from './api/house';
import oauth2 from './api/oauth2';
import users from './api/users';
import auth from './api/auth';

const router = new Router();

// 接口
router.use('/api/test', test);
router.use('/api/website', website);
router.use('/api/logs', logs);
router.use('/api/house', house);
router.use('/api/oauth2', oauth2);
router.use('/api/users', users);
router.use('/api/auth', auth);

export default router;
