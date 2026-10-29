import { DEMO_FISH, advanceRound, createCast, fishVisualSignal, hookFish, type FishingRound, type RoundPhase } from './fishingEngine';
import { V3_COLLECTION_KEY, RARITY_LABELS, collectCatch, discoveredSpecies, emptyCollection, parseCollection, totalCatches, type CollectionState, type RegionId } from './collection';
import { FISHING_REGIONS, MAX_ROD_LEVEL, canUnlockRegion, fishForRegion, getRegion, rodUpgradePrice, trySelectRegion, tryUnlockRegion, tryUpgradeRod } from './progression';
import './preview.css';

const PREVIEW_REGION = '잔잔한 해변';
const FAIL_MESSAGES: Record<string, string> = {
  missed: '입질을 놓쳤어요. 다음에는 물었다는 신호에 바로 눌러 주세요.',
  snapped: '줄의 장력이 너무 높았어요. 잠시 손을 떼고 다시 감아 보세요.',
  exhausted: '물고기가 도망갔어요. 장력을 조절하며 좀 더 빠르게 감아 보세요.',
};

function requiredElement<T extends Element>(root: ParentNode, selector: string): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`AquaFantasia v3 preview: missing ${selector}`);
  return found;
}

export function bootV3Preview(): void {
  const app = document.getElementById('app');
  if (!app) throw new Error('AquaFantasia app root not found');
  document.body.classList.add('v3-preview-mode');
  app.innerHTML = `
    <main class="v3-screen" aria-label="AquaFantasia 새 낚시 엔진 미리보기">
      <header class="v3-top">
        <div class="v3-title-wrap">
          <span class="v3-eyebrow">AQUAFANTASIA · V3 LAB</span>
          <h1>환상의 바다를 낚다</h1>
          <span class="v3-region" data-v3-region>✦ ${PREVIEW_REGION} · 낚시 엔진 실험실</span>
        </div>
        <div class="v3-header-actions">
          <button class="v3-sound" type="button" data-v3-sound aria-pressed="true">효과음 켬</button>
          <button class="v3-exit" type="button" data-v3-exit aria-label="기존 게임으로 돌아가기">기존 게임 ↗</button>
        </div>
      </header>
      <section class="v3-sea" aria-label="낚시 바다">
        <div class="v3-sea-haze" aria-hidden="true"></div>
        <div class="v3-bubble v3-bubble-one" aria-hidden="true"></div>
        <div class="v3-bubble v3-bubble-two" aria-hidden="true"></div>
        <div class="v3-bubble v3-bubble-three" aria-hidden="true"></div>
        <div class="v3-float" aria-hidden="true"></div>
        <div class="v3-line" data-v3-line aria-hidden="true"></div>
        <img class="v3-fish" data-v3-fish alt="" decoding="async" />
        <span class="v3-fish-cue" data-v3-cue hidden></span>
        <div class="v3-center-status">
          <span class="v3-phase-tag" data-v3-phase-tag>준비</span>
          <h2 data-v3-message>새로운 물결을 만나러 가볼까요?</h2>
          <p data-v3-detail>낚싯줄을 던지고 물고기의 움직임을 느껴 보세요</p>
        </div>
        <div class="v3-result" data-v3-result hidden role="status" aria-live="polite">
          <span class="v3-result-kicker">오늘의 포획</span>
          <strong data-v3-result-name></strong>
          <span class="v3-result-detail" data-v3-result-detail></span>
          <span data-v3-result-reward></span>
        </div>
      </section>
      <section class="v3-console" aria-label="낚시 조작 패널">
        <div class="v3-console-top">
          <button type="button" class="v3-dex-toggle" data-v3-dex-toggle>도감 0 / 6</button>
          <button type="button" class="v3-harbor-toggle" data-v3-harbor-toggle>항구 · 강화</button>
          <span class="v3-wallet" data-v3-wallet>체험 코인 0</span>
        </div>
        <div class="v3-meter-block">
          <div class="v3-meter-label"><span>줄 장력</span><strong data-v3-tension-label>10%</strong></div>
          <div class="v3-meter v3-tension"><span data-v3-tension></span></div>
          <div class="v3-meter-label"><span>포획 진행</span><strong data-v3-progress-label>0%</strong></div>
          <div class="v3-meter v3-progress"><span data-v3-progress></span></div>
        </div>
        <div class="v3-controls">
          <button type="button" class="v3-cast" data-v3-cast>낚싯줄 던지기</button>
          <button type="button" class="v3-reel" data-v3-reel disabled>입질 기다리는 중</button>
        </div>
        <p class="v3-hint" data-v3-hint>입질이 오면 오른쪽 버튼을 누르세요 · PC에서는 스페이스바</p>
      </section>
      <dialog class="v3-dex-dialog" data-v3-dex-dialog aria-labelledby="v3-dex-title">
        <header class="v3-dex-header">
          <div>
            <span class="v3-dex-eyebrow">AQUA FIELD GUIDE</span>
            <h2 id="v3-dex-title">바다 생물 도감</h2>
          </div>
          <button type="button" class="v3-dex-close" data-v3-dex-close>닫기 ✕</button>
        </header>
        <p class="v3-dex-summary" data-v3-dex-summary></p>
        <div class="v3-dex-grid" data-v3-dex-grid></div>
        <p class="v3-dex-note">V3 전용 도감 · 기존 게임 기록과 독립적으로 보관됩니다</p>
      </dialog>
      <dialog class="v3-harbor-dialog" data-v3-harbor-dialog aria-labelledby="v3-harbor-title">
        <header class="v3-dex-header">
          <div>
            <span class="v3-dex-eyebrow">HARBOR WORKSHOP</span>
            <h2 id="v3-harbor-title">항구 · 장비와 탐험</h2>
          </div>
          <button type="button" class="v3-dex-close" data-v3-harbor-close>닫기 ✕</button>
        </header>
        <section class="v3-harbor-gear" aria-label="낚싯대 강화">
          <strong data-v3-rod-status>낚싯대 Lv.1</strong>
          <p>릴링 속도와 줄의 내구도를 높여 더 강한 물고기를 상대하세요.</p>
          <button type="button" class="v3-harbor-upgrade" data-v3-upgrade>강화하기</button>
        </section>
        <p class="v3-harbor-section-title">탐험할 바다 선택</p>
        <div class="v3-harbor-regions" data-v3-region-list></div>
        <p class="v3-dex-note">V3 전용 코인으로만 진행 · 기존 게임 세이브에는 영향이 없습니다</p>
      </dialog>
    </main>
  `;

  const castButton = requiredElement<HTMLButtonElement>(app, '[data-v3-cast]');
  const reelButton = requiredElement<HTMLButtonElement>(app, '[data-v3-reel]');
  const fishImage = requiredElement<HTMLImageElement>(app, '[data-v3-fish]');
  const fishingLine = requiredElement<HTMLElement>(app, '[data-v3-line]');
  const fishCue = requiredElement<HTMLElement>(app, '[data-v3-cue]');
  const sea = requiredElement<HTMLElement>(app, '.v3-sea');
  sea.style.setProperty('--v3-water-image', `url("${new URL('./assets/v101/water/water_clear_calm.webp', window.location.href).href}")`);
  const phaseTag = requiredElement<HTMLElement>(app, '[data-v3-phase-tag]');
  const message = requiredElement<HTMLElement>(app, '[data-v3-message]');
  const detail = requiredElement<HTMLElement>(app, '[data-v3-detail]');
  const result = requiredElement<HTMLElement>(app, '[data-v3-result]');
  const resultName = requiredElement<HTMLElement>(app, '[data-v3-result-name]');
  const resultDetail = requiredElement<HTMLElement>(app, '[data-v3-result-detail]');
  const resultReward = requiredElement<HTMLElement>(app, '[data-v3-result-reward]');
  const tensionFill = requiredElement<HTMLElement>(app, '[data-v3-tension]');
  const progressFill = requiredElement<HTMLElement>(app, '[data-v3-progress]');
  const tensionLabel = requiredElement<HTMLElement>(app, '[data-v3-tension-label]');
  const progressLabel = requiredElement<HTMLElement>(app, '[data-v3-progress-label]');
  const wallet = requiredElement<HTMLElement>(app, '[data-v3-wallet]');
  const regionLabel = requiredElement<HTMLElement>(app, '[data-v3-region]');
  const dexButton = requiredElement<HTMLButtonElement>(app, '[data-v3-dex-toggle]');
  const dexDialog = requiredElement<HTMLDialogElement>(app, '[data-v3-dex-dialog]');
  const dexClose = requiredElement<HTMLButtonElement>(app, '[data-v3-dex-close]');
  const dexSummary = requiredElement<HTMLElement>(app, '[data-v3-dex-summary]');
  const dexGrid = requiredElement<HTMLElement>(app, '[data-v3-dex-grid]');
  const harborButton = requiredElement<HTMLButtonElement>(app, '[data-v3-harbor-toggle]');
  const harborDialog = requiredElement<HTMLDialogElement>(app, '[data-v3-harbor-dialog]');
  const harborClose = requiredElement<HTMLButtonElement>(app, '[data-v3-harbor-close]');
  const rodStatus = requiredElement<HTMLElement>(app, '[data-v3-rod-status]');
  const upgradeButton = requiredElement<HTMLButtonElement>(app, '[data-v3-upgrade]');
  const regionList = requiredElement<HTMLElement>(app, '[data-v3-region-list]');
  const hint = requiredElement<HTMLElement>(app, '[data-v3-hint]');
  const backButton = requiredElement<HTMLButtonElement>(app, '[data-v3-exit]');
  const soundButton = requiredElement<HTMLButtonElement>(app, '[data-v3-sound]');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const soundFiles = {
    cast: './assets/audio/cast.wav',
    bite: './assets/audio/bite.wav',
    success: './assets/audio/success.wav',
    fail: './assets/audio/fail.wav',
  } as const;
  type SoundKind = keyof typeof soundFiles;
  const sounds = Object.fromEntries(Object.entries(soundFiles).map(([key, src]) => {
    const clip = new Audio(new URL(src, window.location.href).href);
    clip.preload = 'none';
    clip.volume = 0.22;
    return [key, clip];
  })) as Record<SoundKind, HTMLAudioElement>;

  let round: FishingRound | null = null;
  let held = false;
  let soundEnabled = true;
  let collection: CollectionState = readCollection();
  let canSaveCollection = true;
  let castCount = 0;
  let lastPhase: RoundPhase | 'ready' = 'ready';
  let previousTime = performance.now();
  let lastPaint = 0;

  function readCollection(): CollectionState {
    try { return parseCollection(window.localStorage.getItem(V3_COLLECTION_KEY)); }
    catch { return emptyCollection(); }
  }

  function saveCollection(): boolean {
    try {
      window.localStorage.setItem(V3_COLLECTION_KEY, JSON.stringify(collection));
      return true;
    } catch { return false; }
  }

  function updateCollectionBadge(): void {
    wallet.textContent = `체험 코인 ${collection.coins.toLocaleString('ko-KR')}`;
    dexButton.textContent = `도감 ${discoveredSpecies(collection)} / ${DEMO_FISH.length}`;
    regionLabel.textContent = `✦ ${getRegion(collection.selectedRegion).name} · 낚싯대 Lv.${collection.rodLevel}`;
  }

  function renderHarbor(): void {
    const price = rodUpgradePrice(collection.rodLevel);
    rodStatus.textContent = `낚싯대 Lv.${collection.rodLevel} / ${MAX_ROD_LEVEL}`;
    upgradeButton.disabled = price === null || collection.coins < price;
    upgradeButton.textContent = price === null ? '최고 단계 달성!' : `낚싯대 강화 · ${price} 코인`;
    const discoveryCount = discoveredSpecies(collection);
    regionList.innerHTML = FISHING_REGIONS.map((region) => {
      const unlocked = collection.unlockedRegions.includes(region.id);
      const selected = collection.selectedRegion === region.id;
      const ready = canUnlockRegion(collection, region.id);
      const label = selected ? '현재 낚시터' : unlocked ? '여기서 낚시하기'
        : ready ? `해금 · ${region.unlockPrice} 코인` : '조건 미달';
      const button = selected ? '' : `<button type="button" data-v3-region-action="${unlocked ? 'select' : 'unlock'}" data-v3-region-id="${region.id}" ${!unlocked && !ready ? 'disabled' : ''}>${label}</button>`;
      return `<article class="v3-harbor-region ${selected ? 'is-active' : ''}">
        <strong>${region.name}</strong>
        <span>${region.description}</span>
        <small>필요 도감 ${region.requiredDiscoveries}종 · 낚싯대 Lv.${region.requiredRodLevel} · 비용 ${region.unlockPrice}코인</small>
        <span class="v3-harbor-region-state">${selected ? '이곳에서 낚시 중' : unlocked ? '탐험 가능' : discoveryCount >= region.requiredDiscoveries ? '장비·코인을 확인하세요' : `도감 ${region.requiredDiscoveries - discoveryCount}종 더 발견 필요`}</span>
        ${button}
      </article>`;
    }).join('');
  }

  function showHarbor(): void {
    stopReeling();
    renderHarbor();
    harborDialog.showModal();
    harborClose.focus();
  }

  function showDex(): void {
    stopReeling();
    const discovered = discoveredSpecies(collection);
    dexSummary.textContent = `${discovered}/${DEMO_FISH.length}종 발견 · 총 ${totalCatches(collection)}회 포획`;
    dexGrid.innerHTML = DEMO_FISH.map((fish) => {
      const entry = collection.records[fish.id];
      return `<article class="v3-dex-card ${entry ? 'is-discovered' : 'is-unknown'}">
        <img src="${fish.image}" alt="" loading="lazy" decoding="async" />
        <div class="v3-dex-info">
          <strong>${entry ? fish.name : '미발견 물고기'}</strong>
          <span>${entry ? `최대 ${entry.bestLengthCm.toFixed(1)}cm · ${RARITY_LABELS[entry.rarest]}` : '물음표 속 새로운 만남'}</span>
          <small>${entry ? `포획 ${entry.count}회` : '아직 발견하지 못했어요'}</small>
        </div>
      </article>`;
    }).join('');
    dexDialog.showModal();
    dexClose.focus();
  }

  function playFeedback(kind: SoundKind): void {
    if (!soundEnabled) return;
    const clip = sounds[kind];
    try {
      clip.pause();
      clip.currentTime = 0;
      void clip.play().catch(() => undefined);
    } catch { /* Sound is optional; never block fishing. */ }
  }

  function haptic(pattern: number | number[]): void {
    if (reducedMotion || document.hidden) return;
    try { navigator.vibrate?.(pattern); } catch { /* Optional device feedback. */ }
  }

  function stopReeling(): void {
    held = false;
    reelButton.classList.remove('is-pressed');
  }

  function phaseChanged(phase: RoundPhase): void {
    if (!round || phase === lastPhase) return;
    lastPhase = phase;
    if (phase === 'waiting') playFeedback('cast');
    if (phase === 'bite') {
      playFeedback('bite');
      haptic([60, 40, 60]);
    }
    if (phase === 'landed') {
      stopReeling();
      playFeedback('success');
      haptic([80, 40, 110]);
      const catchOutcome = collectCatch(collection, round);
      collection = catchOutcome.state;
      canSaveCollection = saveCollection();
      const caught = catchOutcome.result;
      result.hidden = false;
      result.dataset.rarity = caught.rarity;
      resultName.textContent = `${round.fish.name} · ${RARITY_LABELS[caught.rarity]}`;
      resultDetail.textContent = `${caught.lengthCm.toFixed(1)}cm · ${caught.firstDiscovery ? '첫 발견 ✦' : caught.newSizeRecord ? '개인 최고 기록 ↑' : '도감 수집 완료'}`;
      resultReward.textContent = `+${caught.earnedCoins} 코인 · 장력 최고 ${Math.round(round.peakTension * 100)}%`;
      updateCollectionBadge();
    } else if (phase === 'escaped') {
      stopReeling();
      playFeedback('fail');
      result.hidden = true;
    }
  }

  function render(): void {
    if (!round) return;
    phaseChanged(round.phase);
    const phase = round.phase;
    sea.dataset.phase = phase;
    phaseTag.textContent = ({
      waiting: '입질 기다리는 중', bite: '물었다!', fighting: '릴링 중',
      landed: '포획 성공!', escaped: '다음에는 꼭!',
    } satisfies Record<RoundPhase, string>)[phase];
    const messages: Record<RoundPhase, string> = {
      waiting: '물결이 움직이고 있어요',
      bite: '지금! 낚싯대를 잡아 주세요',
      fighting: round.tension >= 0.8 ? '위험! 잠깐 손을 떼세요!' : '줄의 장력을 느껴 보세요',
      landed: '멋진 물고기를 낚았어요!',
      escaped: '아쉽지만 다음 기회가 있어요',
    };
    message.textContent = messages[phase];
    detail.textContent = phase === 'waiting'
      ? `입질 예상까지 약 ${Math.max(0, round.biteIn).toFixed(1)}초`
      : phase === 'bite' ? `입질 남은 시간 ${Math.max(0, round.biteWindow).toFixed(1)}초`
        : phase === 'fighting' ? (held ? '감는 중 · 장력이 높으면 손을 떼세요' : '손을 떼어 장력을 낮추는 중')
          : phase === 'landed' ? '한 번 더 던지거나 다른 물고기를 만나 보세요'
            : FAIL_MESSAGES[round.reason] ?? '다시 도전해 보세요';
    const tension = Math.round(round.tension * 100);
    const progress = Math.round(round.progress * 100);
    tensionFill.style.width = `${Math.min(100, tension)}%`;
    tensionFill.classList.toggle('is-danger', tension >= 80);
    reelButton.classList.toggle('is-warning', phase === 'fighting' && tension >= 80);
    sea.dataset.danger = phase === 'fighting' && tension >= 80 ? 'true' : 'false';
    progressFill.style.width = `${progress}%`;
    tensionLabel.textContent = `${tension}%`;
    progressLabel.textContent = `${progress}%`;
    const visual = fishVisualSignal(round);
    fishCue.hidden = phase !== 'fighting';
    fishCue.textContent = visual.cue;
    sea.dataset.surge = phase === 'fighting' && visual.intensity > 0.65 ? 'true' : 'false';
    if (phase === 'fighting' && !reducedMotion) {
      fishImage.style.transform = `translate(calc(-50% + ${Math.round(visual.x * 45)}px), ${Math.round(visual.y * 24)}px) rotate(${visual.rotation.toFixed(1)}deg)`;
      fishingLine.style.transform = `translateX(-50%) rotate(${(visual.x * 11).toFixed(1)}deg)`;
    } else {
      fishImage.style.transform = '';
      fishingLine.style.transform = '';
    }
    reelButton.disabled = !['bite', 'fighting'].includes(phase);
    reelButton.textContent = phase === 'bite' ? '지금 눌러 챔질!' : phase === 'fighting' ? '누르고 릴 감기' : '입질 기다리는 중';
    castButton.disabled = !['landed', 'escaped'].includes(phase);
    castButton.textContent = '다시 던지기';
    updateCollectionBadge();
    hint.textContent = !canSaveCollection
      ? '브라우저 저장이 제한돼 이번 V3 기록은 새로고침 후 사라질 수 있어요'
      : phase === 'fighting'
      ? '누르면 감고, 손을 떼면 즉시 멈춥니다 · 장력 100%면 줄이 끊어져요'
      : 'PC 스페이스바 / 모바일 큰 버튼 · 이 미리보기는 기존 저장에 영향을 주지 않습니다';
  }

  function cast(): void {
    stopReeling();
    const fish = fishForRegion(collection, castCount);
    fishImage.src = fish.image;
    const seed = Math.floor(Math.random() * 0xffffffff);
    castCount += 1;
    round = createCast(fish, seed, collection.rodLevel);
    lastPhase = 'ready';
    result.hidden = true;
    render();
  }

  function startReeling(): void {
    if (!round) return;
    if (round.phase === 'bite') round = hookFish(round);
    if (round.phase !== 'fighting') return;
    held = true;
    reelButton.classList.add('is-pressed');
    render();
  }

  castButton.addEventListener('click', cast);
  dexButton.addEventListener('click', showDex);
  harborButton.addEventListener('click', showHarbor);
  harborClose.addEventListener('click', () => harborDialog.close());
  harborDialog.addEventListener('close', () => harborButton.focus());
  harborDialog.addEventListener('click', (event) => {
    if (event.target === harborDialog) harborDialog.close();
  });
  upgradeButton.addEventListener('click', () => {
    const updated = tryUpgradeRod(collection);
    if (updated === collection) return;
    collection = updated;
    canSaveCollection = saveCollection();
    updateCollectionBadge();
    renderHarbor();
  });
  regionList.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button[data-v3-region-action]') : null;
    if (!button || button.disabled) return;
    const id = button.dataset.v3RegionId;
    const region = FISHING_REGIONS.find((candidate) => candidate.id === id);
    if (!region) return;
    const next = button.dataset.v3RegionAction === 'unlock'
      ? tryUnlockRegion(collection, region.id as RegionId)
      : trySelectRegion(collection, region.id as RegionId);
    if (next === collection) return;
    collection = next;
    canSaveCollection = saveCollection();
    updateCollectionBadge();
    renderHarbor();
  });
  dexClose.addEventListener('click', () => dexDialog.close());
  dexDialog.addEventListener('close', () => dexButton.focus());
  dexDialog.addEventListener('click', (event) => {
    if (event.target === dexDialog) dexDialog.close();
  });
  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (!soundEnabled) Object.values(sounds).forEach((clip) => clip.pause());
    soundButton.textContent = soundEnabled ? '효과음 켬' : '효과음 끔';
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
  });
  reelButton.addEventListener('pointerdown', (event) => {
    if (reelButton.disabled) return;
    event.preventDefault();
    try { reelButton.setPointerCapture(event.pointerId); } catch { /* optional capture */ }
    startReeling();
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    reelButton.addEventListener(name, stopReeling);
  }
  window.addEventListener('pointerup', stopReeling);
  window.addEventListener('pointercancel', stopReeling);
  window.addEventListener('touchcancel', stopReeling);
  window.addEventListener('blur', stopReeling);
  window.addEventListener('pagehide', stopReeling);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopReeling();
    previousTime = performance.now();
  });
  window.addEventListener('keydown', (event) => {
    if (dexDialog.open || harborDialog.open) return;
    if (event.code !== 'Space' || event.repeat) return;
    if (event.target instanceof HTMLButtonElement && event.target !== reelButton) return;
    event.preventDefault();
    startReeling();
  });
  window.addEventListener('keyup', (event) => {
    if (event.code === 'Space') stopReeling();
  });
  backButton.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('preview');
    window.location.assign(url.href);
  });

  function frame(now: number): void {
    const elapsed = Math.min(0.1, Math.max(0, (now - previousTime) / 1000));
    previousTime = now;
    if (round && !document.hidden && !dexDialog.open && !harborDialog.open) {
      // Bounded fixed steps keep slow frames from changing the underlying physics.
      let remaining = elapsed;
      while (remaining > 0) {
        const step = Math.min(0.05, remaining);
        round = advanceRound(round, step, held);
        remaining -= step;
      }
      if (round.phase !== 'fighting') stopReeling();
      if (now - lastPaint > 32 || round.phase !== lastPhase) {
        render();
        lastPaint = now;
      }
    }
    requestAnimationFrame(frame);
  }

  // Start with the first cast ready; no old save values are touched.
  castButton.disabled = false;
  castButton.textContent = '낚싯줄 던지기';
  reelButton.disabled = true;
  updateCollectionBadge();
  requestAnimationFrame(frame);
}
