import Router, { RouterContext } from '@koa/router';
import { BeError, BeSuccess } from '../util/response';
import { AddEditEnv, AddEditHouse, GetHouseJson, UpdateHouseJson, deleteEnv, deleteGitHouse, getGitHouse } from '../service/project';
import AuthAdmin from '../middleware/auth_admin';
import { GetConfigFromHost } from '../service/website';

const router = new Router<RouterContext>();

// 仓库列表
router.get('/', async function (ctx) {
    try {
        const data = await getGitHouse();
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
// 创建git项目
router.post('/create_house', AuthAdmin, async function (ctx) {
    const { id, title, git_url } = ctx.request.body;
    try {
        if (!title) throw new Error('标题不能为空');
        const data = await AddEditHouse(ctx.uuid, { id, title, git_url });
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
router.post('/delete_house', AuthAdmin, async function (ctx) {
    const { id } = ctx.request.body;
    try {
        if (!id) throw new Error('项目不存在');
        const data = await deleteGitHouse(ctx.uuid, id);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
// 编辑环境
router.post('/create_env', AuthAdmin, async function (ctx) {
    const { pid, id, host, env, path_name, status } = ctx.request.body;
    try {
        if (!host) throw new Error('域名不能为空');
        if (!env) throw new Error('环境不能为空');
        if (!path_name) throw new Error('编译目录不能为空');
        const data = await AddEditEnv(ctx.uuid, pid, { id, host, env, path_name, status });
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
router.post('/delete_env', AuthAdmin, async function (ctx) {
    const { id } = ctx.request.body;
    try {
        if (!id) throw new Error('项目不存在');
        const data = await deleteEnv(ctx.uuid, id);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
// 获取json对象
router.get('/json', async function (ctx) {
    const { id, type } = ctx.query;
    try {
        if (!id) throw new Error('项目不存在');
        if (type === undefined) throw new Error('项目不存在');
        const data = await GetHouseJson(Number(id), Number(type));
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
// 保存json
router.post('/json', AuthAdmin, async function (ctx) {
    const { id, type, json_data } = ctx.request.body;
    try {
        if (!id) throw new Error('项目不存在');
        if (type === undefined) throw new Error('项目不存在');
        const data = await UpdateHouseJson(ctx.uuid, id, type, json_data);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

// 输出相关配置
router.get('/config', async function (ctx) {
    try {
        const data = GetConfigFromHost((ctx.query.host as string) || '');
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});
export default router.routes();
