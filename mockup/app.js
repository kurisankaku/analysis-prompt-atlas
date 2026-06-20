// モック用の最小インタラクション
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-menu]');
  if (t) {
    document.querySelector('.nav')?.classList.toggle('open');
  }
  const tab = e.target.closest('.tabs button');
  if (tab) {
    tab.parentElement.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
    tab.classList.add('on');
  }
  const pill = e.target.closest('.pill');
  if (pill && pill.dataset.toggle !== undefined) {
    pill.classList.toggle('on');
  }
});

// 領域インデックスの簡易フィルタ（検索デモ）
const finder = document.querySelector('[data-find]');
if (finder) {
  finder.addEventListener('input', () => {
    const q = finder.value.trim();
    document.querySelectorAll('.region').forEach((el) => {
      const hit = !q || el.textContent.includes(q);
      el.style.display = hit ? '' : 'none';
    });
  });
}
