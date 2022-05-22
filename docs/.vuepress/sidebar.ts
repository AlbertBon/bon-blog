import {sidebar} from "vuepress-theme-hope";

export default sidebar([
    "/",
    {
        text: "博文",
        icon: "blog",
        prefix: "/posts/",
        children: [
            {
                text: "theme-hope",
                prefix: "vuepress-theme-hope/",
                children: "structure",
                collapsable: true
            }, {
                text: "git",
                prefix: "git/",
                children: "structure",
                collapsable: true
            }, {
                text: "k8s",
                prefix: "k8s/",
                children: "structure",
                collapsable: true
            }, {
                text: "idea",
                prefix: "idea/",
                children: "structure",
                collapsable: true
            }, {
                text: "java",
                prefix: "java/",
                children: "structure",
                collapsable: true
            }, {
                text: "docker",
                prefix: "docker/",
                children: "structure",
                collapsable: true
            }, {
                text: "python",
                prefix: "python/",
                children: "structure",
                collapsable: true
            }, {
                text: "study-project",
                prefix: "study-project/",
                children: "structure",
                collapsable: true
            }, {
                text: "linux",
                prefix: "linux/",
                children: "structure",
                collapsable: true
            }
        ],
    }, {
        text: "工作",
        icon: "briefcase",
        prefix: "/hucai_work/",
        children: "structure",
        collapsable: true
    }, {
        text: "生活",
        icon: "briefcase",
        prefix: "/life/",
        children: [
            {
                text: "music",
                prefix: "music/",
                children: "structure",
                collapsable: true
            }
        ]
    }
]);
