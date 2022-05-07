import { defineUserConfig } from "vuepress";
import theme from "./theme";

export default defineUserConfig({
  lang: "zh-CN",
  title: "Albert 博客",
  description: "私人博客,记录工作信息及技术记录",

  base: "/",

  head: [
    [
      "script",
      {
        src: "https://kit.fontawesome.com/ca37c296c5.js",
        crossorigin: "anonymous",
      },
    ]
  ],

  theme,
});
