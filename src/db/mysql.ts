/**
 * 数据库连接类
 */
import { Sequelize } from 'sequelize';
import config from 'config';

interface IDBCONF {
    database: string;
    user: string;
    password: string;
    host: string;
    port: number;
    connectionLimit: number;
}

const dbConfig: IDBCONF = config.get('db');

const mysqlconnection = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port || 3306,
    dialect: 'mysql',
    dialectOptions: {
        charset: 'utf8mb4',
    },
    pool: {
        max: dbConfig.connectionLimit,
        min: 0,
        idle: 10000,
    },
    hooks: {
        afterConnect() {
            console.log('mysql连接成功', dbConfig.database);
        },
        afterDisconnect() {
            console.log('mysql连接失败', dbConfig.database);
        },
    },
});

export default mysqlconnection;
