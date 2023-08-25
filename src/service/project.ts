import GitHouseModel from '../model/git_house';
import { ConfigLogs, EnvsLogs, HouseLogs } from './logs';
import { updateWebsiteConfig } from './upload_cache';

//=====================新版项目和域名对应关系控制逻辑======================
/**
 * 获取所有git项目
 * @returns
 */
export async function getGitHouse() {
    return GitHouseModel.getAll();
}

interface IEditHouse {
    id?: number;
    title: string;
    git_url?: string;
}
export async function AddEditHouse(uuid: string, data: IEditHouse) {
    HouseLogs(data.id ? '编辑git项目' : '创建git项目', JSON.stringify(data), data.id || 0, 0, uuid);
    // 编辑
    if (data.id) {
        return GitHouseModel.updateHouse({ title: data.title, git_url: data.git_url }, data.id);
    } else {
        return GitHouseModel.addHouse(data);
    }
}
export async function deleteGitHouse(uuid: string, id: number) {
    const model = await GitHouseModel.getGitHouse(id);
    if (!model) return;
    HouseLogs('删除git项目', JSON.stringify({ id: model.id, title: model.title, json_data: model.json_data }), id, 1, uuid);
    return GitHouseModel.deleteGithouse(id);
}

interface IEditEnv {
    id: number;
    host: string;
    env: string;
    path_name: string;
    status: number;
}
export async function AddEditEnv(uuid: string, pid, data: IEditEnv) {
    EnvsLogs(data.id ? '编辑绑定域名' : '创建绑定域名', JSON.stringify(data), data.id || 0, 0, uuid);
    // 编辑
    if (data.id) {
        const model = await GitHouseModel.getEnv(data.id);
        // 编辑域名的时候通知更新对应域名的配置内容
        if (model?.host !== data.host) {
            updateWebsiteConfig(model?.host || '');
        }
        return GitHouseModel.updateEnv({ host: data.host, env: data.env, path_name: data.path_name, status: data.status }, data.id, pid);
    } else {
        // 域名只能存在一个
        const count = await GitHouseModel.getHostCount(data.host);
        if (count > 0) throw new Error('已经存在这个域名了');
        const count2 = await GitHouseModel.getPathNameCount(data.path_name);
        if (count2 > 0) throw new Error('已经存在这个文件目录了');
        return GitHouseModel.addEnv({ pid, host: data.host, env: data.env, path_name: data.path_name });
    }
}
export async function deleteEnv(uuid: string, id: number) {
    const model = await GitHouseModel.getEnv(id);
    if (!model) return;
    EnvsLogs(
        '删除绑定域名',
        JSON.stringify({ id: model.id, pid: model.pid, path_name: model.path_name, host: model.host, env: model.env, json_data: model.json_data }),
        id,
        1,
        uuid
    );
    return GitHouseModel.deleteEnv(id);
}
// 通过目录查找一个域名
export async function FindEnvHost(name: string) {
    return GitHouseModel.getByPathName(name);
}

export async function GetHouseByID(id: number) {
    return GitHouseModel.getHouse(id);
}

// 获取json
export async function GetHouseJson(id: number, type: number) {
    // 域名下
    if (type == 1) {
        const currJson = await GitHouseModel.getEnvJson(id);
        if (!currJson) throw new Error('内容不存在');
        const baseJson = await GitHouseModel.getHouseJson(currJson.pid);
        return {
            currJson,
            baseJson,
        };
    }
    if (type == 0) {
        const currJson = await GitHouseModel.getHouseJson(id);
        return {
            currJson,
        };
    }
}

export async function UpdateHouseJson(uuid: string, id: number, type: number, json_data: any) {
    if (type == 0) {
        await GitHouseModel.updateHouse({ json_data }, id);
        // 编辑全局域名的时候通知更新所有域名
        const envs = await GitHouseModel.getAllHouseEnv(id);
        const list = envs.map((item) => item.host);
        updateWebsiteConfig(list.join());
    }
    if (type == 1) {
        await GitHouseModel.updateEnvJson({ json_data }, id);
        //编辑独立域名的时候通知独立域名
        const model = await GitHouseModel.getEnv(id);
        updateWebsiteConfig(model?.host || '');
    }
    ConfigLogs('修改配置', JSON.stringify(json_data), id, 0, uuid);
}
