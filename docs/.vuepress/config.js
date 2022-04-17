

module.exports = {
    title: 'Hello VuePress',
    description: 'Just playing around',
    head: [
        ['hucai', {rel: 'icon', href: '../logo.png'}]
    ],
    markdown: {
        lineNumbers: true
    },
    theme: '@vuepress/blog',
    themeConfig: {
        directories: [
            {
                id: 'post',
                dirname: '_posts',
                path: '/',
                pagination: {
                    perPagePosts: 2,
                },
            },
        ],
        frontmatters: [
            {
                id: "tag",
                keys: ['tag', 'tags'],
                path: '/tag/',
                layout: 'Tag',
                frontmatter: { title: 'Tag' },
                itemlayout: 'Tag',
                pagination: {
                    perPagePosts: 3
                }
            },
        ],
        comment: {
            platform: 'gitee',
            baseUrl:'https://gitee.com',
            // 你想使用的服务
            service: 'vssue',
            // 存储 issue 和评论的库的所有者名称。
            owner: 'bon149',
            // 用于存储 issue 和评论的存储库的名称。
            repo: 'vssue',
            // 从 OAuth2 规范中引入的 clientId 和 clientSecret。
            clientId: '1160a35304c4536bad362c0001d8e02fb243e5fa3f5326021b6e7fa446022b10',
            clientSecret: '6c9a504fbacd7dcc65f57de7470e6c0e9b823c2fe67d2cebdae4fbff90424098',
        },
    }


}
