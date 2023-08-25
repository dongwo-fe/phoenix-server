import LogsModel from '../model/logs';
import { GetUserInfo } from './user';

export enum IDoestype {
    UPDATE,
    DELETE,
}

async function WriteLogs(uuid: string, data: any) {
    try {
        if (uuid) {
            const opar = await GetUserInfo(uuid);
            if (!opar) throw new Error('操作用户不存在');
            await LogsModel.insert(Object.assign({ username: opar.username, nickname: opar.nickname }, data));
        } else {
            const opar = await GetUserInfo(uuid);
            if (!opar) throw new Error('操作用户不存在');
            await LogsModel.insert(Object.assign({ username: '', nickname: '' }, data));
        }
    } catch (error) {
        console.log(error);
    }
}

// 记录项目相关日志
export async function HouseLogs(title: string, content: string, myid: number, doestype: IDoestype, uuid: string) {
    WriteLogs(uuid, {
        title,
        type: 0,
        doestype,
        content,
        myid: `${myid}`,
    });
}
// 记录域名相关日志
export async function EnvsLogs(title: string, content: string, myid: number, doestype: IDoestype, uuid: string) {
    WriteLogs(uuid, {
        title,
        type: 1,
        doestype,
        content,
        myid: `${myid}`,
    });
}
// 记录网站操作
export async function WebsiteLogs(title: string, content: string, myid: number, doestype: IDoestype, uuid: string) {
    WriteLogs(uuid, {
        title,
        type: 2,
        doestype,
        content,
        myid: `${myid}`,
    });
}

// 记录用户操作
export async function UserLogs(title: string, content: string, myid: string, doestype: IDoestype, uuid: string) {
    WriteLogs(uuid, {
        title,
        type: 3,
        doestype,
        content,
        myid,
    });
}

// 记录配置操作
export async function ConfigLogs(title: string, content: string, myid: number, doestype: IDoestype, uuid: string) {
    WriteLogs(uuid, {
        title,
        type: 4,
        doestype,
        content,
        myid: `${myid}`,
    });
}

export async function GetLogsList(pageindex = 1, type, myid, nickname) {
    return LogsModel.getlist(pageindex, type, myid, nickname);
}
