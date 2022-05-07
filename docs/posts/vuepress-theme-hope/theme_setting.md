---
icon: gears
date: 2022-05-05
category:
  - theme-hope
tag:
  - theme
---
# 主题配置

## 主题文档

[文档地址]( https://vuepress-theme-hope.github.io/v2/zh/guide/blog/home/)

## 图标信息
[图片配置地址](https://vuepress-theme-hope.github.io/v2/zh/guide/interface/icon.html)

### iconfont配置

> 同时前缀`iconPrefix`变为`iconfont icon-`

```js
// .vuepress的head中配置
[
  "link",
  {
    rel: "stylesheet",
    href: "//at.alicdn.com/t/font_2410206_mfj6e1vbwo.css",
  },
]
```

### fontawesome

> 同时前缀`iconPrefix`变为`fas fa-`

[图标地址](https://fontawesome.com/icons)

```js
// .vuepress的head中配置
[
  "script",
  {
    src: "https://kit.fontawesome.com/ca37c296c5.js",
    crossorigin: "anonymous",
  },
]
// 或者style中index.scss中配置
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/regular.min.css");
```

```puml
@startuml;
class ob
@enduml
```

