import Router from '@koa/router';
import { CheckToken } from '../service/user';
import { BeError } from '../util/response';

export default async function AuthAdmin(ctx: Router.RouterContext, next: any) {
    try {
        if (!ctx.headers.token) throw new Error('未登录');
        const uuid = await CheckToken(ctx.headers.token);
        if (!uuid) throw new Error('登录已失效');
        ctx.uuid = uuid;
        await next();
    } catch (error) {
        console.log(error);
        ctx.body = BeError(error.message, 401);
    }
}
