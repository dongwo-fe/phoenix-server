# 朱雀项目服务端
![logo2](https://static.jrdaimao.com/cli_upload/b3136d3d-b3bc-4a63-827a-4fc5f6589cbf.png)

朱雀项目旨在实现前端资源的快速上线、快速回退、灰度验证的功能。

## 项目主流程

1. 前端编译服务编译完成之后，使用工具库提交到这里。***需要工具库***
2. 入口文件存储在mongodb中，其他静态资源如果有CDN，保存在CDN。没有CDN支持本地访问。***本地访问的集中办法***
3. 记录项目对应的域名、入口文件、编译时间、操作记录。
4. 生效顺序，倒叙。主动通知，分布式支持。
5. 灰度能力建设，支持根据ip设置灰度内容，ip默认支持多级ip。
6. 保存源文件，生成多种灰度文件，可以渐进发布。
7. 增加域名泛解析和主动生成域名对应的网站。

## 示例

可以查看网站示例：[demo.guofangchao.com](http://demo.guofangchao.com)

网站目前加入了测试用的页面，[phoenix.guofangchao.com](http://phoenix.guofangchao.com)