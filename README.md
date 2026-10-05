# 职场新人成长课 · 课程资料导航

一个纯静态的课程资料索引页，同时内置**性格测试与岗位匹配**：

- **分类展示 + 站内搜索 + 点击直达**资料链接
- **性格测试**（霍兰德 RIASEC，12 题）→ 测出职业兴趣类型、匹配岗位、推荐先补的课程资料

**零第三方依赖**：样式为手写的 `course-nav.css`，交互为原生 JS（无 jQuery），图标为内联 SVG，无任何字体/图片/框架文件。构建产物纯静态，可直接双击打开或部署到 GitHub Pages。

设计灵感来自 [WebStack](https://github.com/WebStackPage/WebStackPage.github.io)（MIT）。

## 功能

- **分类展示**：左侧栏列出全部分类，点击平滑滚动定位；内容区按分类分组卡片
- **站内搜索**：顶部搜索框实时过滤，匹配标题与描述，空分类自动隐藏，无结果给出提示
- **点击打开**：点击卡片在新标签页打开对应资料链接
- **性格测试**：`cn/quiz.html`，12 题 5 级量表，按最高两维给出 RIASEC 类型、匹配岗位与推荐资料分类（可跳回主页对应分类）
- **响应式**：电脑与手机浏览器均可正常浏览

## 快速开始

```bash
# 构建（数据 + 模板 → 静态页，写入 cn/）
node scripts/build.js
```

然后直接双击打开 `cn/index.html`（纯静态，无构建依赖），或部署 `cn/` 到任意静态托管 / GitHub Pages。

## 日常维护

只改两个数据文件，然后重新构建：

```bash
node scripts/build.js
```

- 资料：`data/courses.json`（分类 + 条目）
- 测试题与维度：`data/quiz.json`（题目、维度、岗位、推荐分类）

`courses.json` 结构：

```json
{
  "site": { "name": "职场新人成长课", "title": "...", "keywords": "...", "desc": "..." },
  "categories": [
    {
      "name": "简历与求职准备",
      "icon": "star",
      "color": "#185FA5",
      "items": [
        { "title": "超级简历 WonderCV", "desc": "一句话说明", "url": "https://www.wondercv.com/" }
      ]
    }
  ]
}
```

- `icon` 取自内置 SVG 图标集：`star`、`doc`、`user`、`lightbulb`、`clock`、`heart`、`tag`、`cog`、`bars`、`search`、`megaphone`（也兼容旧写法 `linecons-star`）
- `color` 是卡片左侧圆形首字母标识的底色，每个分类一个色便于区分
- `desc` 同时参与搜索匹配，建议把简称、别名写进去，命中率更高

## 目录结构

| 路径 | 作用 |
| --- | --- |
| `data/courses.json` | 资料数据源 |
| `data/quiz.json` | 性格测试题目与维度数据源 |
| `scripts/build.js` | 构建脚本：数据 + 模板 → 静态页 |
| `src/base.html` | 页面骨架模板，占位符填充 |
| `assets/css/course-nav.css` | 全部样式（自包含） |
| `assets/js/app.js` | 全部交互（原生 JS：搜索 / 平滑滚动 / 测试打分） |
| `cn/index.html` | 构建产物：资料导航页 |
| `cn/quiz.html` | 构建产物：性格测试页 |

更详细的维护说明见 [使用说明.md](./使用说明.md)。

## 相对原 WebStack 主题做了什么

- 去掉 Bootstrap / Xenon / jQuery / 图标字体 / 图片等约 2MB 第三方资源，改为手写 CSS + 原生 JS + 内联 SVG，仓库保持纯文本、可一键推送
- 抽出数据层：内容从内联 HTML 变成 `data/*.json` + 生成脚本
- 补站内搜索、性格测试与岗位匹配（霍兰德 RIASEC）
- 提亮侧边栏文字对比度

保留了对原项目 WebStack 与原作者 Viggo 的署名（页脚与本文件）。

## License

沿用原项目的 MIT 许可，见 [LICENSE](./LICENSE)。
