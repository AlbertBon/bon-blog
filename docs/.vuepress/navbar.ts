import {navbar} from "vuepress-theme-hope";

export default navbar([
    "/",
    "/home",
    {text: "使用指南", icon: "creative", link: "/guide/"},
    {
        text: "博文",
        icon: "edit",
        prefix: "/posts/",
        children: [
            {
                text: "theme-hope 文章",
                icon: "linter",
                prefix: "vuepress-theme-hope/",
                children: [
                    "init_project",
                    "install_giscus"
                ],
            }, {
                text: "虎彩工作日志",
                prefix: "hucai_work/",
                children: [
                    "03_month",
                    "04_month",
                    "05_month",
                    "work_info",
                    "devlop_log",
                    "tenant_develop_extend",
                ]
            }, {
                text: "git 文章",
                prefix: "git/",
                children: [
                    "git_base",
                ]
            }
        ],
    },
    {
        text: "主题文档",
        icon: "note",
        link: "https://vuepress-theme-hope.github.io/v2/zh/",
    },
]);
