import { nanoid, customAlphabet } from 'nanoid';
import Router from '@koa/router';
import crypto from 'crypto';
import UserModel from '../model/user';
import Redis from '../db/redis';
import { UserLogs } from './logs';

// 用户token在redis中的前缀
const USER_TOKEN_PREFIX = 'canary_user_';
//临时code的key
const USER_CODE_PREFIX = 'canary_code_';
// 用户Reids的最大时间:30天
const USER_MAX_TIME = 2592000;

const RandomCode = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 9);

// 获取md5值
export function getMD5(str: string) {
    const signature = crypto.createHmac('sha1', 'lvneng');
    return signature.update(Buffer.from(str, 'utf-8')).digest('base64');
}
console.log(getMD5('admin'));
// 获取一个临时token
async function getToken(userid: string) {
    const token = nanoid();
    const key = USER_TOKEN_PREFIX + token;
    await Redis.set(key, userid, 'EX', USER_MAX_TIME);
    // Cache.set(key, userid);
    return token;
}

// 登录之后的数据
export interface LoginContext extends Router.RouterParamContext {
    uuid: string; //uuid
}
/**
 * 登录
 * @param username 用户名
 * @param pwd 密码
 */
export async function LoginUser(username: string, pwd: string) {
    const model = await UserModel.findOne(username);
    if (!model) throw new Error('用户不存在');
    if (model.status === 0) throw new Error('用户已禁用');
    if (model.password !== getMD5(pwd)) throw new Error('密码不正确');
    const token = await getToken(model.uuid);
    return { uuid: model.uuid, token, uidentity: model.uidentity };
}

// 系统自动登录逻辑
export async function LoginUserForDD(uuid: string) {
    const token = await getToken(uuid);
    return { uuid: uuid, token };
}

//把内容存在缓存中，返回临时code
export async function GetLoginCode(token: string) {
    const code = RandomCode();
    const key = USER_CODE_PREFIX + code;
    await Redis.set(key, token, 'EX', 300);
    return code;
}
// 检查三方登录用的code
export async function CheckCode(code: string) {
    const key = USER_CODE_PREFIX + code;
    const token = await Redis.get(key);
    if (!token) throw new Error('无效code');
    Redis.del(key);
    const key2 = USER_TOKEN_PREFIX + token;
    const uuid = await Redis.get(key2);
    if (!uuid) throw new Error('登录已失效');
    const userModel = await UserModel.get(uuid);
    return {
        token,
        uuid,
        nickname: userModel && userModel.nickname,
        avatar: userModel && userModel.avatar,
    };
}

//用户信息
export async function GetUserInfo(uuid: string) {
    return UserModel.get(uuid);
}
/**
 * 检查token是否存在
 * @param token token
 * @returns
 */
export async function CheckToken(token: string) {
    const key = USER_TOKEN_PREFIX + token;
    const data = await Redis.get(key);
    if (data) return data;
    return null;
}

export async function AddUser(uuid: string, username: string, password: string, nickname: string, uidentity: string, tell: string, uuid2?: string) {
    const opar = await GetUserInfo(uuid);
    if (!opar) throw new Error('操作用户不存在');
    let data: any = { o_username: opar.username, o_nickname: opar.nickname, nickname, uidentity };
    if (password) {
        data.password = getMD5(password);
    }
    if (tell) {
        const temp = await UserModel.findTell(tell);
        if (temp && temp.uuid !== uuid2) throw new Error('手机号已存在');
        data.tell = tell;
    }
    const model = await UserModel.findOne(username);
    if (model && model.uuid !== uuid2) throw new Error('用户名已存在');
    if (uuid2) {
        await UserModel.update(data, uuid2);
        UserLogs('编辑用户', JSON.stringify(data), uuid2, 0, uuid);
    } else {
        data.username = username;
        const model2 = await UserModel.insert(data);
        UserLogs('新增用户', JSON.stringify(data), model2.uuid, 0, uuid);
    }
}

export async function UpdateUser(ouuid: string, uuid: string, status: number) {
    const opar = await GetUserInfo(ouuid);
    if (!opar) throw new Error('操作用户不存在');
    // await UserModel.update({ o_username: opar.username, o_nickname: opar.nickname, status }, uuid);
}

export async function GetUserList(pageindex: string | undefined, username, o_username, status) {
    return UserModel.getlist(Number(pageindex || 1), username, o_username, status);
}

export async function DeleteUserList(ids: string[], uuid: string) {
    if (ids.length === 0) return;
    // await UserModel.delList(ids);
    // UserLogs('删除用户', '', ids.join(), 1, uuid);
}
export async function UpdatePassword(uuid: string, pwd1, pwd2) {
    const model = await UserModel.findOneUuid(uuid);
    if (!model) throw new Error('用户不存在');
    if (model.password !== getMD5(pwd1)) throw new Error('密码不正确');
    await UserModel.update({ password: pwd2 }, uuid);
}
