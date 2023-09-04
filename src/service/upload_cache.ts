import config from 'config';
import { InitWesiteCache, RefreshConfigCache, UpdateConfigCache, updateCache } from './website';
import { MQUpdateEnvConfig, PushMQMessage } from '../task/upload_website';

const MQConfig: any = config.get('mq');

// 有MQ配置走mq通知
if (MQConfig) {
    require('../task');
}
//刷新内存数据
setTimeout(() => {
    InitWesiteCache();
    RefreshConfigCache();
}, 1500);

export function updateWebsiteFromHost(host: string) {
    // 有MQ配置走mq通知
    if (MQConfig) {
        PushMQMessage(host);
    } else {
        updateCache(host);
    }
}

export function updateWebsiteConfig(host: string) {
    if (MQConfig) {
        MQUpdateEnvConfig(host);
    } else {
        UpdateConfigCache(host);
    }
}
