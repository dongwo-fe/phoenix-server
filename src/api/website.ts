import Router from '@koa/router';
import { BeError, BeSuccess } from '../util/response';
import AuthAdmin from '../middleware/auth_admin';
import {
    GetWebsiteList,
    UpdateWebsite,
    UseWebsite,
    GetWebsite,
    DeleteWebsite,
    GetWebsiteLast,
    SaveIndex,
    GetConfigFromHost,
    SetWebsiteConfig,
    GetIndexCache,
} from '../service/website';
import AythServer from '../middleware/auth_server';
import Cros from '../middleware/cros';

const router = new Router();

router.get('/', AuthAdmin, async function (ctx) {
    const { page, username, type, status, env, pid, host } = ctx.query;
    try {
        const data = await GetWebsiteList(Number(page), username as string, type as string, status as string, env as string, host as string, pid as string);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

// 获取域名对应的最新内容
router.get('/last', AuthAdmin, async function (ctx) {
    const { host } = ctx.query;
    try {
        if (!host) throw new Error('没有内容');
        const data = await GetWebsiteLast(host as string);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

router.get('/info', AuthAdmin, async function (ctx) {
    const { id } = ctx.query;
    try {
        if (!id) throw new Error('没有内容');
        const data = await GetWebsite(Number(id));
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

router.post('/edit', AuthAdmin, async function (ctx) {
    const { id, title, release_time, publish_time, type, proportion, ips } = ctx.request.body;
    try {
        if (!id) throw new Error('不存在的内容');
        await UpdateWebsite(ctx.uuid, id, title, release_time, publish_time, type, proportion, ips);
        ctx.body = BeSuccess();
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

// 启用 暂停
router.post('/use', AuthAdmin, async function (ctx) {
    const { id, status } = ctx.request.body;
    try {
        if (!id) throw new Error('不存在的内容');
        await UseWebsite(ctx.uuid, id, status);
        ctx.body = BeSuccess();
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

router.post('/del', AuthAdmin, async function (ctx) {
    const { id } = ctx.request.body;
    try {
        if (!id) throw new Error('不存在的内容');
        await DeleteWebsite(ctx.uuid, id);
        ctx.body = BeSuccess();
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

router.post('/upload', AythServer, async function (ctx) {
    const { html, env, pathName } = ctx.request.body;
    try {
        if (!html) throw new Error('无内容');
        if (!env) throw new Error('无环境');

        const data = await SaveIndex(html, env, pathName);
        ctx.body = BeSuccess(data);
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message);
    }
});

//主动搜索用户访问的html
router.get('/entry', async function (ctx) {
    const { host, ip, tell } = ctx.query;
    try {
        const data = await GetIndexCache(host as string, ip as string, tell as string);

        let html: string = await SetWebsiteConfig(host as string, data.html);
        ctx.body = BeSuccess({ html, md5: data.md5 });
    } catch (error) {
        ctx.body = BeError(error.message);
    }
});
router.all('/config', Cros, async function (ctx) {
    const { host } = ctx.query;
    try {
        const data = await GetConfigFromHost(host);
        ctx.body = BeSuccess(data);
    } catch (error) {
        ctx.body = BeError(error.message);
    }
});

export default router.routes();
