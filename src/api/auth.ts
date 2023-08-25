import Router from '@koa/router';
import { BeError, BeSuccess } from '../util/response';
import { CheckCode, GetLoginCode, GetUserInfo, LoginUser } from '../service/user';
import AuthAdmin from '../middleware/auth_admin';
import Cros from '../middleware/cros';

const router = new Router();

router.post('/login', Cros, async function (ctx) {
    const { username, password } = ctx.request.body;
    try {
        if (!username || !password) throw new Error('账户或者密码不存在');
        const data = await LoginUser(username, password);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
// 获取当前登录用户的权限
router.get('/rules', AuthAdmin, Cros, async function (ctx) {
    try {
        ctx.body = BeSuccess();
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
// 随便校验
router.get('/check', AuthAdmin, Cros, async function (ctx) {
    try {
        const uuid = ctx.uuid;
        ctx.body = BeSuccess(uuid);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

router.post('/login2', async function (ctx) {
    const { username, password } = ctx.request.body;
    try {
        if (!username || !password) throw new Error('账户或者密码不存在');
        const data = await LoginUser(username, password);
        const code = await GetLoginCode(data.token);
        ctx.body = BeSuccess({ code });
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

router.options('/code2token', Cros);
router.post('/code2token', Cros, async function (ctx) {
    const { code } = ctx.request.body;
    try {
        if (!code) throw new Error('code不存在');
        const data = await CheckCode(code);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

router.options('/info', Cros);
router.get('/info', Cros, AuthAdmin, async function (ctx) {
    try {
        const uuid = ctx.uuid;
        const data = await GetUserInfo(uuid);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
export default router.routes();
