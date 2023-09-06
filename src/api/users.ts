import Router from '@koa/router';
import AuthAdmin from '../middleware/auth_admin';
import { AddUser, GetUserInfo, GetUserList, DeleteUserList, UpdateUser } from '../service/user';
import { BeError, BeSuccess } from '../util/response';

const router = new Router();

// 用户列表
router.get('/', AuthAdmin, async function (ctx) {
    const { page, username, o_username, status } = ctx.query;
    try {
        const data = await GetUserList(page as string, username, o_username, status);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
router.get('/get/:uuid', AuthAdmin, async function (ctx) {
    const { uuid } = ctx.params;
    try {
        const data = await GetUserInfo(uuid);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
//删除用户
router.post('/del', AuthAdmin, async function (ctx) {
    const { ids } = ctx.request.body;
    try {
        console.log(ids);
        await DeleteUserList(ids, ctx.uuid);
        ctx.body = BeSuccess();
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
router.get('/profile', AuthAdmin, async function (ctx) {
    try {
        const data = await GetUserInfo(ctx.uuid);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

router.post('/edit', AuthAdmin, async function (ctx) {
    const { username, password, nickname, uuid, uidentity, tell } = ctx.request.body;
    try {
        if (username.length < 4) throw new Error('用户名不能小于4位');
        if (!uuid) {
            if (!password || password.length < 4) throw new Error('密码不能小于4位');
        }
        await AddUser(ctx.uuid, username, password, nickname, uidentity, tell, uuid);
        ctx.body = BeSuccess();
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
router.post('/update', AuthAdmin, async function (ctx) {
    const { uuid, status } = ctx.request.body;
    try {
        await UpdateUser(ctx.uuid, uuid, status ? 1 : 0);
        ctx.body = BeSuccess();
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

export default router.routes();
