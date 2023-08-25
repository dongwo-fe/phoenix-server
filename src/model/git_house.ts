import { Model, DataTypes, Op, ModelAttributes } from 'sequelize';
import db from '../db/mysql';

// 仓库项目
class GitHouse extends Model {
    id: number;
    title: string;
    git_url: string;
    json_data: any;
}

const ModelOption: ModelAttributes = {
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
    git_url: {
        type: DataTypes.STRING,
        defaultValue: '',
        comment: '仓库地址',
    },
    json_data: {
        type: DataTypes.JSON,
        comment: '配置对象',
    },
    status: {
        type: DataTypes.TINYINT({ length: 1 }),
        defaultValue: 0,
        comment: '状态',
    },
};

GitHouse.init(ModelOption, {
    sequelize: db,
    freezeTableName: true,
    tableName: 't_git_house',
});

// 启动
// GitHouse.sync({});

// 子项目，多环境配置
class HouseENV extends Model {
    id: number;
    pid: number;
    path_name: string;
    host: string;
    env: string;
    json_data: any;
    status: number;
}
const ENVModel: ModelAttributes = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    pid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '主项目id',
    },
    path_name: {
        type: DataTypes.STRING(100),
        defaultValue: '',
        comment: '项目名称',
    },
    host: {
        type: DataTypes.STRING(100),
        defaultValue: '',
        comment: '域名',
    },
    env: {
        type: DataTypes.STRING(100),
        defaultValue: '',
        comment: '环境变量',
    },
    json_data: {
        type: DataTypes.JSON,
        comment: '配置对象',
    },
    status: {
        type: DataTypes.TINYINT({ length: 1 }),
        defaultValue: 0,
        comment: '状态',
    },
};
HouseENV.init(ENVModel, {
    sequelize: db,
    freezeTableName: true,
    tableName: 't_house_env',
});

// 启动
// HouseENV.sync({});

// 设置关系
GitHouse.hasMany(HouseENV, { foreignKey: 'pid', as: 'envs' });
HouseENV.belongsTo(GitHouse, { foreignKey: 'pid' });

export default {
    async sync(force = false) {
        GitHouse.sync({ force });
        HouseENV.sync({ force });
    },
    getAll() {
        return GitHouse.findAll({
            attributes: ['id', 'title', 'git_url', 'json_data'],
            include: { model: HouseENV, as: 'envs', attributes: ['id', 'host', 'env', 'status', 'path_name'] },
        });
    },
    getHouseAll() {
        return GitHouse.findAll({
            attributes: ['id', 'json_data'],
        });
    },
    getEnvAll() {
        return HouseENV.findAll();
    },
    getEnv(id: number) {
        return HouseENV.findOne({ where: { id } });
    },
    getEnvByHost(host: string) {
        return HouseENV.findOne({ where: { host } });
    },
    getGitHouse(id: number) {
        return GitHouse.findOne({ where: { id } });
    },
    updateHouse(data, id) {
        return GitHouse.update(data, { where: { id } });
    },
    updateEnv(data, id, pid) {
        return HouseENV.update(data, { where: { id, pid } });
    },
    updateEnvJson(data, id) {
        return HouseENV.update(data, { where: { id } });
    },
    addHouse(data: any) {
        return GitHouse.create(data);
    },
    addEnv(data: any) {
        return HouseENV.create(data);
    },
    getHostCount(host: string) {
        return HouseENV.count({ where: { host } });
    },
    getPathNameCount(path_name: string) {
        return HouseENV.count({ where: { path_name } });
    },
    deleteGithouse(id: number) {
        return GitHouse.destroy({ where: { id } });
    },
    deleteEnv(id: number) {
        return HouseENV.destroy({ where: { id } });
    },
    getByPathName(path_name: string) {
        return HouseENV.findOne({ where: { path_name } });
    },
    getHouse(id: number) {
        return GitHouse.findOne({ where: { id } });
    },
    getHouseJson(id: number) {
        return GitHouse.findOne({ where: { id }, attributes: ['id', 'json_data'] });
    },
    getEnvJson(id: number) {
        return HouseENV.findOne({ where: { id }, attributes: ['id', 'pid', 'json_data', 'host'] });
    },
    getAllHouseEnv(pid: number) {
        return HouseENV.findAll({ where: { pid }, attributes: ['id', 'host', 'path_name', 'env'] });
    },
    getEnvFromHost(host: string) {
        return HouseENV.findOne({ where: { host }, attributes: ['pid', 'json_data'] });
    },
};
