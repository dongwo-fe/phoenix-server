import { load } from 'cheerio';
import { clearWebsiteCacheByKey, getWebsiteCacheByKey, setWebsiteCache } from '../cache/websiteCache';
import GitHouseModel from '../model/git_house';
import WebsiteModel, { Website } from '../model/website';
import { WebsiteLogs } from './logs';
import { GetUserInfo } from './user';
import { updateWebsiteFromHost } from './upload_cache';
import { FindEnvHost, GetHouseByID } from './project';
import { getMd5 } from '../util';

interface IWebSite {
    md5: string;
    env: 'dev' | 'dev2' | 'dev3' | 'dev4' | 'sit' | 'uat' | 'production';
    type: number;
    proportion: number;
    ip: string;
    host: string;
    html: string;
}

// 根据域名获取内容
export async function GetIndexCache(host: string, ip: string, tell?: string): Promise<IWebSite> {
    // 缓存
    const cache = getWebsiteCacheByKey(host);
    if (!cache) throw new Error('无内容');
    // 灰度
    if (cache.grayList.length > 0) {
        for (let i = 0; i < cache.grayList.length; i++) {
            const grayCache = cache.grayList[i];
            if (grayCache.type === 2) {
                // 白名单版灰度
                if (grayCache.ip.includes(ip)) {
                    return grayCache;
                }
            }
            // 手机号
            if (grayCache.type === 4 && !!tell) {
                if (grayCache.ip.includes(tell)) {
                    return grayCache;
                }
            }
        }
    }

    // 全量
    return cache.default;
}
const EnvConfig = new Map();

// 从缓存中换取配置
export function GetConfigFromHost(host: string) {
    if (!host) return {};
    return EnvConfig.get(host);
}

export async function SetWebsiteConfig(host: string, html: string) {
    if (!host) return '';
    const configs = await GetConfigFromHost(host);
    if (!configs) return html;
    const $ = load(html);
    $('head').append(`<script>window.__DATA=${JSON.stringify(configs)}</script>`);
    return $.html();
}

// 收到MQ消息，然后更新对应的配置
export async function UpdateConfigCache(hosts: string) {
    const host_list = hosts.split(',');
    for (let index = 0; index < host_list.length; index++) {
        const host = host_list[index];
        UpdateConfigCacheFromID(host);
    }
}
//收到MQ消息，然后根据id更新对应的配置
async function UpdateConfigCacheFromID(host: string) {
    try {
        console.log('更新对应的域名配置', host);
        const model = await GitHouseModel.getEnvByHost(host);
        if (!model || !model.pid) return;
        const rootModel = await GitHouseModel.getGitHouse(model.pid);
        SaveConfigCache(model.host, model.json_data, rootModel?.json_data);
    } catch (error) {
        console.log(error);
    }
}
// 配置内容放缓存里
function SaveConfigCache(host: string, data: any, root = {}) {
    try {
        EnvConfig.set(host, Object.assign({}, root, data));
    } catch (error) {
        console.log('设置config缓存', error.message);
    }
}
//刷新数据库的配置到缓存
export async function RefreshConfigCache() {
    try {
        const root_list = await GitHouseModel.getHouseAll();
        const root_map = new Map();
        root_list.forEach((item) => {
            root_map.set(item.id, item.json_data || {});
        });
        const list = await GitHouseModel.getEnvAll();
        list.forEach((item) => {
            SaveConfigCache(item.host, item.json_data, root_map.get(item.pid));
        });
    } catch (error) {
        console.log(error.message);
    }
}
//更新对应域名的内容
export async function updateCache(host: string) {
    try {
        //根据域名拿到对应的生效的列表
        const websitelist = await WebsiteModel.getAll(host);
        let webobj = setWebsiteList(websitelist);
        const keys = Object.keys(webobj);
        //如果全部不存在
        if (keys.length === 0) {
            clearWebsiteCacheByKey(host);
        } else {
            keys.forEach((key) => setWebsiteCache(key, webobj[key]));
        }
    } catch (error) {
        console.log(error.message);
    }
}
//把列表根据域名处理成对象
function setWebsiteList(ModelList: IWebSite[] | Website[]) {
    let webobj = {};
    //根据域名分类
    ModelList.forEach((website) => {
        if (website.host) {
            const key = website.host;
            //不存在就初始化
            if (!webobj[key]) {
                webobj[key] = {
                    default: undefined,
                    grayList: [],
                };
            }
            //全量
            if (website.type === 0) {
                if (!webobj[key].default)
                    webobj[key].default = {
                        md5: website.md5,
                        env: website.env,
                        type: website.type,
                        proportion: website.proportion,
                        ip: website.ip,
                        html: website.html,
                    };
            } else {
                //灰度和体验版
                webobj[key].grayList.push({
                    md5: website.md5,
                    env: website.env,
                    type: website.type,
                    proportion: website.proportion,
                    ip: website.ip,
                    html: website.html,
                });
            }
        }
    });
    return webobj;
}
/**
 * 把生效的内容刷新到缓存里
 */
export async function InitWesiteCache() {
    try {
        //拿到所有内容
        const ModelList = await WebsiteModel.getAll();

        //根据域名分类
        let webobj = setWebsiteList(ModelList);

        Object.keys(webobj).forEach((key) => setWebsiteCache(key, webobj[key]));
    } catch (error) {
        console.log(error);
    }
}

//================================
export async function GetWebsiteList(pageindex: number, username: string, type: string, status: string, env: string, host: string, pid: string) {
    return WebsiteModel.getlist(pageindex, username, type, status, env, host, pid);
}
export async function GetWebsiteLast(host: string) {
    return WebsiteModel.getLatest(host);
}
// 查询发布项
export async function GetWebsite(id: number) {
    return WebsiteModel.get(id);
}
export async function UpdateWebsite(uuid: string, id: number, title: string, release_time: number, publish_time: number, type: number, proportion: number, ips: string) {
    let opts: any = {
        title,
        release_time,
        publish_time,
        type,
        proportion,
        ip: ips,
    };
    const opar = await GetUserInfo(uuid);
    if (!opar) throw new Error('操作用户不存在');
    opts.username = opar.username;
    opts.nickname = opar.nickname;

    WebsiteLogs(id ? '修改网站' : '新增网站', JSON.stringify(opts), id || 0, 0, uuid);
    if (id) {
        return WebsiteModel.update(opts, id);
    } else {
        return WebsiteModel.insert(opts);
    }
}
export async function UseWebsite(uuid: string, id: number, status: number) {
    const opts: any = {
        status,
    };
    const model = await WebsiteModel.get(id);
    //不存在或已经修改，则不修改内容
    if (!model || model.status === status) return;

    const opar = await GetUserInfo(uuid);
    if (!opar) throw new Error('操作用户不存在');
    opts.username = opar.username;
    opts.nickname = opar.nickname;
    if (status === 1) {
        opts.publish_time = Date.now();
    }
    WebsiteLogs('修改状态', `${model.status}-->${status}`, id, 0, uuid);
    await WebsiteModel.update(opts, id);
    // 更新缓存
    updateWebsiteFromHost(model.host);
}
export async function DeleteWebsite(uuid: string, id: number) {
    const opts: any = {
        status: -1,
    };
    const opar = await GetUserInfo(uuid);
    if (!opar) throw new Error('操作用户不存在');
    opts.username = opar.username;
    opts.nickname = opar.nickname;

    WebsiteLogs('删除网站', ``, id, 1, uuid);
    return WebsiteModel.update(opts, id);
}
// 将上传的网页内容保存到数据库中
export async function SaveIndex(html: string, env: string, pathName: string) {
    const envModel = await FindEnvHost(pathName);
    if (!envModel) throw new Error('没有绑定的域名');
    if (envModel.env.toLocaleLowerCase() !== env.toLocaleLowerCase()) throw new Error('环境不一致');

    const projectModel = await GetHouseByID(envModel.pid);
    if (!projectModel) throw new Error('不存在的项目');

    const now = Date.now();
    const model = {
        md5: getMd5(html),
        env: envModel.env,
        title: projectModel.title,
        release_time: now,
        publish_time: now,
        host: envModel.host,
        html,
        status: 0,
        nickname: '自动上传',
        username: 'system',
        ip: '',
        type: 0,
    };

    if (model.env !== 'production' && model.env !== 'gray') {
        model.status = 1;
        model.nickname = '自动发布';
    } else {
        // 配置了自动发布就发到手机号上
        const tell = await getTellConfig();
        if (tell) {
            model.type = 4;
            model.ip = tell;
            model.status = 1;
            model.nickname = '自动发布';
        }
    }
    const res = await WebsiteModel.insert(model);
    // 更新缓存
    updateWebsiteFromHost(model.host);
    WebsiteLogs('自动上传网站HTML', JSON.stringify({ md5: model.md5, env, pathName, title: projectModel.title, host: envModel.host }), res.id, 0, '');
    return res;
}
// 获取存在config上的配置内容
export async function getTellConfig() {
    try {
        return '';
    } catch (error) {
        console.log(error);
    }
    return '';
}
