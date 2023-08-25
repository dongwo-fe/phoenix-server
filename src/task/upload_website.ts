import MQ from '../db/mq';

const MessageName = 'canary_use';
const EnvConfigName = 'canary_env_config';

//发送消息
export async function PushMQMessage(message: string) {
    if (!message) return;
    MQ.publish(MessageName, message);
}

export async function MQUpdateEnvConfig(message: string) {
    if (!message) return;
    MQ.publish(EnvConfigName, message);
}
