/* 스크롤 연혁, 모바일 메뉴, 우림 가이드 탭과 부드러운 등장 효과를 구현합니다. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 메인 히어로: 제목을 순서대로 드러내고, 스크롤에 맞춰 차밭을 천천히 확대·이동합니다.
  const hero = document.querySelector('.hero');
  const heroImage = document.querySelector('.hero-image');
  const heroCopy = document.querySelector('.hero-copy');
  if (hero) {
    window.requestAnimationFrame(() => hero.classList.add('is-ready'));
  }
  let heroFrameQueued = false;
  const updateHeroMotion = () => {
    heroFrameQueued = false;
    if (!hero || !heroImage || reduceMotion) return;
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height * 0.78)));
    heroImage.style.setProperty('--hero-scale', (1.08 - progress * 0.055).toFixed(3));
    heroImage.style.setProperty('--hero-y', `${Math.round(progress * 66)}px`);
    if (heroCopy) {
      heroCopy.style.setProperty('--hero-copy-opacity', (1 - progress * 1.25).toFixed(3));
      heroCopy.style.setProperty('--hero-copy-y', `${Math.round(progress * -26)}px`);
    }
  };
  const requestHeroUpdate = () => {
    if (heroFrameQueued) return;
    heroFrameQueued = true;
    window.requestAnimationFrame(updateHeroMotion);
  };
  window.addEventListener('scroll', requestHeroUpdate, { passive: true });
  window.addEventListener('resize', requestHeroUpdate);
  updateHeroMotion();

  // 모바일 내비게이션: 버튼 상태, 바깥 메뉴 선택, ESC 키를 처리합니다.
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const setMenu = (open) => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });

  // 스크롤 연혁: 섹션의 스크롤 진행률로 공식 주요 연혁 5개 장면을 선택합니다.
  const milestones = [
    { year: '1979', title: '제주에 차의 씨앗을 심다', description: '제주 돌송이차밭 부지 개간이 시작되었습니다.' },
    { year: '1980', title: '제주 차의 첫 여정을 열다', description: '설록차 브랜드와 첫 녹차 제품이 출시되었습니다.' },
    { year: '1984', title: '차밭의 풍경을 넓히다', description: '서광 차밭이 조성되었습니다.' },
    { year: '2001', title: '차의 문화를 나누다', description: '제주 오설록 티뮤지엄이 문을 열었습니다.' },
    { year: '오늘', title: '제주의 시간을 한 잔에 담다', description: '제주숲홍차와 함께 오늘의 쉼표를 만나보세요.' }
  ];
  const history = document.querySelector('.history-section');
  const stageContent = document.querySelector('.history-content');
  const yearNode = document.querySelector('[data-history-year]');
  const titleNode = document.querySelector('[data-history-title]');
  const descriptionNode = document.querySelector('[data-history-description]');
  const indexNode = document.querySelector('[data-history-index]');
  const progressNode = document.querySelector('[data-history-progress]');
  const historyImages = [...document.querySelectorAll('.history-image')];
  let activeMilestone = -1;
  let scrollQueued = false;
  const updateHistory = () => {
    scrollQueued = false;
    if (!history) return;
    const rect = history.getBoundingClientRect();
    const range = Math.max(1, history.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / range));
    const index = Math.min(milestones.length - 1, Math.floor(progress * milestones.length));
    if (index === activeMilestone) return;
    activeMilestone = index;
    const item = milestones[index];
    if (reduceMotion) {
      yearNode.textContent = item.year;
      titleNode.textContent = item.title;
      descriptionNode.textContent = item.description;
    } else {
      stageContent.classList.add('is-changing');
      window.setTimeout(() => {
        yearNode.textContent = item.year;
        titleNode.textContent = item.title;
        descriptionNode.textContent = item.description;
        stageContent.classList.remove('is-changing');
      }, 180);
    }
    indexNode.textContent = String(index + 1).padStart(2, '0');
    progressNode.style.width = `${((index + 1) / milestones.length) * 100}%`;
    historyImages.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === index));
  };
  const requestHistoryUpdate = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(updateHistory);
  };
  window.addEventListener('scroll', requestHistoryUpdate, { passive: true });
  window.addEventListener('resize', requestHistoryUpdate);
  updateHistory();

  // 우림 가이드: 탭 전환에 맞춰 티백·잎차 영상을 바꾸고 재생 장면 자막을 맞춥니다.
  const brewTabs = [...document.querySelectorAll('.brew-tab')];
  const brewPanels = [...document.querySelectorAll('[data-brew-panel]')];
  const brewVideo = document.querySelector('#brew-video');
  const brewVideoSource = brewVideo?.querySelector('source');
  const brewPlayToggle = document.querySelector('#brew-play-toggle');
  const brewStepCaption = document.querySelector('#brew-step-caption');
  const brewStepCount = document.querySelector('#brew-step-count');
  const brewStepItems = [...document.querySelectorAll('[data-brew-step]')];
  const brewSequences = {
    teabag: {
      src: 'assets/videos/brew-teabag.mp4',
      poster: 'assets/images/brew-frames/teabag-01.jpg',
      captions: ['티백을 준비하고', '90°C 물을 천천히 붓고', '2분간 향을 우려낸 뒤', '따뜻한 잔에 따라요'],
      steps: ['티백 놓기', '뜨거운 물 붓기', '2분 우리기', '잔에 따르기'],
    },
    leaf: {
      src: 'assets/videos/brew-leaf.mp4',
      poster: 'assets/images/brew-frames/leaf-01.jpg',
      captions: ['잎차를 한 스푼 담고', '인퓨저에 찻잎을 넣고', '90°C 물에 2분 우린 뒤', '맑은 홍차를 따라요'],
      steps: ['잎차 계량하기', '인퓨저에 담기', '2분 우리기', '잔에 따르기'],
    },
  };
  let activeBrewSequence = 'teabag';
  let brewWasPlaying = !reduceMotion;

  const updateBrewVideoStep = () => {
    if (!brewVideo || !brewSequences[activeBrewSequence]) return;
    const sequence = brewSequences[activeBrewSequence];
    const duration = Number.isFinite(brewVideo.duration) && brewVideo.duration > 0 ? brewVideo.duration : 11.2;
    const step = Math.min(3, Math.floor((brewVideo.currentTime / duration) * 4));
    if (brewStepCaption) brewStepCaption.textContent = sequence.captions[step];
    if (brewStepCount) brewStepCount.textContent = `0${step + 1} / 04`;
    brewStepItems.forEach((item, index) => {
      item.classList.toggle('is-active', index === step);
      item.classList.toggle('is-complete', index < step);
      const title = item.querySelector('[data-step-title]');
      if (title) title.textContent = sequence.steps[index];
    });
  };

  const activateBrewTab = (tab) => {
    const selected = tab.dataset.brew;
    activeBrewSequence = selected;
    brewTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    brewPanels.forEach((panel) => {
      const active = panel.dataset.brewPanel === selected;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    const sequence = brewSequences[selected];
    if (brewVideo && brewVideoSource && sequence && brewVideoSource.getAttribute('src') !== sequence.src) {
      brewWasPlaying = !brewVideo.paused;
      brewVideo.pause();
      brewVideoSource.setAttribute('src', sequence.src);
      brewVideo.setAttribute('poster', sequence.poster);
      brewVideo.load();
      updateBrewVideoStep();
      if (brewWasPlaying && !reduceMotion) brewVideo.play().catch(() => {});
    }
  };
  brewTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateBrewTab(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % brewTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + brewTabs.length) % brewTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = brewTabs.length - 1;
      brewTabs[next].focus();
      activateBrewTab(brewTabs[next]);
    });
  });
  if (brewVideo) {
    brewVideo.addEventListener('timeupdate', updateBrewVideoStep);
    brewVideo.addEventListener('loadedmetadata', updateBrewVideoStep);
    brewVideo.addEventListener('play', () => {
      if (brewPlayToggle) {
        brewPlayToggle.textContent = 'Ⅱ';
        brewPlayToggle.setAttribute('aria-label', '영상 일시정지');
        brewPlayToggle.setAttribute('aria-pressed', 'false');
      }
    });
    brewVideo.addEventListener('pause', () => {
      if (brewPlayToggle) {
        brewPlayToggle.textContent = '▶';
        brewPlayToggle.setAttribute('aria-label', '영상 재생');
        brewPlayToggle.setAttribute('aria-pressed', 'true');
      }
    });
    if (brewPlayToggle) {
      brewPlayToggle.addEventListener('click', () => {
        if (brewVideo.paused) brewVideo.play().catch(() => {});
        else brewVideo.pause();
      });
    }
    if (!reduceMotion) brewVideo.play().catch(() => {});
    updateBrewVideoStep();
  }

  // 콘텐츠가 화면에 들어올 때 부드럽게 나타납니다. 모션 최소화 설정에서는 바로 표시합니다.
  const revealItems = [...document.querySelectorAll('.reveal')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }
})();
