import Router, { RouterContext } from '@koa/router';
import { BeError, BeSuccess } from '../util/response';
import { GetLogsList } from '../service/logs';

const router = new Router<RouterContext>();

// 钉钉登录的回调地址，需要记录用户信息并且用户登录
router.get('/', async function (ctx) {
    const { pageindex, type, myid, nickname } = ctx.query;
    try {
        const data = await GetLogsList(Number(pageindex), type, myid, nickname);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

export default router.routes();
