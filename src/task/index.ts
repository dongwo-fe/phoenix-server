import Cron from 'cron';
import MQ from '../db/mq';
import { UpdateConfigCache, updateCache } from '../service/website';

const ActiveName = 'canary_active';
const MessageName = 'canary_use';
const EnvConfigName = 'canary_env_config';

MQ.onMessage(MessageName, function (data) {
    console.log('收到host更新:' + data);
    updateCache(data);
});
//===============环境配置相关函数===============
MQ.onMessage(EnvConfigName, function (data: string) {
    console.log('收到host_config更新:' + data);
    UpdateConfigCache(data);
});
//=============================================
//保持活跃
MQ.onMessage(ActiveName, function (data) {
    console.log('活跃更新:' + data);
});
new Cron.CronJob('0 0 1 * * *', function () {
    MQ.publish(ActiveName, '测试消息' + Date.now());
}).start();
