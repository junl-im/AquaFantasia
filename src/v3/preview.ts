import { DEMO_FISH, advanceRound, createCast, fishVisualSignal, hookFish, reelAdvice, type FishingRound, type RoundPhase, type ReelAdviceLevel } from './fishingEngine';
import { V3_COLLECTION_KEY, RARITY_LABELS, collectCatch, discoveredSpecies, emptyCollection, parseCollection, totalCatches, type CollectionState, type RegionId } from './collection';
import { FISHING_REGIONS, MAX_ROD_LEVEL, canUnlockRegion, fishForRegion, getRegion, nextFishingGoal, rodUpgradePrice, trySelectRegion, tryUnlockRegion, tryUpgradeRod } from './progression';
import './preview.css';

const START_REGION = '잔잔한 해변';
const FAIL_MESSAGES: Record<string, string> = {
  missed: '입질을 놓쳤어요. 다음에는 물었다는 신호에 바로 눌러 주세요.',
  snapped: '줄의 장력이 너무 높았어요. 잠시 손을 떼고 다시 감아 보세요.',
  exhausted: '물고기가 도망갔어요. 장력을 조절하며 좀 더 빠르게 감아 보세요.',
};

function requiredElement<T extends Element>(root: ParentNode, selector: string): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`AquaFantasia V3: missing ${selector}`);
  return found;
}

export function bootAquaFantasia(): void {
  const app = document.getElementById('app');
  if (!app) throw new Error('AquaFantasia app root not found');
  document.body.classList.add('v3-preview-mode');
  document.documentElement.dataset.aquaGameVersion = '3.0.0';
  app.innerHTML = `
    <main class="v3-screen" aria-label="아쿠아 판타지아 낚시게임">
      <header class="v3-top">
        <div class="v3-title-wrap">
          <span class="v3-eyebrow">AQUAFANTASIA · THE NEW SEA</span>
          <h1>환상의 바다를 낚다</h1>
          <span class="v3-region" data-v3-region>✦ ${START_REGION} · 낚시를 시작하세요</span>
        </div>
        <div class="v3-header-actions">
          <button class="v3-sound" type="button" data-v3-sound aria-pressed="true">효과음 켬</button>
        </div>
      </header>
      <section class="v3-sea" aria-label="낚시 바다">
        <div class="v3-sea-haze" aria-hidden="true"></div>
        <div class="v3-bubble v3-bubble-one" aria-hidden="true"></div>
        <div class="v3-bubble v3-bubble-two" aria-hidden="true"></div>
        <div class="v3-bubble v3-bubble-three" aria-hidden="true"></div>
        <div class="v3-float" aria-hidden="true"></div>
        <div class="v3-bite-ripples" aria-hidden="true"><span></span><span></span></div>
        <div class="v3-bite-window" data-v3-bite-window hidden aria-hidden="true"><span data-v3-bite-fill></span></div>
        <div class="v3-line" data-v3-line aria-hidden="true"></div>
        <img class="v3-fish" data-v3-fish alt="" decoding="async" />
        <div class="v3-catch-glimmer" aria-hidden="true"><span></span><span></span><span></span></div>
        <span class="v3-fish-cue" data-v3-cue hidden></span>
        <div class="v3-center-status">
          <span class="v3-phase-tag" data-v3-phase-tag>준비</span>
          <h2 data-v3-message>새로운 물결을 만나러 가볼까요?</h2>
          <p data-v3-detail>① 줄 던지기 · ② 입질에 챔질 · ③ 장력을 조절하며 릴링</p>
        </div>
        <div class="v3-result" data-v3-result hidden role="status" aria-live="polite">
          <span class="v3-result-crest" data-v3-result-crest aria-hidden="true">✦</span>
          <span class="v3-result-kicker" data-v3-result-kicker>오늘의 포획</span>
          <strong data-v3-result-name></strong>
          <span class="v3-result-detail" data-v3-result-detail></span>
          <span data-v3-result-reward></span>
        </div>
      </section>
      <section class="v3-console" aria-label="낚시 조작 패널">
        <div class="v3-console-top">
          <button type="button" class="v3-dex-toggle" data-v3-dex-toggle>도감 0 / ${DEMO_FISH.length}</button>
          <button type="button" class="v3-harbor-toggle" data-v3-harbor-toggle>항구 · 강화</button>
          <span class="v3-wallet" data-v3-wallet>보유 코인 0</span>
        </div>
        <div class="v3-meter-block">
          <div class="v3-meter-label"><span>줄 장력</span><strong data-v3-tension-label>10%</strong></div>
          <span class="v3-reel-coach" data-v3-reel-coach data-level="normal" role="status" aria-live="off">입질을 기다리는 중</span>
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
        <div class="v3-dex-filters" role="group" aria-label="도감 표시 필터">
          <button type="button" data-v3-dex-filter="all" aria-pressed="true">전체</button>
          <button type="button" data-v3-dex-filter="found" aria-pressed="false">발견</button>
          <button type="button" data-v3-dex-filter="missing" aria-pressed="false">미발견</button>
        </div>
        <div class="v3-dex-grid" data-v3-dex-grid></div>
        <p class="v3-dex-note">새로운 바다에서 수집한 물고기가 여기에 기록됩니다</p>
      </dialog>
      <dialog class="v3-harbor-dialog" data-v3-harbor-dialog aria-labelledby="v3-harbor-title">
        <header class="v3-dex-header">
          <div>
            <span class="v3-dex-eyebrow">HARBOR WORKSHOP</span>
            <h2 id="v3-harbor-title">항구 · 장비와 탐험</h2>
          </div>
          <button type="button" class="v3-dex-close" data-v3-harbor-close>닫기 ✕</button>
        </header>
        <p class="v3-harbor-objective" data-v3-harbor-objective role="status" aria-live="polite"></p>
        <section class="v3-harbor-gear" aria-label="낚싯대 강화">
          <strong data-v3-rod-status>낚싯대 Lv.1</strong>
          <p>릴링 속도와 줄의 내구도를 높여 더 강한 물고기를 상대하세요.</p>
          <button type="button" class="v3-harbor-upgrade" data-v3-upgrade>강화하기</button>
        </section>
        <section class="v3-lite-options" aria-label="화면 연출 설정">
          <span><strong>절전 연출</strong><small>저사양 기기용 · 불필요한 애니메이션 감소</small></span>
          <button type="button" data-v3-lite aria-pressed="false">절전 끔</button>
        </section>
        <p class="v3-harbor-section-title">탐험할 바다 선택</p>
        <div class="v3-harbor-regions" data-v3-region-list></div>
        <p class="v3-dex-note">낚시로 획득한 코인으로 장비를 강화하고 바다를 해금하세요</p>
      </dialog>
    </main>
  `;

  const castButton = requiredElement<HTMLButtonElement>(app, '[data-v3-cast]');
  const reelButton = requiredElement<HTMLButtonElement>(app, '[data-v3-reel]');
  const fishImage = requiredElement<HTMLImageElement>(app, '[data-v3-fish]');
  const fishingLine = requiredElement<HTMLElement>(app, '[data-v3-line]');
  const fishCue = requiredElement<HTMLElement>(app, '[data-v3-cue]');
  const biteWindow = requiredElement<HTMLElement>(app, '[data-v3-bite-window]');
  const biteFill = requiredElement<HTMLElement>(app, '[data-v3-bite-fill]');
  const sea = requiredElement<HTMLElement>(app, '.v3-sea');
  sea.style.setProperty('--v3-water-image', `url("${new URL('./assets/v101/water/water_clear_calm.webp', window.location.href).href}")`);
  const phaseTag = requiredElement<HTMLElement>(app, '[data-v3-phase-tag]');
  const message = requiredElement<HTMLElement>(app, '[data-v3-message]');
  const detail = requiredElement<HTMLElement>(app, '[data-v3-detail]');
  const result = requiredElement<HTMLElement>(app, '[data-v3-result]');
  const resultKicker = requiredElement<HTMLElement>(app, '[data-v3-result-kicker]');
  const resultCrest = requiredElement<HTMLElement>(app, '[data-v3-result-crest]');
  const resultName = requiredElement<HTMLElement>(app, '[data-v3-result-name]');
  const resultDetail = requiredElement<HTMLElement>(app, '[data-v3-result-detail]');
  const resultReward = requiredElement<HTMLElement>(app, '[data-v3-result-reward]');
  const tensionFill = requiredElement<HTMLElement>(app, '[data-v3-tension]');
  const progressFill = requiredElement<HTMLElement>(app, '[data-v3-progress]');
  const tensionLabel = requiredElement<HTMLElement>(app, '[data-v3-tension-label]');
  const progressLabel = requiredElement<HTMLElement>(app, '[data-v3-progress-label]');
  const reelCoach = requiredElement<HTMLElement>(app, '[data-v3-reel-coach]');
  const wallet = requiredElement<HTMLElement>(app, '[data-v3-wallet]');
  const regionLabel = requiredElement<HTMLElement>(app, '[data-v3-region]');
  const dexButton = requiredElement<HTMLButtonElement>(app, '[data-v3-dex-toggle]');
  const dexDialog = requiredElement<HTMLDialogElement>(app, '[data-v3-dex-dialog]');
  const dexClose = requiredElement<HTMLButtonElement>(app, '[data-v3-dex-close]');
  const dexSummary = requiredElement<HTMLElement>(app, '[data-v3-dex-summary]');
  const dexGrid = requiredElement<HTMLElement>(app, '[data-v3-dex-grid]');
  const dexFilters = requiredElement<HTMLElement>(app, '.v3-dex-filters');
  const harborButton = requiredElement<HTMLButtonElement>(app, '[data-v3-harbor-toggle]');
  const harborDialog = requiredElement<HTMLDialogElement>(app, '[data-v3-harbor-dialog]');
  const harborClose = requiredElement<HTMLButtonElement>(app, '[data-v3-harbor-close]');
  const rodStatus = requiredElement<HTMLElement>(app, '[data-v3-rod-status]');
  const upgradeButton = requiredElement<HTMLButtonElement>(app, '[data-v3-upgrade]');
  const regionList = requiredElement<HTMLElement>(app, '[data-v3-region-list]');
  const harborObjective = requiredElement<HTMLElement>(app, '[data-v3-harbor-objective]');
  const liteButton = requiredElement<HTMLButtonElement>(app, '[data-v3-lite]');
  const screen = requiredElement<HTMLElement>(app, '.v3-screen');
  const hint = requiredElement<HTMLElement>(app, '[data-v3-hint]');
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
  let pointerOwner: number | null = null;
  let keyboardOwner = false;
  const V3_LITE_KEY = 'aquafantasia:v3:lite:v1';
  let liteMode = false;
  try { liteMode = window.localStorage.getItem(V3_LITE_KEY) === '1'; }
  catch { /* Storage may be unavailable; continue with standard visuals. */ }
  let soundEnabled = true;
  let collection: CollectionState = readCollection();
  let canSaveCollection = true;
  let castCount = 0;
  let lastPhase: RoundPhase | 'ready' = 'ready';
  let previousTime = performance.now();
  let lastPaint = 0;
  let lastAdvice: ReelAdviceLevel = 'normal';
  let dexFilter: 'all' | 'found' | 'missing' = 'all';

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
    const goal = nextFishingGoal(collection);
    harborButton.dataset.goalReady = goal.action === 'harbor' ? 'true' : 'false';
    harborButton.setAttribute('aria-label', goal.action === 'harbor' ? '항구 · 다음 목표를 진행할 수 있어요' : '항구 · 강화와 수역 이동');
    if (!round || round.phase === 'landed' || round.phase === 'escaped') hint.textContent = goal.message;
    wallet.textContent = `보유 코인 ${collection.coins.toLocaleString('ko-KR')}`;
    dexButton.textContent = `도감 ${discoveredSpecies(collection)} / ${DEMO_FISH.length}`;
    regionLabel.textContent = `✦ ${getRegion(collection.selectedRegion).name} · 낚싯대 Lv.${collection.rodLevel}`;
    sea.dataset.region = collection.selectedRegion;
  }

  function applyVisualMode(): void {
    screen.classList.toggle('v3-lite-mode', liteMode || reducedMotion);
    liteButton.textContent = liteMode ? '절전 켬' : '절전 끔';
    liteButton.setAttribute('aria-pressed', String(liteMode));
  }

  function renderHarbor(): void {
    applyVisualMode();
    harborObjective.textContent = nextFishingGoal(collection).message;
    const price = rodUpgradePrice(collection.rodLevel);
    rodStatus.textContent = `낚싯대 Lv.${collection.rodLevel} / ${MAX_ROD_LEVEL}`;
    upgradeButton.disabled = price === null || collection.coins < price;
    upgradeButton.textContent = price === null ? '최고 단계 달성!' : `낚싯대 강화 · ${price} 코인`;
    const discoveryCount = discoveredSpecies(collection);
    regionList.innerHTML = FISHING_REGIONS.map((region) => {
      const unlocked = collection.unlockedRegions.includes(region.id);
      const selected = collection.selectedRegion === region.id;
      const ready = canUnlockRegion(collection, region.id);
      const label = selected ? '현재 낚시터' : unlocked ? '이곳에서 낚시'
        : ready ? `해금하고 이동 · ${region.unlockPrice}코인` : '조건 확인';
      const button = selected ? '' : `<button type="button" data-v3-region-action="${unlocked ? 'select' : 'unlock'}" data-v3-region-id="${region.id}" ${!unlocked && !ready ? 'disabled' : ''}>${label}</button>`;
      const requirements = unlocked
        ? `<span class="v3-region-opened">${selected ? '현재 탐험 중' : '탐험 가능'} · ${region.fishIds.length}종 서식</span>`
        : `<div class="v3-region-requirements" aria-label="${region.name} 해금 조건">
            <span data-met="${discoveryCount >= region.requiredDiscoveries}">도감 ${discoveryCount}/${region.requiredDiscoveries}종</span>
            <span data-met="${collection.rodLevel >= region.requiredRodLevel}">장비 Lv.${collection.rodLevel}/${region.requiredRodLevel}</span>
            <span data-met="${collection.coins >= region.unlockPrice}">코인 ${collection.coins.toLocaleString('ko-KR')}/${region.unlockPrice.toLocaleString('ko-KR')}</span>
          </div>`;
      return `<article class="v3-harbor-region ${selected ? 'is-active' : ''}" data-v3-region-ready="${ready}">
        <div class="v3-harbor-region-head"><strong>${region.name}</strong><span class="v3-region-state">${selected ? '낚시 중' : unlocked ? '열림' : ready ? '해금 가능' : '잠김'}</span></div>
        <p class="v3-harbor-region-description">${region.description}</p>
        ${requirements}
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

  function renderDex(): void {
    const discovered = discoveredSpecies(collection);
    const fishList = DEMO_FISH.filter((fish) => dexFilter === 'all'
      || (dexFilter === 'found' ? Boolean(collection.records[fish.id]) : !collection.records[fish.id]));
    dexSummary.textContent = `${discovered}/${DEMO_FISH.length}종 발견 · 총 ${totalCatches(collection)}회 포획`;
    for (const button of dexFilters.querySelectorAll<HTMLButtonElement>('[data-v3-dex-filter]')) {
      button.setAttribute('aria-pressed', String(button.dataset.v3DexFilter === dexFilter));
    }
    dexGrid.innerHTML = fishList.length ? fishList.map((fish) => {
      const entry = collection.records[fish.id];
      const habitat = FISHING_REGIONS.find((region) => region.fishIds.includes(fish.id))?.name ?? '미지의 바다';
      return `<article class="v3-dex-card ${entry ? 'is-discovered' : 'is-unknown'}" data-v3-dex-fish="${fish.id}">
        <div class="v3-dex-fish-image"><img src="${fish.image}" alt="" loading="lazy" decoding="async" /></div>
        <div class="v3-dex-info">
          <strong>${entry ? fish.name : '??? 미발견'}</strong>
          <span class="v3-dex-habitat">${habitat}</span>
          <span>${entry ? `최대 ${entry.bestLengthCm.toFixed(1)}cm · ${RARITY_LABELS[entry.rarest]}` : '아직 낚지 못한 생물'}</span>
          <small>${entry ? `포획 ${entry.count}회` : '낚시터를 탐험해 발견해 보세요'}</small>
        </div>
      </article>`;
    }).join('') : `<p class="v3-dex-empty">${dexFilter === 'found' ? '아직 발견한 물고기가 없어요. 첫 낚시를 시작하세요!' : '모든 물고기를 발견했어요!'}</p>`;
  }

  function showDex(): void {
    stopReeling();
    dexFilter = 'all';
    renderDex();
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

  function stopReeling(pointerId?: number): void {
    // A second finger lifting must not cancel the finger actually holding the reel.
    if (pointerId !== undefined && pointerOwner !== pointerId) return;
    pointerOwner = null;
    keyboardOwner = false;
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
      const catchOutcome = collectCatch(collection, round);
      collection = catchOutcome.state;
      canSaveCollection = saveCollection();
      const caught = catchOutcome.result;
      haptic(caught.rarity === 'legendary' ? [90, 45, 110, 55, 140] : [80, 40, 110]);
      result.hidden = false;
      result.dataset.rarity = caught.rarity;
      result.dataset.discovery = caught.firstDiscovery ? 'new' : caught.newSizeRecord ? 'record' : 'repeat';
      resultKicker.textContent = caught.firstDiscovery ? '새로운 생물 발견!' : caught.newSizeRecord ? '최고 기록 경신!' : '오늘의 포획';
      resultCrest.textContent = caught.rarity === 'legendary' ? '★' : caught.firstDiscovery ? '✦' : '◆';
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
    biteWindow.hidden = phase !== 'bite';
    if (phase === 'bite') biteFill.style.width = `${Math.max(0, Math.min(100, round.biteWindow / 3.8 * 100))}%`;
    phaseTag.textContent = ({
      waiting: '입질 기다리는 중', bite: '물었다!', fighting: '릴링 중',
      landed: '포획 성공!', escaped: '다음에는 꼭!',
    } satisfies Record<RoundPhase, string>)[phase];
    const advice = reelAdvice(round);
    if (phase === 'fighting') {
      reelCoach.hidden = false;
      reelCoach.dataset.level = advice.level;
      reelCoach.textContent = advice.title;
      if (advice.level === 'danger' && lastAdvice !== 'danger') haptic(35);
      lastAdvice = advice.level;
    } else {
      reelCoach.hidden = true;
      lastAdvice = 'normal';
    }
    const messages: Record<RoundPhase, string> = {
      waiting: '물결이 움직이고 있어요',
      bite: '지금! 낚싯대를 잡아 주세요',
      fighting: advice.title,
      landed: '멋진 물고기를 낚았어요!',
      escaped: '아쉽지만 다음 기회가 있어요',
    };
    message.textContent = messages[phase];
    detail.textContent = phase === 'waiting'
      ? `입질 예상까지 약 ${Math.max(0, round.biteIn).toFixed(1)}초`
      : phase === 'bite' ? `입질 남은 시간 ${Math.max(0, round.biteWindow).toFixed(1)}초`
        : phase === 'fighting' ? advice.message
          : phase === 'landed' ? '한 번 더 던지거나 다른 물고기를 만나 보세요'
            : FAIL_MESSAGES[round.reason] ?? '다시 도전해 보세요';
    const tension = Math.round(round.tension * 100);
    const progress = Math.round(round.progress * 100);
    tensionFill.style.width = `${Math.min(100, tension)}%`;
    const danger = phase === 'fighting' && advice.level === 'danger';
    tensionFill.classList.toggle('is-danger', danger);
    reelButton.classList.toggle('is-warning', danger);
    sea.dataset.danger = danger ? 'true' : 'false';
    progressFill.style.width = `${progress}%`;
    tensionLabel.textContent = `${tension}%`;
    progressLabel.textContent = `${progress}%`;
    const visual = fishVisualSignal(round);
    fishCue.hidden = phase !== 'fighting';
    fishCue.textContent = visual.cue;
    sea.dataset.surge = phase === 'fighting' && visual.intensity > 0.65 ? 'true' : 'false';
    if (phase === 'fighting' && !reducedMotion && !liteMode) {
      fishImage.style.transform = `translate(calc(-50% + ${Math.round(visual.x * 45)}px), ${Math.round(visual.y * 24)}px) rotate(${visual.rotation.toFixed(1)}deg)`;
      fishingLine.style.transform = `translateX(-50%) rotate(${(visual.x * 11).toFixed(1)}deg)`;
    } else {
      fishImage.style.transform = '';
      fishingLine.style.transform = '';
    }
    reelButton.disabled = !['bite', 'fighting'].includes(phase);
    reelButton.textContent = phase === 'bite' ? '지금 눌러 챔질!' : phase === 'fighting' ? '누르고 릴 감기' : '입질 기다리는 중';
    castButton.disabled = !['landed', 'escaped'].includes(phase);
    castButton.textContent = phase === 'landed' ? '다음 물고기 낚기'
      : phase === 'escaped' ? '다시 도전하기' : '다시 던지기';
    // Wallet/region badges are updated on saves, upgrades, unlocks and boot, not 30 times a second.
    hint.textContent = !canSaveCollection
      ? '브라우저 저장이 제한돼 이번 V3 기록은 새로고침 후 사라질 수 있어요'
      : phase === 'fighting'
      ? advice.message
      : phase === 'waiting' ? '입질이 올 때까지 기다리세요 · 물리면 버튼을 누르세요'
      : phase === 'bite' ? '지금 릴 버튼을 누르고 물고기를 잡으세요!'
      : nextFishingGoal(collection).message;
  }

  function cast(): void {
    stopReeling();
    const seed = Math.floor(Math.random() * 0xffffffff);
    const fish = fishForRegion(collection, castCount, seed);
    fishImage.src = fish.image;
    castButton.blur();
    castCount += 1;
    round = createCast(fish, seed, collection.rodLevel);
    lastPhase = 'ready';
    result.hidden = true;
    render();
  }

  function startReeling(source: number | 'keyboard'): void {
    if (!round || held) return;
    if (round.phase === 'bite') round = hookFish(round);
    if (round.phase !== 'fighting') return;
    if (source === 'keyboard') keyboardOwner = true;
    else pointerOwner = source;
    held = true;
    reelButton.classList.add('is-pressed');
    render();
  }

  castButton.addEventListener('click', cast);
  dexButton.addEventListener('click', showDex);
  dexFilters.addEventListener('click', (event) => {
    const button = event.target instanceof Element
      ? event.target.closest<HTMLButtonElement>('button[data-v3-dex-filter]') : null;
    if (!button) return;
    const next = button.dataset.v3DexFilter;
    if (next === 'all' || next === 'found' || next === 'missing') {
      dexFilter = next;
      renderDex();
    }
  });
  liteButton.addEventListener('click', () => {
    liteMode = !liteMode;
    try { window.localStorage.setItem(V3_LITE_KEY, liteMode ? '1' : '0'); }
    catch { /* Visual setting still works until page refresh. */ }
    applyVisualMode();
  });
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
      ? trySelectRegion(tryUnlockRegion(collection, region.id as RegionId), region.id as RegionId)
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
    if (reelButton.disabled || held) return;
    event.preventDefault();
    startReeling(event.pointerId);
    if (pointerOwner === event.pointerId) {
      try { reelButton.setPointerCapture(event.pointerId); } catch { /* Optional capture. */ }
    }
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    reelButton.addEventListener(name, (event) => stopReeling(event.pointerId));
  }
  window.addEventListener('pointerup', (event) => stopReeling(event.pointerId));
  window.addEventListener('pointercancel', (event) => stopReeling(event.pointerId));
  window.addEventListener('touchcancel', () => stopReeling());
  window.addEventListener('blur', () => stopReeling());
  window.addEventListener('pagehide', () => stopReeling());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopReeling();
    previousTime = performance.now();
  });
  window.addEventListener('keydown', (event) => {
    if (dexDialog.open || harborDialog.open) return;
    if (event.code !== 'Space' || event.repeat) return;
    if (event.target instanceof HTMLButtonElement && event.target !== castButton && event.target !== reelButton) return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    event.preventDefault();
    startReeling('keyboard');
  });
  window.addEventListener('keyup', (event) => {
    if (event.code === 'Space' && keyboardOwner) stopReeling();
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
      if (now - lastPaint > (liteMode || reducedMotion ? 100 : 32) || round.phase !== lastPhase) {
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
  applyVisualMode();
  updateCollectionBadge();
  requestAnimationFrame(frame);
}
