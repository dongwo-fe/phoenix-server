import express from 'express';

const app = express();
const port = process.env.PORT || '8080';

// 定义一个路由
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在http://127.0.0.1:${port}`);
});
