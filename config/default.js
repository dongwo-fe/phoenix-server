/**
 * 默认的配置
 */
module.exports = {
    //开发环境数据库
    db: {
        host: '127.0.0.1',
        port: 3306,
        database: 'phoenis',
        user: 'phoenis',
        password: 'vlW0#rycxoy3eOdBNMwD',
        connectionLimit: 2,
    },
    //开发环境，普通redis配置
    redis: {
        host: '127.0.0.1',
        password: '123456abc',
    },
    mq: null,
    // 钉钉登录
    dingding: {
        clientId: '',
        clientSecret: '',
    },
};
