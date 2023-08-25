import axios from 'axios';
import UserModel from '../model/user';
import { LoginUserForDD } from './user';
import config from 'config';

interface IDDConfig {
    clientId: string;
    clientSecret: string;
}
const DingDingConfig = config.get<IDDConfig>('dingding');
interface IDDUserToken {
    expireIn: number;
    accessToken: string;
    refreshToken: string;
}

interface IDDUser {
    nick: string;
    unionId: string;
    avatarUrl: string;
    openId: string;
    mobile: string;
    stateCode: string;
}

function getDDConfig(code: string) {
    return {
        clientId: DingDingConfig.clientId,
        clientSecret: DingDingConfig.clientSecret,
        code,
        refreshToken: '',
        grantType: 'authorization_code',
    };
}

/**
 * 钉钉登录
 * @param code code
 */
export async function LoginDD(code: string) {
    //1.用code获取token
    //2.用token获取用户信息(token在权限变更之后不会更新)
    //3.获取用户信息之后去数据库检查，不存在就存储
    //4.返回token
    const tokenres = await axios.post<IDDUserToken>('https://api.dingtalk.com/v1.0/oauth2/userAccessToken', getDDConfig(code));
    if (!tokenres.data.accessToken) throw new Error('钉钉登录失败');
    const user_res = await axios.get<IDDUser>('https://api.dingtalk.com/v1.0/contact/users/me', { headers: { 'x-acs-dingtalk-access-token': tokenres.data.accessToken } });
    if (!user_res.data.unionId) throw new Error('钉钉登录失败');
    const userData = await UserModel.findTell(user_res.data.mobile);

    let uuid = '';
    // 用户不存在就用手机号注册一个用户
    if (!userData) {
        const data = await UserModel.insert({
            username: user_res.data.mobile,
            password: 'ddU1Nsc8BNFftb92F5x2fSXoDuI=', //getMD5("123456")
            nickname: user_res.data.nick,
            tell: user_res.data.mobile,
            ddunionId: user_res.data.unionId,
            ddopenId: user_res.data.openId,
            avatar: user_res.data.avatarUrl,
            status: 1,
            o_username: 'system',
            o_nickname: '钉钉登录',
        });
        uuid = data.uuid;
    } else {
        uuid = userData.uuid;
        await UserModel.update(
            {
                nickname: user_res.data.nick,
                tell: user_res.data.mobile,
                ddunionId: user_res.data.unionId,
                ddopenId: user_res.data.openId,
                avatar: user_res.data.avatarUrl,
            },
            userData.uuid
        );
    }

    return LoginUserForDD(uuid);
}
