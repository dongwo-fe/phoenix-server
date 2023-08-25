import { Model, DataTypes, Op } from 'sequelize';
import db from '../db/mysql';

// 日志列表
class Logs extends Model {
    id: number;
    myid: string;
    title: string;
    type: string;
    doestype: string;
    content: string;
}
Logs.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            comment: '名称',
        },
        myid: {
            type: DataTypes.STRING(50),
            defaultValue: '',
            comment: '操作的id',
        },
        type: {
            type: DataTypes.TINYINT({ length: 5 }),
            defaultValue: 0,
            comment: '项目类型',
        },
        content: {
            type: DataTypes.TEXT,
            comment: '内容',
        },
        doestype: {
            type: DataTypes.TINYINT({ length: 1 }),
            defaultValue: 0,
            comment: '操作类型，0:新增,1:修改,2:删除',
        },
        username: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            comment: '操作人',
        },
        nickname: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            comment: '操作人',
        },
    },
    {
        sequelize: db,
        freezeTableName: true,
        tableName: 't_canary_logs',
    }
);

//强制初始化数据库
// Logs.sync({ force: true });

export default {
    sync(force = true) {
        return Logs.sync({ force });
    },
    insert: function (model: any) {
        return Logs.create(model);
    },
    getlist(pageindex: number, type?: number, myid?: string, nickname?: string) {
        let opts: any = {};
        if (type !== undefined) {
            opts.type = type;
        }
        if (myid !== undefined) {
            opts.host = myid;
        }
        if (nickname) {
            opts.nickname = nickname;
        }

        return Logs.findAndCountAll({
            where: opts,
            order: [['id', 'desc']],
            limit: 20,
            offset: (pageindex - 1) * 20,
        });
    },
};
