/**
 * 网络响应工具类
 */
//===========

/**
 * 响应成功
 * @param data 返回结果
 */
export function BeSuccess(data?: any) {
    return {
        code: 1,
        data: data === undefined ? 'ok' : data,
    };
}
/**
 * 响应错误
 * @param msg 错误消息
 * @param code 错误代码
 */
export function BeError(message: string, code = 0) {
    return {
        code,
        message,
    };
}
