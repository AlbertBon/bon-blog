// .vuepress/config.js
const { config } = require("vuepress-theme-hope");

module.exports = config({
  title: "Albert Blog",
  description: "每天进步一点点",

  dest: "./dist",

  plugins: {
    "@mr-hope/comment": {
      type: "vssue",
      // 设置 `platform` 而不是 `api`
      platform: "gitee",

      // 其他的 Vssue 配置
      owner: 'bon149',
      // 用于存储 issue 和评论的存储库的名称。
      repo: 'bon-blog',
      // 从 OAuth2 规范中引入的 clientId 和 clientSecret。
      clientId: '1160a35304c4536bad362c0001d8e02fb243e5fa3f5326021b6e7fa446022b10',
      clientSecret: '6c9a504fbacd7dcc65f57de7470e6c0e9b823c2fe67d2cebdae4fbff90424098',

    },
  },

  locales: {
    "/": {
      lang: "zh-CN",
    },
    "/en/": {
      title: "Albert Blog",
      description: "To be better",
    },
  },

  themeConfig: {
    logo: "/logo.svg",
    hostname: "https://vuepress-theme-hope-demo.mrhope.site",

    author: "Mr.Hope",
    repo: "https://github.com/vuepress-theme-hope/vuepress-theme-hope",

    nav: [
      { text: "博客主页", link: "/", icon: "home" },
      { text: "项目主页", link: "/home/", icon: "home" },
      {
        text: "如何使用",
        icon: "creative",
        link: "/guide/",
      },
      {
        text: "主题文档",
        icon: "note",
        link: "https://vuepress-theme-hope.github.io/v1/zh/",
      },
    ],

    sidebar: {
      "/": [
        "",
        "home",
        "slides",
        "layout",
        {
          title: "如何使用",
          icon: "creative",
          prefix: "guide/",
          children: ["", "page", "markdown", "disable", "encrypt"],
        },
      ],
    },



    locales: {
      "/en/": {
        nav: [
          { text: "Blog Home", link: "/en/", icon: "home" },
          { text: "Project Home", link: "/en/home/", icon: "home" },
          {
            text: "Guide",
            icon: "creative",
            link: "/en/guide/",
          },
          {
            text: "Docs",
            link: "https://vuepress-theme-hope.github.io/v1/",
            icon: "note",
          },
        ],

        sidebar: {
          "/en/": [
            "",
            "home",
            "slides",
            "layout",
            {
              title: "Guide",
              icon: "creative",
              prefix: "guide/",
              children: ["", "page", "markdown", "disable", "encrypt"],
            },
          ],
        },
      },
    },

    blog: {
      intro: "/intro/",
      sidebarDisplay: "mobile",
      links: {
        Zhihu: "https://zhihu.com",
        Baidu: "https://baidu.com",
        Github: "https://github.com",
      },
    },

    footer: {
      display: true,
      content: "默认页脚",
    },

    comment: {
      type: "waline",
      serverURL: "https://vuepress-theme-hope-comment.vercel.app",
    },

    copyright: {
      status: "global",
    },

    cleanUrl: false,

    git: {
      timezone: "Asia/Shanghai",
    },

    mdEnhance: {
      enableAll: true,
      presentation: {
        plugins: [
          "highlight",
          "math",
          "search",
          "notes",
          "zoom",
          "anything",
          "audio",
          "chalkboard",
        ],
      },
    },

    pwa: {
      favicon: "/favicon.ico",
      cachePic: true,
      apple: {
        icon: "/assets/icon/apple-icon-152.png",
        statusBarColor: "black",
      },
      msTile: {
        image: "/assets/icon/ms-icon-144.png",
        color: "#ffffff",
      },
      manifest: {
        icons: [
          {
            src: "/assets/icon/chrome-mask-512.png",
            sizes: "512x512",
            purpose: "maskable",
            type: "image/png",
          },
          {
            src: "/assets/icon/chrome-mask-192.png",
            sizes: "192x192",
            purpose: "maskable",
            type: "image/png",
          },
          {
            src: "/assets/icon/chrome-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/assets/icon/chrome-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
        shortcuts: [
          {
            name: "Guide",
            short_name: "Guide",
            url: "/guide/",
            icons: [
              {
                src: "/assets/icon/guide-maskable.png",
                sizes: "192x192",
                purpose: "maskable",
                type: "image/png",
              },
              {
                src: "/assets/icon/guide-monochrome.png",
                sizes: "192x192",
                purpose: "monochrome",
                type: "image/png",
              },
            ],
          },
        ],
      },
    },
  },
});
