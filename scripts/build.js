/**
 * 课程资料导航页构建脚本（自包含版，无第三方依赖）
 * 用法：node scripts/build.js
 *
 * 生成两个页面：
 *   cn/index.html  资料导航页（分类展示 + 站内搜索）
 *   cn/quiz.html   性格测试与岗位匹配（霍兰德 RIASEC）
 *
 * 日常维护只改 data/courses.json 与 data/quiz.json，然后重跑本脚本。
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const base = fs.readFileSync(path.join(root, 'src', 'base.html'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'courses.json'), 'utf8'));
const quiz = JSON.parse(fs.readFileSync(path.join(root, 'data', 'quiz.json'), 'utf8'));

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/* 主题只带这套内联 SVG 图标，写错名字会回退到 tag 图标 */
const ICONS = {
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  lightbulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8a6 6 0 0 0-12 0c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  tag: '<path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3H4a1 1 0 0 0-1 1v5.59A2 2 0 0 0 3.83 11l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  bars: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  megaphone: '<path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
};
const iconSvg = (v) => {
  // 兼容旧数据里的 "linecons-*" 写法，归一化成 ICONS 的键
  const key = String(v || '').replace(/^linecons-/, '');
  const body = ICONS[key] || ICONS.tag;
  return `<svg class="cn-ico cn-ico-${esc(key)}" viewBox="0 0 24 24">${body}</svg>`;
};

/* 注入页面的数据先转义，避免内容里的引号破坏 JS 字符串 */
const safeDims = quiz.dimensions.map((d) => ({
  key: esc(d.key),
  name: esc(d.name),
  alias: esc(d.alias),
  color: esc(d.color),
  desc: esc(d.desc),
  jobs: (d.jobs || []).map(esc),
  recommend: (d.recommend || []).map(esc),
}));

const render = (o) =>
  base
    .replace('{{SITE_TITLE}}', esc(o.title))
    .replace('{{SITE_KEYWORDS}}', esc(o.keywords || ''))
    .replace('{{SITE_DESC}}', esc(o.desc || ''))
    .replace(/\{\{SITE_NAME\}\}/g, esc(data.site.name))
    .replace('<!--MENU-->', o.menu)
    .replace('<!--SEARCH-->', o.search || '')
    .replace('<!--CONTENT-->', o.content);

/* ============================ 侧边栏菜单 ============================ */

const menuItem = (href, cls, ic, label) => `                    <li>
                        <a href="${href}"${cls ? ` class="${cls}"` : ''}>
                            ${iconSvg(ic)}<span class="title">${esc(label)}</span>
                        </a>
                    </li>`;

const categoryMenu = (prefix) =>
  data.categories.map((c) => menuItem(`${prefix}#${esc(c.name)}`, prefix ? '' : 'smooth', c.icon, c.name)).join('\n');

// 主页：测试入口在最前，其后是各资料分类（同页锚点）
const indexMenu = [menuItem('quiz.html', '', 'star', '性格测试'), categoryMenu('')].join('\n');
// 测试页：返回首页，其后是各资料分类（跨页跳转，不带 smooth）
const quizMenu = [menuItem('index.html', '', 'doc', '返回资料导航'), categoryMenu('index.html')].join('\n');

/* ============================ 主页 ============================ */

const totalItems = data.categories.reduce((n, c) => n + (c.items ? c.items.length : 0), 0);

const searchBox = `
            <div class="cn-search-wrap">
                <div class="cn-search">
                    ${iconSvg('search')}
                    <input id="cn-search-input" type="text" autocomplete="off" placeholder="搜索资料标题或关键词，例如：简历、番茄钟">
                    <span id="cn-search-count" class="cn-count"></span>
                </div>
            </div>`;

const content = data.categories
  .map((c) => {
    const cards = (c.items || [])
      .map((it) => {
        const rawTitle = String(it.title || '?').trim();
        const initial = esc(rawTitle.replace(/^[《（(【“‘'"]/, '').charAt(0) || rawTitle.charAt(0));
        return `                <div class="col-sm-3 cn-item" data-title="${esc(it.title)}" data-desc="${esc(it.desc)}">
                    <div class="xe-widget xe-conversations box2" onclick="window.open('${esc(it.url)}', '_blank')">
                        <span class="cn-avatar" style="background:${esc(c.color || '#185FA5')}">${initial}</span>
                        <div class="xe-comment">
                            <strong>${esc(it.title)}</strong>
                            <p>${esc(it.desc)}</p>
                        </div>
                    </div>
                </div>`;
      })
      .join('\n');

    return `
            <!-- ${c.name} -->
            <div class="cn-section">
                <h4>${iconSvg(c.icon)}<span id="${esc(c.name)}">${esc(c.name)}</span></h4>
                <div class="row">
${cards}
                </div>
            </div>
            <br />`;
  })
  .join('\n');

const emptyTip = `
            <div id="cn-empty" class="cn-empty" style="display:none">没有匹配的资料，换个关键词试试</div>`;

const indexHtml = render({
  title: data.site.title,
  keywords: data.site.keywords,
  desc: data.site.desc,
  menu: indexMenu,
  search: searchBox,
  content: emptyTip + '\n' + content,
});

fs.writeFileSync(path.join(root, 'cn', 'index.html'), indexHtml, 'utf8');

/* ============================ 测试页 ============================ */

const quizContent = `
            <div class="cn-quiz">
                <div class="cn-quiz-intro">
                    <h4>${esc(quiz.title)}</h4>
                    <p>${esc(quiz.intro)}</p>
                </div>
                <div id="cn-questions">
${quiz.questions
  .map(
    (q, i) => `                    <div class="cn-q" data-id="${q.id}" data-dim="${esc(q.dim)}">
                        <div class="cn-q-text"><span class="cn-q-no">${i + 1}</span>${esc(q.text)}</div>
                        <div class="cn-q-scale">
${quiz.scale
  .map(
    (s) =>
      `                            <label><input type="radio" name="q${q.id}" value="${s.value}"><span>${esc(s.label)}</span></label>`
  )
  .join('\n')}
                        </div>
                    </div>`
  )
  .join('\n')}
                </div>
                <div class="cn-quiz-actions">
                    <button id="cn-submit" disabled>查看结果</button>
                    <span id="cn-progress">已答 0 / ${quiz.questions.length}</span>
                </div>
                <div id="cn-result"></div>
            </div>
            <script>
            window.QUIZ = ${JSON.stringify({ questions: quiz.questions.map((q) => ({ id: q.id, dim: esc(q.dim) })), dimensions: safeDims, note: esc(quiz.note) })};
            </script>`;

const quizHtml = render({
  title: `${data.site.name} · ${quiz.title}`,
  keywords: '性格测试,职业兴趣,霍兰德,RIASEC,岗位匹配',
  desc: quiz.intro,
  menu: quizMenu,
  search: '',
  content: quizContent,
});

fs.writeFileSync(path.join(root, 'cn', 'quiz.html'), quizHtml, 'utf8');

console.log(
  `已生成 cn/index.html（${data.categories.length} 分类 / ${totalItems} 条资料）与 cn/quiz.html（${quiz.questions.length} 题 / ${quiz.dimensions.length} 个维度）`
);
