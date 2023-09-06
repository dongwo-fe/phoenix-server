import { Model, DataTypes, Op } from 'sequelize';
import db from '../db/mysql';

class Users extends Model {
    uuid: string;
    password: string;
    username: string;
    nickname: string;
    status: number;
    tell: string;
    uidentity: string;
    avatar: string;
}
Users.init(
    {
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            comment: '用户名',
        },
        password: {
            type: DataTypes.STRING(200),
            defaultValue: '',
            comment: '密码',
        },
        nickname: {
            type: DataTypes.STRING(200),
            defaultValue: '',
            comment: '昵称',
        },
        tell: {
            type: DataTypes.STRING(20),
            defaultValue: '',
            comment: '手机号',
        },
        ddunionId: {
            type: DataTypes.STRING(50),
            defaultValue: '',
            comment: '钉钉的uid',
        },
        ddopenId: {
            type: DataTypes.STRING(50),
            defaultValue: '',
            comment: '钉钉的openid',
        },
        avatar: {
            type: DataTypes.STRING(200),
            defaultValue: '',
            comment: '头像',
        },
        intro: {
            type: DataTypes.STRING(200),
            defaultValue: '',
            comment: '',
        },
        uidentity: {
            type: DataTypes.STRING(20),
            defaultValue: '',
            comment: '身份',
        },
        status: {
            type: DataTypes.TINYINT({ length: 1 }),
            defaultValue: 0,
            comment: '状态',
        },
        o_username: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            comment: '操作人',
        },
        o_nickname: {
            type: DataTypes.STRING(200),
            defaultValue: '',
            comment: '昵称',
        },
    },
    {
        sequelize: db,
        freezeTableName: true,
        tableName: 't_user',
        indexes: [
            {
                fields: ['username'],
            },
            {
                fields: ['username', 'password'],
            },
        ],
    }
);

//强制初始化数据库
// Users.sync({ force: true });

export default {
    sync(force = true) {
        return Users.sync({ force });
    },
    insert: function (model: any) {
        return Users.create(model);
    },
    update(data, uuid) {
        return Users.update(data, { where: { uuid } });
    },
    get: function (uuid: string) {
        return Users.findOne({
            where: {
                uuid,
            },
            attributes: ['uuid', 'username', 'nickname', 'avatar', 'intro', 'status', 'uidentity'],
        });
    },
    findOne(username: string) {
        return Users.findOne({ where: { username }, attributes: ['username', 'uuid', 'password', 'status'] });
    },
    findOneUuid(uuid: string) {
        return Users.findOne({ where: { uuid }, attributes: ['username', 'uuid', 'password'] });
    },
    findUser(username: string, pwd: string) {
        return Users.findOne({ where: { username, pwd }, attributes: ['name', 'uuid'] });
    },
    findTell(tell: string) {
        return Users.findOne({
            where: {
                [Op.or]: {
                    tell,
                    username: tell,
                },
            },
        });
    },
    getlist(pageindex: number, username?: string, o_username?: string, status?: string) {
        let opts: any = {};
        if (username) {
            opts.username = {
                [Op.like]: '%' + username + '%',
            };
        }
        if (o_username) {
            opts.o_username = o_username;
        }
        if (status !== undefined && status !== '') {
            opts.status = Number(status);
        }
        return Users.findAndCountAll({
            where: opts,
            order: [['createdAt', 'desc']],
            limit: 20,
            offset: (pageindex - 1) * 20,
            attributes: ['uuid', 'nickname', 'username', 'status', 'o_username', 'o_nickname', 'updatedAt', 'uidentity', 'tell'],
        });
    },
    delList(ids: string[]) {
        return Users.destroy({
            where: {
                uuid: {
                    [Op.in]: ids,
                },
            },
        });
    },
};
