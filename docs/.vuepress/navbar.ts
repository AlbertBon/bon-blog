import {navbar} from "vuepress-theme-hope";

export default navbar([
    "/",
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
                text: "git 文章",
                prefix: "git/",
                children: [
                    "git_base",
                ]
            }
        ],
    }, {
        text: "工作",
        prefix: "/hucai_work/",
        children: [
            "03_month",
            "04_month",
            "05_month",
            "work_info",
            "devlop_log",
            "tenant_develop_extend",
        ]
    }
]);
