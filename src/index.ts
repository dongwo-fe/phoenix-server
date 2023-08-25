import Koa from 'koa';
import KoaBody from 'koa-body';
import routers from './router';
import home from './api';
import './service/upload_cache';

const app = new Koa();

app.use(KoaBody({ multipart: true, formLimit: '20mb' }));

//加载路由
app.use(routers.routes()).use(routers.allowedMethods());

app.use(home);

const port = process.env.PORT || '8082';
app.listen(port, function () {
    console.log(`服务器运行在http://127.0.0.1:${port}`);
});
