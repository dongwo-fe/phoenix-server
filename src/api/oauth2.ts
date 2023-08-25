import Router, { RouterContext } from '@koa/router';
import { BeError, BeSuccess } from '../util/response';
import { LoginDD } from '../service/oauth2';
import { GetLoginCode } from '../service/user';

const router = new Router<RouterContext>();

// 钉钉登录的回调地址，需要记录用户信息并且用户登录
router.get('/dingding', async function (ctx) {
    const { authCode } = ctx.query;
    try {
        const data = await LoginDD(authCode as string);
        ctx.cookies.set('canary_web', data.token, { httpOnly: false });
        ctx.redirect(`https://${ctx.host}/`);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
// 钉钉第二种，内嵌式
router.get('/dingding_in', async function (ctx) {
    const { authCode } = ctx.query;
    try {
        const data = await LoginDD(authCode as string);
        const code = await GetLoginCode(data.token);
        ctx.redirect(`https://${ctx.host}/#/onLogin?code=${code}&token=${data.token}`);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
export default router.routes();
