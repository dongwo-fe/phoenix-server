/**
 * 跨域
 */
export default async function (ctx: any, next: any) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With, Token');
    ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (ctx.method == 'OPTIONS') {
        ctx.status = 204;
        ctx.body = 200;
    } else {
        await next();
    }
}
