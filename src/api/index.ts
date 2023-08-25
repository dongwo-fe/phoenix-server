import Router, { RouterContext } from '@koa/router';
import { GetIndexCache, SetWebsiteConfig } from '../service/website';

const router = new Router<RouterContext>();

router.get('/', async function (ctx) {
    const host = ctx.host;
    const ips = ctx.ip.split(':');
    const ip = ctx.headers['remoteip'] || ips[ips.length - 1];
    const matchEtag = ctx.headers['if-none-match'] || '';
    try {
        const tell = ctx.cookies.get('_tell') || ctx.query._test || '';
        const data = await GetIndexCache(host, ip as string, tell as string);
        let html: string = await SetWebsiteConfig(host, data.html);
        // 测试环境设置60s本地缓存，生产环境设置10分钟缓存
        if (data.env !== 'production') {
            ctx.set('cache-control', 'private;max-age=60');
        } else {
            ctx.set('cache-control', 'private;max-age=600');
        }
        const etag = data.md5;
        ctx.set('etag', etag);
        // 如果匹配 返回304
        if (etag === matchEtag) {
            ctx.status = 304;
            ctx.body = null;
        } else {
            ctx.body = html;
        }
    } catch (error) {
        console.log(error);
        //出错的情况下路由去最新的缓存cdn
        ctx.status = 304;
        ctx.body = '404';
    }
});

export default router.routes();
