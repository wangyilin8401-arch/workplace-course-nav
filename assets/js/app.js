/* 课程资料导航页 · 原生 JS（无 jQuery）
   负责：锚点平滑滚动、搜索过滤、性格测试打分与结果渲染 */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    /* ---- 锚点平滑滚动 + active 高亮（同页） ---- */
    document.querySelectorAll('a.smooth').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var id = this.getAttribute('href').replace(/^#/, '');
        var el = document.getElementById(id);
        if (el) {
          var top = el.getBoundingClientRect().top + window.pageYOffset - 30;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
        document.querySelectorAll('#main-menu li').forEach(function (li) { li.classList.remove('active'); });
        if (this.parentElement) this.parentElement.classList.add('active');
      });
    });

    /* ---- 回到顶部 ---- */
    var backTop = document.querySelector('.back-top');
    if (backTop) {
      backTop.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ---- 搜索过滤（标题 + 描述） ---- */
    var input = document.getElementById('cn-search-input');
    if (input) {
      var count = document.getElementById('cn-search-count');
      var empty = document.getElementById('cn-empty');
      input.addEventListener('input', function () {
        var q = this.value.trim().toLowerCase();
        var total = 0;
        document.querySelectorAll('.cn-section').forEach(function (sec) {
          var shown = 0;
          sec.querySelectorAll('.cn-item').forEach(function (it) {
            var t = (it.getAttribute('data-title') || '').toLowerCase();
            var d = (it.getAttribute('data-desc') || '').toLowerCase();
            var ok = q === '' || t.indexOf(q) > -1 || d.indexOf(q) > -1;
            it.style.display = ok ? '' : 'none';
            if (ok) shown++;
          });
          sec.style.display = shown > 0 ? '' : 'none';
          total += shown;
        });
        if (count) count.textContent = q === '' ? '' : '命中 ' + total + ' 条';
        if (empty) empty.style.display = (q !== '' && total === 0) ? 'block' : 'none';
      });
    }

    /* ---- 性格测试 ---- */
    var questions = document.querySelectorAll('.cn-q');
    if (questions.length && window.QUIZ) {
      var submit = document.getElementById('cn-submit');
      var progress = document.getElementById('cn-progress');
      var result = document.getElementById('cn-result');
      var Q = window.QUIZ.questions;
      var D = window.QUIZ.dimensions;
      var NOTE = window.QUIZ.note;
      var TOTAL = Q.length;

      function answers() {
        var o = {};
        Q.forEach(function (q) {
          var el = document.querySelector('input[name="q' + q.id + '"]:checked');
          o[q.id] = el ? parseInt(el.value, 10) : 0;
        });
        return o;
      }
      function scores() {
        var s = {}, a = answers();
        D.forEach(function (d) { s[d.key] = 0; });
        Q.forEach(function (q) { s[q.dim] += (a[q.id] || 0); });
        return s;
      }
      function maxScore() {
        var m = {};
        D.forEach(function (d) { m[d.key] = 0; });
        Q.forEach(function (q) { m[q.dim] += 5; });
        return m;
      }
      function refresh() {
        var a = answers(), n = 0, k;
        for (k in a) if (a[k] > 0) n++;
        progress.textContent = '已答 ' + n + ' / ' + TOTAL;
        submit.disabled = n < TOTAL;
      }

      document.querySelectorAll('.cn-q-scale input').forEach(function (el) {
        el.addEventListener('change', function () {
          var scale = el.closest('.cn-q-scale');
          scale.querySelectorAll('label').forEach(function (l) { l.classList.remove('checked'); });
          if (el.closest('label')) el.closest('label').classList.add('checked');
          refresh();
        });
      });

      submit.addEventListener('click', function () {
        var s = scores(), mx = maxScore();
        var arr = D.map(function (d) { return { d: d, v: s[d.key], max: mx[d.key] }; })
          .sort(function (a, b) { return b.v - a.v; });
        var top = arr.slice(0, 2);

        var bars = arr.map(function (x) {
          var pct = x.max ? Math.round(x.v / x.max * 100) : 0;
          return '<div class="cn-bar-row"><span class="cn-bar-name">' + x.d.name + ' ' + x.d.key + '</span>' +
            '<span class="cn-bar-track"><i style="width:' + pct + '%;background:' + x.d.color + '"></i></span>' +
            '<span class="cn-bar-val">' + x.v + '</span></div>';
        }).join('');

        var recs = [];
        top.forEach(function (x) {
          x.d.recommend.forEach(function (n) { if (recs.indexOf(n) < 0) recs.push(n); });
        });
        var jobs = top.map(function (x) {
          return x.d.jobs.map(function (j) { return '<span class="cn-job">' + j + '</span>'; }).join('');
        }).join('');
        var recLinks = recs.map(function (n) { return '<a href="index.html#' + n + '">' + n + '</a>'; }).join('');

        var code = top.map(function (x) { return x.d.key; }).join('');
        var names = top.map(function (x) { return x.d.name + '（' + x.d.alias + '）'; }).join(' + ');
        var descs = top.map(function (x) {
          return '<p class="cn-type-desc"><strong>' + x.d.name + ' ' + x.d.key + '</strong>' + x.d.desc + '</p>';
        }).join('');

        result.innerHTML =
          '<div class="cn-result-card">' +
          '<div class="cn-type-code">' + code + ' 型</div>' +
          '<div class="cn-type-names">' + names + '</div>' +
          descs +
          '<div class="cn-sub-title">匹配岗位</div><div class="cn-jobs">' + jobs + '</div>' +
          '<div class="cn-sub-title">建议先补这些资料</div><div class="cn-rec-links">' + recLinks + '</div>' +
          '<div class="cn-sub-title">六维得分</div>' + bars +
          '<p class="cn-note">' + NOTE + '</p>' +
          '<div class="cn-again"><a href="javascript:location.reload()">重新测一次</a></div>' +
          '</div>';

        var top2 = result.getBoundingClientRect().top + window.pageYOffset - 30;
        window.scrollTo({ top: top2, behavior: 'smooth' });
      });

      refresh();
    }
  });
})();
