import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar";
import sidebar from "./sidebar";

export default hopeTheme({
  hostname: "http://bon.sikixt.xyz",

  author: {
    name: "Albert",
    url: "http://bon.sikixt.xyz",
  },

  iconPrefix: "iconfont icon-",

  logo: "/logo.svg",

  // 是否编辑,仓库链接
  editLink: true, //是否展示编辑此页链接
  repo: "AlbertBon/bon-blog",
  docsBranch: "master",
  docsDir: "/docs",

  // navbar
  navbar: navbar,

  // sidebar
  sidebar: [],

  footer: "默认页脚",

  displayFooter: true,

  pageInfo: ["Author", "Original", "Date", "Category", "Tag", "ReadingTime"],

  blog: {
    description: "我的博客",
    intro: "/intro.html",
    medias: {
      Baidu: "https://baidu.com",
      Gitee: "https://gitee.com",
      GitHub: "https://github.com",
    },
  },

  encrypt: {
    config: {
      "/hucai_work/03_month.html": ["hykj"],
      "/hucai_work/04_month.html": ["hykj"],
      "/hucai_work/05_month.html": ["hykj"],
      "/hucai_work/devlop_log.html": ["hykj"],
      "/hucai_work/tenant_develop_extend.html": ["hykj"],
      "/hucai_work/work_info.html": ["hykj"],
    },
  },

  plugins: {
    blog: {
      autoExcerpt: true,
    },

    // 如果你不需要评论，可以直接删除 comment 配置，
    // 以下配置仅供体验，如果你需要评论，请自行配置并使用自己的环境，详见文档。
    // 为了避免打扰主题开发者以及消耗他的资源，请不要在你的正式环境中直接使用下列配置!!!!!
    comment: {
      /**
       * Using giscus
       */
      type: "giscus",
      repo: "AlbertBon/bon-blog-discussions",
      repoId: "R_kgDOHSPKiQ",
      category: "Announcements",
      categoryId: "DIC_kwDOHSPKic4CO8Zw",
      mapping: "title", // 页面 与 discussion 映射关系
      inputPosition: "top", // 输入框的位置
      reactionsEnabled: true,//是否启用主帖子上的反应

      /**
       * Using twikoo
       */
      // type: "twikoo",
      // envId: "https://twikoo.ccknbc.vercel.app",

      /**
       * Using Waline
       */
      // type: "waline",
      // serverURL: "https://vuepress-theme-hope-comment.vercel.app",
    },

    mdEnhance: {
      enableAll: true,
      presentation: {
        plugins: ["highlight", "math", "search", "notes", "zoom"],
      },
    },
  },
});
