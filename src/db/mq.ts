import SMQ from 'amqplib';
import config from 'config';

const MQConfig: any = config.get('mq');
let MQ: null | SMQ.Channel = null;
const cache_list = new Map();

SMQ.connect({
    hostname: MQConfig.hostname,
    username: MQConfig.username,
    password: MQConfig.password,
    vhost: MQConfig.vhost,
})
    .then((con) => {
        return con.createChannel();
    })
    .then((ch) => {
        MQ = ch;
        cache_list.forEach((v, k) => bindAction(k, v));
        console.log('MQ连接成功！');
    })
    .catch((err) => console.log('MQ连接失败', err));

//绑定监听函数
async function bindAction(name, fn) {
    if (!MQ) return;
    try {
        await MQ.assertExchange(name, 'fanout', { durable: false });
        const qok = await MQ.assertQueue('', { exclusive: true });
        await MQ.bindQueue(qok.queue, name, '');
        MQ.consume(qok.queue, function (msg) {
            if (!msg || !MQ) return;
            fn(msg.content.toString());
            MQ.ack(msg);
        });
    } catch (error) {
        console.log(error);
    }
}

export default {
    async publish(name, data) {
        if (!MQ) throw new Error('服务还未初始化完成');
        try {
            await MQ.assertExchange(name, 'fanout', { durable: false });
            await MQ.publish(name, '', Buffer.from(data));
        } catch (error) {
            console.log(error);
        }
    },
    async onMessage(name, fn) {
        if (!MQ) {
            cache_list.set(name, fn);
        } else {
            bindAction(name, fn);
        }
    },
};
