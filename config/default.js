/**
 * 默认的配置
 */
module.exports = {
    //开发环境数据库
    db: {
        host: '127.0.0.1',
        port: 18001,
        database: 'phoenis_db',
        user: 'phoenis_db',
        password: 'pS2ddzdkbjd6DMhy',
        connectionLimit: 2,
    },
    //开发环境，普通redis配置
    redis: {
        host: '127.0.0.1',
        password: '123456abc',
        port: 18002,
    },
    mq: null,
    // 钉钉登录
    dingding: {
        clientId: '',
        clientSecret: '',
    },
};
