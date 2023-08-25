import Redis from "ioredis";
import config from "config";

const CONF: string = config.get("redis");

const cluster = new Redis(CONF, {
    reconnectOnError: function (err: any) {
        console.log("redis连接失败", err);
        return false;
    },
});
console.log("连接redis");

export default cluster;
