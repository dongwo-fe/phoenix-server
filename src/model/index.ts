import { getMD5 } from '../service/user';
import GitHouseModel from './git_house';
import logs from './logs';
import user from './user';
import website from './website';

GitHouseModel.sync();
logs.sync();
user.sync().then(() => {
    user.insert({ username: 'admin', password: getMD5('admin'), nickname: '管理员', uidentity: 'admin', status: 1 });
});
website.sync();
