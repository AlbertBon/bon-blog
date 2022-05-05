---
icon: edit
date: 2022-05-05
category:
  - theme-hope
tag:
  - tech
---

# theme-hope主题初始化

## 全局安装vuepress
```shell script
yarn add -D vuepress
```

## npm和yarn配置
> 当项目路径和yarn或者npm的运行目录不在同一个盘当中时,需要配置为同一目录;
> yarn和npm配置之后也可以将全局安装的包放到其他盘,减少c盘的压力
```shell script
// npm 
npm config set prefix "D:\Program Files\nodejs\npm_bin"
npm config set cache "D:\Program Files\nodejs\npm_cache"

// yarn
yarn config set prefix "D:\Program Files\nodejs\yarn_bin"
yarn config set global-folder "D:\Program Files\nodejs\yarn_global"
yarn config set cache-folder "D:\Program Files\nodejs\yarn_cache"
```

## 使用npm创建
> dir是文档名,自定义一个文档名,主题v2版本只支持npm安装
```shell script
npm init vuepress-theme-hope@next [dir]
```



