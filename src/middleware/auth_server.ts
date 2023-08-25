import Router from '@koa/router';
import dayjs from 'dayjs';
import { getMd5 } from '../util';

//校验服务权限，防止非法请求
export default async function (ctx: Router.RouterContext, next: any) {
    const { token } = ctx.headers;
    try {
        if (!token) throw new Error('不存在token');
        //校验规则，当天日期+固定字符
        if (checkToken(token as string)) {
            await next();
        } else {
            throw new Error('token校验失败');
        }
    } catch (error) {
        console.log(error.message);
        ctx.body = '404';
        ctx.status = 404;
    }
}

function checkToken(token: string) {
    const md5 = getMd5(dayjs().format('YYYYMMDD') + 'test');
    return token === md5;
}
