import { Model, DataTypes, Op } from 'sequelize';
import db from '../db/mysql';

export class Website extends Model {
    id: number;
    host: string;
    md5: string;
    env: string;
    type: number;
    proportion: number;
    ip: string;
    html: string;
    release_time: number;
    status: number;
}
Website.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        md5: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            comment: 'md5',
        },
        env: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            comment: '环境',
        },
        title: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            comment: '说明',
        },
        release_time: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            comment: '编译时间',
        },
        publish_time: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            comment: '发布时间',
        },
        type: {
            type: DataTypes.TINYINT({ length: 1 }),
            defaultValue: 0,
            comment: '类型，0全量，1灰度，2白名单',
        },
        proportion: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
            comment: '比例',
        },
        ip: {
            type: DataTypes.STRING,
            defaultValue: '',
            comment: '体验版ip地址',
        },
        pid: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '项目id',
        },
        pname: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            comment: '项目名称',
        },
        host: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            comment: '域名',
        },
        html: {
            type: DataTypes.TEXT,
            defaultValue: '',
            comment: '文件内容',
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
        status: {
            type: DataTypes.TINYINT({ length: 1 }),
            defaultValue: 0,
            comment: '状态',
        },
    },
    {
        sequelize: db,
        freezeTableName: true,
        tableName: 't_website',
        indexes: [
            {
                fields: ['status'],
            },
            {
                fields: ['host'],
            },
            {
                fields: ['host', 'status'],
            },
            {
                fields: ['type', 'host', 'status'],
            },
            {
                fields: ['publish_time', 'type', 'status'],
            },
        ],
    }
);

//强制初始化数据库
// Website.sync({ force: true });

export default {
    sync(force = true) {
        return Website.sync({ force });
    },
    insert: function (model: any) {
        return Website.create(model);
    },
    update(data, id) {
        return Website.update(data, { where: { id } });
    },
    /**
     *
     * @param type 类型，0全量，1灰度，2体验版
     * @returns
     */
    first(type: number) {
        return Website.findOne({
            where: {
                type,
            },
            order: [['id', 'asc']],
        });
    },
    findOneLast(host: string, type: number, offset: number) {
        return Website.findOne({
            where: {
                host,
                type,
                status: 1,
            },
            offset,
            order: [['id', 'desc']],
        });
    },
    findOneStatusLast(host: string, type: number, offset: number, status: number) {
        return Website.findOne({
            where: {
                host,
                type,
                status,
            },
            offset,
            order: [['id', 'desc']],
        });
    },
    updateHostLast(id: number, type: number, host: string) {
        return Website.update(
            { status: 0 },
            {
                where: {
                    id: {
                        [Op.lt]: id,
                    },
                    host,
                    type,
                    status: 1,
                },
            }
        );
    },
    //publish_time
    updateHostPubLast(type: number, lastTime: number) {
        return Website.update(
            { status: 0 },
            {
                where: {
                    publish_time: {
                        [Op.lt]: lastTime,
                    },
                    type,
                    status: 1,
                },
            }
        );
    },
    get: function (id: number) {
        return Website.findOne({
            where: {
                id,
            },
        });
    },
    getlist(pageindex: number, username: string, type: string, status: string, env: string, host: string, pid: string) {
        let opts: any = {};

        if (username) {
            opts.username = username;
        }
        if (!!type) {
            opts.type = Number(type);
        }
        if (!!status) {
            opts.status = Number(status);
        }
        if (!!pid) {
            opts.pid = Number(pid);
        }
        if (env) {
            opts.env = env;
        }
        if (host) {
            opts.host = {
                [Op.like]: '%' + host + '%',
            };
        }
        return Website.findAndCountAll({
            where: opts,
            order: [['id', 'desc']],
            limit: 20,
            offset: (pageindex - 1) * 20,
        });
    },
    getLatest(host: string) {
        let opts: any = {
            status: 1,
            host,
        };

        return Website.findAll({
            where: opts,
            order: [['id', 'desc']],
            limit: 2,
        });
    },
    getLatestList(host: string, types: number[]) {
        let opts: any = {
            status: 1,
            host,
            type: {
                [Op.in]: types,
            },
        };

        return Website.findAll({
            where: opts,
            order: ['publish_time'],
        });
    },
    delList(ids: string[]) {
        return Website.destroy({
            where: {
                uuid: {
                    [Op.in]: ids,
                },
            },
        });
    },
    getAll(host?: string) {
        let opts: any = {
            status: 1,
        };
        if (host) {
            opts.host = host;
        }
        return Website.findAll({
            where: opts,
            order: [['id', 'desc']],
            attributes: ['id', 'md5', 'env', 'type', 'proportion', 'ip', 'host', 'html'],
        });
    },
};
