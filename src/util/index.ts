import crypto from 'crypto';

export function getMd5(str: string) {
    const md5 = crypto.createHash('md5');
    md5.update(str);
    return md5.digest('hex');
}
