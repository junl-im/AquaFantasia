
// ==================== v2.0 ACTIONS RANK VISUAL MAX PATCH / Firebase Ready ====================
let gameState = {
    gold: 1240, level: 12, exp: 870, expToNext: 1000,
    inventory: [], discovered: new Set(),
    currentRegion: null, isFishing: false,
    reelProgress: 0, tension: 0, currentFish: null, pendingFish: null,
    nickname: "여우", gender: "male", userId: null,
    catchHistory: [], bestCatch: null, totalCaught: 0, totalGoldEarned: 0,
    todayBest: 0, leaderboard: [],
    achievements: {},
    ownedRods: ['starter_rod'],
    rodEnhance: { starter_rod: 0 },
    baitInventory: { basic_bait: 999999 },
    equipment: { rod: 'starter_rod', bait: 'basic_bait' },
    economy: { upgradeSpent: 0, enhancementAttempts: 0, enhancementSuccess: 0, lastUpgradeAt: '' },
    daily: { dateKey: '', checkedIn: false, streak: 0, lastCheckIn: '', claimedQuests: {}, stats: { casts: 0, caught: 0, rareCaught: 0, goldEarned: 0 } },
    season: { claimed: {} },
    bossStats: { encounters: 0, defeated: 0, escaped: 0, bestValue: 0 },
    bossLeaderboard: [],
    seasonRank: { seasonKey: '', bestScore: 0, submittedAt: '' },
    bossWindowActive: false,
    bossSurgeTick: 0
};

let isFirebaseConnected = false;
let audioContext;
let firebaseListenerStarted = false;
let leaderboardUnsubscribe = null;
let bossLeaderboardUnsubscribe = null;
let cloudSaveTimer = null;
let fishingTimers = [];
let graphicsMode = localStorage.getItem('aqua_graphics_mode') || ((navigator.deviceMemory && navigator.deviceMemory <= 3) ? 'low' : 'high');
let reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const APP_VERSION = '2.0.0';
let deferredInstallPrompt = null;
let pwaReady = false;
let lastPerfScore = null;

// ==================== Fish Data Patch v1.3 ====================
const RARITY_CONFIG = {
    1: { name: '일반', emoji: '⚪', color: '#d1d5db', weight: 72 },
    2: { name: '고급', emoji: '🟢', color: '#34d399', weight: 45 },
    3: { name: '희귀', emoji: '🔵', color: '#38bdf8', weight: 22 },
    4: { name: '영웅', emoji: '🟣', color: '#c084fc', weight: 9 },
    5: { name: '전설', emoji: '🟠', color: '#f59e0b', weight: 3 },
    6: { name: '신화', emoji: '🔴', color: '#fb7185', weight: 1 }
};

const REGION_META = {
    '호수': { emoji: '🏞️', desc: '초보자에게 좋은 잔잔한 물가', minRarity: 1, maxRarity: 4, biteMin: 1500, biteMax: 2600 },
    '강': { emoji: '🏞', desc: '민물 대어와 빠른 물살', minRarity: 1, maxRarity: 4, biteMin: 1600, biteMax: 2800 },
    '항구': { emoji: '⚓', desc: '바다와 도시가 만나는 어장', minRarity: 2, maxRarity: 5, biteMin: 1800, biteMax: 3100 },
    '심해': { emoji: '🌊', desc: '희귀 어종이 숨어 있는 깊은 바다', minRarity: 3, maxRarity: 5, biteMin: 2100, biteMax: 3400 },
    '용궁': { emoji: '🐉', desc: '전설 어종과 용의 기운', minRarity: 4, maxRarity: 6, biteMin: 2300, biteMax: 3700 },
    '차원의 바다': { emoji: '🌀', desc: '신화 등급을 노리는 최종 어장', minRarity: 5, maxRarity: 6, biteMin: 2500, biteMax: 4200 }
};

// ==================== Equipment Patch v1.5 ====================
const RODS = [
    { id:'starter_rod', name:'기본 낚싯대', emoji:'🎣', tier:'BASIC', cost:0, powerBonus:0, tensionControl:0, tensionRelief:0, rarityBoost:0, valueBonus:0, expBonus:0, desc:'처음부터 지급되는 안정적인 낚싯대입니다.' },
    { id:'carbon_rod', name:'카본 낚싯대', emoji:'🪶', tier:'RARE', cost:2500, powerBonus:.10, tensionControl:.05, tensionRelief:1.5, rarityBoost:.035, valueBonus:.04, expBonus:.02, desc:'가볍고 탄성이 좋아 릴 감기와 입질이 부드러워집니다.' },
    { id:'crystal_rod', name:'수정 낚싯대', emoji:'💎', tier:'EPIC', cost:8500, powerBonus:.22, tensionControl:.10, tensionRelief:3.2, rarityBoost:.075, valueBonus:.09, expBonus:.05, desc:'수정 진동으로 희귀한 기운을 더 잘 감지합니다.' },
    { id:'dragon_rod', name:'용린 낚싯대', emoji:'🐉', tier:'MYTHIC', cost:24000, powerBonus:.38, tensionControl:.16, tensionRelief:5.4, rarityBoost:.13, valueBonus:.16, expBonus:.10, desc:'용의 비늘로 만든 최상급 장비. 신화 어종 도전에 유리합니다.' }
];

const BAITS = [
    { id:'basic_bait', name:'기본 미끼', emoji:'🪱', tier:'FREE', cost:0, pack:0, biteSpeed:.00, rarityBoost:0, valueBonus:0, expBonus:0, desc:'무제한으로 제공되는 기본 미끼입니다.' },
    { id:'glow_bait', name:'반짝 미끼', emoji:'✨', tier:'PLUS', cost:420, pack:5, biteSpeed:.08, rarityBoost:.025, valueBonus:.03, expBonus:.02, desc:'입질 대기 시간을 줄이고 고급 어종 확률을 살짝 올립니다.' },
    { id:'pearl_bait', name:'진주 미끼', emoji:'🦪', tier:'PREMIUM', cost:1450, pack:5, biteSpeed:.13, rarityBoost:.055, valueBonus:.07, expBonus:.04, desc:'희귀 이상 어종을 노릴 때 좋은 균형형 미끼입니다.' },
    { id:'dragon_bait', name:'용궁 미끼', emoji:'🔥', tier:'RAID', cost:4200, pack:3, biteSpeed:.18, rarityBoost:.095, valueBonus:.12, expBonus:.08, desc:'전설과 신화 등급을 노리는 고위험 고보상 미끼입니다.' }
];

// ==================== Forge Patch v1.8 ====================
const ENHANCE_MAX_LEVEL = 10;
const ENHANCE_SOFT_PITY = 3;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value || 0)));
}

function getRodEnhanceLevel(id = gameState.equipment?.rod) {
    return clamp(gameState.rodEnhance?.[id] || 0, 0, ENHANCE_MAX_LEVEL);
}

function getRodBaseEnhanceCost(rod) {
    const base = Number(rod.cost || 0);
    return Math.max(520, Math.floor(base * 0.18));
}

function getEnhanceCost(id = gameState.equipment?.rod) {
    const rod = getRod(id);
    const level = getRodEnhanceLevel(id);
    if (level >= ENHANCE_MAX_LEVEL) return 0;
    return Math.floor((getRodBaseEnhanceCost(rod) + 280) * Math.pow(level + 1, 1.42) + level * 165);
}

function getEnhanceSuccessRate(id = gameState.equipment?.rod) {
    const level = getRodEnhanceLevel(id);
    const pity = clamp(gameState.economy?.enhancePity || 0, 0, ENHANCE_SOFT_PITY);
    return clamp(.92 - level * .052 + pity * .045, .42, .96);
}

function getEquipmentScore() {
    const rod = getRod();
    const bait = getBait();
    const level = getRodEnhanceLevel(rod.id);
    const rodIndex = Math.max(1, RODS.findIndex((r) => r.id === rod.id) + 1);
    const baitIndex = Math.max(1, BAITS.findIndex((b) => b.id === bait.id) + 1);
    return Math.floor(rodIndex * 420 + baitIndex * 130 + level * 165 + Number(gameState.level || 1) * 18);
}

function getEconomyHealthRatio() {
    const earned = Math.max(1, Number(gameState.totalGoldEarned || 0));
    const spent = Math.max(0, Number(gameState.economy?.upgradeSpent || 0));
    return clamp((spent / Math.max(earned, 2000)) * 100, 0, 100);
}

function scheduleAquaTask(fn, priority = 'background') {
    if (window.scheduler?.postTask) return window.scheduler.postTask(fn, { priority }).catch(() => setTimeout(fn, 0));
    if ('requestIdleCallback' in window && priority !== 'user-blocking') return requestIdleCallback(fn, { timeout: 900 });
    return setTimeout(fn, 0);
}


// ==================== Actions/PWA/Performance Patch v2.0 ====================
function getKstDateObject(date = new Date()) {
    return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
}

function getSeasonKey(date = new Date()) {
    const kst = getKstDateObject(date);
    const first = new Date(kst.getFullYear(), 0, 1);
    const dayOffset = Math.floor((kst - first) / 86400000);
    const week = Math.floor((dayOffset + first.getDay()) / 7) + 1;
    return `${kst.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getSeasonScore() {
    const goldScore = Math.max(Number(gameState.todayBest || 0), Number(gameState.gold || 0));
    const bossScore = Number(gameState.bossStats?.bestValue || 0) * 1.65 + Number(gameState.bossStats?.defeated || 0) * 1800;
    const growthScore = Number(gameState.level || 1) * 120 + getEquipmentScore() * .9 + getDiscoveredSpeciesCount() * 85;
    return Math.floor(goldScore + bossScore + growthScore);
}

function getRankTier(score = getSeasonScore()) {
    if (score >= 120000) return { name:'AQUA MASTER', emoji:'🌌', color:'text-fuchsia-200' };
    if (score >= 72000) return { name:'MYTHIC ANGLER', emoji:'🐉', color:'text-rose-200' };
    if (score >= 38000) return { name:'BOSS HUNTER', emoji:'👑', color:'text-amber-200' };
    if (score >= 16000) return { name:'DEEP VOYAGER', emoji:'🌊', color:'text-sky-200' };
    return { name:'RISING FISHER', emoji:'🎣', color:'text-emerald-200' };
}

function getLocalLeaderboardFallback() {
    return [
        { name:'차원항해자', score: 86200, level: 36 },
        { name:'심연의왕', score: 55800, level: 29 },
        { name:'청룡조련사', score: 39400, level: 24 },
        { name: gameState.nickname, score: getSeasonScore(), level: Number(gameState.level || 1) }
    ];
}

function getBossLeaderboardFallback() {
    return [
        { name:'레비아탄헌터', bossDefeated: 7, bossBestValue: 18800, level: 41 },
        { name:'청룡왕격파자', bossDefeated: 5, bossBestValue: 15200, level: 32 },
        { name: gameState.nickname, bossDefeated: Number(gameState.bossStats?.defeated || 0), bossBestValue: Number(gameState.bossStats?.bestValue || 0), level: Number(gameState.level || 1) }
    ];
}

function updatePWAStatus() {
    const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone;
    const pwa = document.getElementById('pwa-status-text');
    const network = document.getElementById('network-status-text');
    const dot = document.getElementById('network-dot');
    const sw = document.getElementById('sw-status-text');
    const actions = document.getElementById('actions-runtime-status');
    if (pwa) pwa.textContent = standalone ? '설치 앱 모드' : '브라우저 모드';
    if (network) network.lastElementChild.textContent = navigator.onLine ? '온라인' : '오프라인';
    if (dot) dot.classList.toggle('offline', !navigator.onLine);
    if (sw) sw.textContent = pwaReady ? '오프라인 준비 완료' : '오프라인 준비 중';
    if (actions) actions.textContent = 'GitHub Desktop Push 시 Actions 자동 검사/배포';
}

function setInstallButtonsVisible(visible) {
    ['install-app-btn','install-app-btn-login','install-app-btn-card'].forEach((id) => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.toggle('hidden', !visible);
    });
}

async function initPWA() {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        setInstallButtonsVisible(true);
    });
    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        setInstallButtonsVisible(false);
        showToast('Aqua Fantasia 설치 완료!', '📲', 3200);
        updatePWAStatus();
    });
    window.addEventListener('online', updatePWAStatus);
    window.addEventListener('offline', updatePWAStatus);
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('./sw.js');
            pwaReady = Boolean(reg.active || reg.waiting || reg.installing);
            navigator.serviceWorker.addEventListener('controllerchange', () => { pwaReady = true; updatePWAStatus(); });
        } catch (error) {
            console.warn('Service worker registration failed:', error.message);
            pwaReady = false;
        }
    }
    updatePWAStatus();
}

async function installAquaApp() {
    if (!deferredInstallPrompt) {
        showToast('브라우저 메뉴의 “홈 화면에 추가”도 사용할 수 있어요', '📲', 3400);
        return;
    }
    deferredInstallPrompt.prompt();
    const result = await deferredInstallPrompt.userChoice.catch(() => ({ outcome:'dismissed' }));
    if (result.outcome === 'accepted') setInstallButtonsVisible(false);
    deferredInstallPrompt = null;
}

function measureFPS(duration = 1050) {
    return new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        function tick(now) {
            frames++;
            if (now - start >= duration) resolve(Math.round((frames * 1000) / Math.max(1, now - start)));
            else requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    });
}

async function runPerformanceCheck(silent = false) {
    const fps = await measureFPS(1150);
    lastPerfScore = fps;
    const fill = document.getElementById('perf-fill');
    const readout = document.getElementById('perf-readout');
    if (fill) fill.style.width = `${clamp((fps / 60) * 100, 8, 100)}%`;
    if (readout) readout.textContent = `${fps} FPS · ${fps >= 52 ? '고급 그래픽 권장' : fps >= 38 ? '균형 모드' : '절전 모드 권장'}`;
    if (fps < 38 && graphicsMode !== 'low') {
        graphicsMode = 'low';
        localStorage.setItem('aqua_graphics_mode', graphicsMode);
        applyGraphicsMode();
        if (!silent) showToast('성능 보호를 위해 절전 그래픽으로 전환', '⚡', 3200);
    } else if (!silent) {
        showToast(`성능 점검 완료: ${fps} FPS`, '⚡', 2600);
    }
    return fps;
}

function applyAdaptivePerformance() {
    document.body.classList.add('gpu-boost');
    if (navigator.deviceMemory && navigator.deviceMemory <= 3) {
        graphicsMode = 'low';
        localStorage.setItem('aqua_graphics_mode', graphicsMode);
    }
    if (!reduceMotion) setTimeout(() => runPerformanceCheck(true), 1200);
}

async function toggleImmersiveMode() {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen?.();
            showToast('몰입 모드 시작', '⛶');
        } else {
            await document.exitFullscreen?.();
            showToast('몰입 모드 종료', '↩️');
        }
    } catch (error) {
        showToast('이 브라우저에서는 전체화면 전환이 제한됩니다', '⛶', 3200);
    }
}

function renderDeployActionsPanel() {
    const panel = document.getElementById('deploy-actions-panel');
    if (!panel) return;
    panel.innerHTML = `
        <div class="relative z-10">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <div class="text-[11px] text-cyan-100/70 font-black tracking-wide">AUTO DEPLOY PIPELINE</div>
                    <div class="font-black text-xl tracking-tight mt-0.5">GitHub Actions 자동 배포 준비</div>
                    <div class="text-xs text-white/55 mt-1">GitHub Desktop에서 커밋 후 Push하면 검사와 Pages 배포가 자동 실행됩니다.</div>
                </div>
                <div class="fps-orbit"></div>
            </div>
            <div class="deploy-grid mt-4">
                <div class="deploy-step"><strong>1. VALIDATE</strong><span>HTML/JSON/SW</span></div>
                <div class="deploy-step"><strong>2. ARTIFACT</strong><span>정적 파일 묶기</span></div>
                <div class="deploy-step"><strong>3. PAGES</strong><span>자동 배포</span></div>
            </div>
        </div>`;
}


// ==================== Quest Patch v1.7 ====================
const DAILY_QUESTS = [
    { id:'catch_3', icon:'🎣', name:'물결의 손맛', desc:'오늘 물고기 3마리 포획', target:3, rewardGold:420, rewardExp:90, progress:() => gameState.daily?.stats?.caught || 0 },
    { id:'cast_5', icon:'🌊', name:'부지런한 캐스팅', desc:'낚싯대 5회 던지기', target:5, rewardGold:260, rewardExp:70, progress:() => gameState.daily?.stats?.casts || 0 },
    { id:'earn_1200', icon:'💰', name:'황금 물살', desc:'오늘 낚시 수익 1,200골드 달성', target:1200, rewardGold:560, rewardExp:110, progress:() => gameState.daily?.stats?.goldEarned || 0 },
    { id:'rare_1', icon:'🔵', name:'희귀한 파동', desc:'희귀 등급 이상 1마리 포획', target:1, rewardGold:760, rewardExp:145, progress:() => gameState.daily?.stats?.rareCaught || 0 }
];

const SEASON_MISSIONS = [
    { id:'season_catch_20', icon:'🐟', name:'초보 선장의 출항', desc:'누적 20마리 포획', target:20, rewardGold:1800, rewardExp:320, progress:() => gameState.totalCaught || 0 },
    { id:'season_discover_12', icon:'📖', name:'푸른 도감 연구', desc:'서로 다른 어종 12종 발견', target:12, rewardGold:2400, rewardExp:420, progress:() => getDiscoveredSpeciesCount() },
    { id:'season_earn_15000', icon:'🏦', name:'바다 무역상', desc:'누적 낚시 수익 15,000골드 달성', target:15000, rewardGold:3600, rewardExp:580, progress:() => gameState.totalGoldEarned || 0 },
    { id:'season_hero_5', icon:'🟣', name:'영웅의 파도', desc:'영웅 등급 이상 누적 5마리 포획', target:5, rewardGold:4400, rewardExp:720, progress:() => (gameState.catchHistory || []).filter(f => Number(f.rarity || 1) >= 4).length },
    { id:'season_legendary', icon:'🟠', name:'전설의 첫 조우', desc:'전설 등급 이상 1마리 포획', target:1, rewardGold:6200, rewardExp:980, progress:() => (gameState.catchHistory || []).some(f => Number(f.rarity || 1) >= 5) ? 1 : 0 },
    { id:'season_boss_1', icon:'👑', name:'보스 토벌 입문', desc:'보스 어종 1마리 포획', target:1, rewardGold:9000, rewardExp:1200, progress:() => Number(gameState.bossStats?.defeated || 0) }
];


const FALLBACK_FISH_DATABASE = [
    { id:'lake_crucian_carp', region:'호수', name:'붕어', emoji:'🐟', rarity:1, minValue:45, maxValue:85, exp:24, weight:70, desc:'잔잔한 호수에서 가장 자주 만나는 기본 어종입니다.' },
    { id:'lake_bluegill', region:'호수', name:'블루길', emoji:'🐠', rarity:1, minValue:50, maxValue:95, exp:25, weight:58, desc:'호기심이 많아 미끼에 잘 반응합니다.' },
    { id:'lake_carp', region:'호수', name:'잉어', emoji:'🐟', rarity:2, minValue:95, maxValue:160, exp:40, weight:36, desc:'묵직한 손맛을 주는 호수의 대표 어종입니다.' },
    { id:'lake_golden_carp', region:'호수', name:'황금 잉어', emoji:'🐡', rarity:3, minValue:210, maxValue:380, exp:70, weight:14, desc:'비늘이 햇빛처럼 반짝이는 행운의 물고기입니다.' },
    { id:'lake_moon_koi', region:'호수', name:'달빛 비단잉어', emoji:'🌙', rarity:4, minValue:480, maxValue:760, exp:115, weight:4, desc:'밤하늘의 달빛을 품었다는 영웅 등급 어종입니다.' },
    { id:'river_minnow', region:'강', name:'피라미', emoji:'🐟', rarity:1, minValue:42, maxValue:80, exp:22, weight:66, desc:'빠른 물살을 따라 무리 지어 이동합니다.' },
    { id:'river_catfish', region:'강', name:'메기', emoji:'🐈', rarity:2, minValue:120, maxValue:210, exp:45, weight:35, desc:'힘이 강해 초반 장력 관리 연습에 좋습니다.' },
    { id:'river_mandarin', region:'강', name:'쏘가리', emoji:'🐟', rarity:3, minValue:260, maxValue:430, exp:75, weight:16, desc:'맑은 강의 바위틈에 숨어 있는 고급 민물고기입니다.' },
    { id:'river_salmon', region:'강', name:'은빛 연어', emoji:'🐟', rarity:3, minValue:300, maxValue:520, exp:86, weight:12, desc:'거센 물살을 거슬러 오르는 은빛 대어입니다.' },
    { id:'river_dragon_perch', region:'강', name:'청룡 농어', emoji:'🐉', rarity:4, minValue:650, maxValue:950, exp:135, weight:4, desc:'강물에 스민 용의 기운을 품었다고 전해집니다.' },
    { id:'harbor_mackerel', region:'항구', name:'고등어', emoji:'🐟', rarity:2, minValue:130, maxValue:220, exp:44, weight:48, desc:'항구 근처에서 흔히 잡히는 빠른 바닷물고기입니다.' },
    { id:'harbor_sea_bream', region:'항구', name:'참돔', emoji:'🐠', rarity:3, minValue:280, maxValue:470, exp:78, weight:24, desc:'낚시꾼들이 좋아하는 붉은 바다의 보석입니다.' },
    { id:'harbor_flounder', region:'항구', name:'광어', emoji:'🐟', rarity:3, minValue:320, maxValue:540, exp:85, weight:18, desc:'바닥에 숨어 있다가 강하게 미끼를 물어챕니다.' },
    { id:'harbor_tuna', region:'항구', name:'참치', emoji:'🐟', rarity:4, minValue:700, maxValue:1100, exp:150, weight:7, desc:'항구 밖 깊은 물길에서 등장하는 대형 어종입니다.' },
    { id:'harbor_golden_anchorfish', region:'항구', name:'황금 닻고기', emoji:'⚓', rarity:5, minValue:1450, maxValue:2200, exp:260, weight:2, desc:'오래된 난파선 주변에서 발견된다는 전설 어종입니다.' },
    { id:'deep_lanternfish', region:'심해', name:'초롱아귀', emoji:'💡', rarity:3, minValue:360, maxValue:620, exp:95, weight:34, desc:'심해의 어둠 속에서 작은 빛으로 미끼를 유혹합니다.' },
    { id:'deep_giant_squid', region:'심해', name:'대왕오징어', emoji:'🦑', rarity:4, minValue:900, maxValue:1450, exp:185, weight:13, desc:'강한 장력과 긴 싸움이 필요한 심해의 강자입니다.' },
    { id:'deep_abyss_shark', region:'심해', name:'심연상어', emoji:'🦈', rarity:4, minValue:980, maxValue:1600, exp:205, weight:10, desc:'빛이 닿지 않는 곳에서 사냥하는 영웅 등급 어종입니다.' },
    { id:'deep_crystal_whale', region:'심해', name:'수정 고래', emoji:'🐋', rarity:5, minValue:1900, maxValue:3100, exp:340, weight:3, desc:'몸에 수정처럼 빛나는 무늬가 있는 전설의 고래입니다.' },
    { id:'deep_void_ray', region:'심해', name:'공허 가오리', emoji:'🪽', rarity:5, minValue:2200, maxValue:3600, exp:380, weight:2, desc:'심해의 균열을 타고 나타난다는 희귀한 전설 어종입니다.' },
    { id:'palace_jade_carp', region:'용궁', name:'옥빛 잉어', emoji:'💎', rarity:4, minValue:850, maxValue:1350, exp:175, weight:30, desc:'용궁 정원 연못에서 자란다는 아름다운 어종입니다.' },
    { id:'palace_dragon_seahorse', region:'용궁', name:'용마 해마', emoji:'🐉', rarity:4, minValue:1050, maxValue:1700, exp:210, weight:18, desc:'용의 갈기를 닮은 지느러미가 특징입니다.' },
    { id:'palace_pearl_turtle', region:'용궁', name:'진주 거북', emoji:'🐢', rarity:5, minValue:2100, maxValue:3300, exp:360, weight:8, desc:'천년 진주를 등껍질에 품었다고 알려져 있습니다.' },
    { id:'palace_blue_dragonfish', region:'용궁', name:'청룡어', emoji:'🐲', rarity:5, minValue:2600, maxValue:4200, exp:430, weight:5, desc:'용궁 수호신의 비늘을 닮은 전설 등급 어종입니다.' },
    { id:'palace_sea_king', region:'용궁', name:'해왕룡', emoji:'🐉', rarity:6, minValue:5200, maxValue:8200, exp:800, weight:1, desc:'용궁의 깊은 문이 열릴 때만 모습을 드러내는 신화 어종입니다.' },
    { id:'dimension_star_fish', region:'차원의 바다', name:'별무늬 차원어', emoji:'⭐', rarity:5, minValue:2400, maxValue:3900, exp:420, weight:28, desc:'별빛이 비늘에 갇힌 듯 반짝이는 차원의 어종입니다.' },
    { id:'dimension_time_eel', region:'차원의 바다', name:'시간 장어', emoji:'⏳', rarity:5, minValue:3100, maxValue:5100, exp:520, weight:16, desc:'낚아 올리는 순간 주변 시간이 느려지는 듯한 기분이 듭니다.' },
    { id:'dimension_nebula_whale', region:'차원의 바다', name:'성운 고래', emoji:'🌌', rarity:6, minValue:6500, maxValue:9800, exp:900, weight:5, desc:'성운을 헤엄치는 듯한 거대한 신화 등급 고래입니다.' },
    { id:'dimension_void_dragon', region:'차원의 바다', name:'공허룡', emoji:'🐉', rarity:6, minValue:8200, maxValue:12500, exp:1150, weight:2, desc:'차원의 끝에서 나타나는 최종 목표급 신화 어종입니다.' },
    { id:'dimension_aqua_fantasia', region:'차원의 바다', name:'아쿠아 판타지아', emoji:'👑', rarity:6, minValue:12000, maxValue:18000, exp:1600, weight:1, desc:'게임의 이름을 가진 꿈의 어종. 최고의 낚시꾼만 만날 수 있습니다.' }
];


const BOSS_FISH_DATABASE = [
    { id:'boss_lake_ancient_koi', region:'호수', name:'고대 비단잉어 왕', emoji:'👑', rarity:4, minValue:1250, maxValue:2100, exp:260, weight:.75, boss:true, bossPower:1.10, bossTitle:'호수의 첫 대어', desc:'초보 낚시꾼도 강화 장비로 도전할 수 있는 첫 보스 어종입니다.' },
    { id:'boss_river_thunder_catfish', region:'강', name:'천둥 메기 장군', emoji:'⚡', rarity:5, minValue:2300, maxValue:3900, exp:430, weight:.46, boss:true, bossPower:1.25, bossTitle:'급류의 장군', desc:'장력을 갑자기 끌어올리는 급류 패턴을 사용합니다.' },
    { id:'boss_harbor_iron_tuna', region:'항구', name:'철갑 참치 제독', emoji:'🚢', rarity:5, minValue:3200, maxValue:5600, exp:620, weight:.35, boss:true, bossPower:1.38, bossTitle:'항구의 제독', desc:'묵직한 몸통 돌진으로 릴 진행도를 되감는 바다 보스입니다.' },
    { id:'boss_deep_abyss_leviathan', region:'심해', name:'심연 레비아탄', emoji:'🐋', rarity:6, minValue:7600, maxValue:13200, exp:1200, weight:.22, boss:true, bossPower:1.62, bossTitle:'심해의 재앙', desc:'심해의 압력으로 장력을 폭발시키는 최상위 보스입니다.' },
    { id:'boss_palace_dragon_king', region:'용궁', name:'청룡왕', emoji:'🐲', rarity:6, minValue:11200, maxValue:18800, exp:1750, weight:.16, boss:true, bossPower:1.82, bossTitle:'용궁의 왕', desc:'용궁 문이 열릴 때만 조우한다는 왕급 신화 보스입니다.' },
    { id:'boss_dimension_aqua_origin', region:'차원의 바다', name:'근원의 아쿠아 판타지아', emoji:'🌌', rarity:6, minValue:18000, maxValue:32000, exp:2600, weight:.10, boss:true, bossPower:2.08, bossTitle:'차원의 근원', desc:'차원 균열에서 등장하는 현재 버전의 최종 보스 어종입니다.' }
];

function mergeBossFish(list) {
    const seen = new Set((list || []).map((fish) => fish.id));
    const merged = (list || []).slice();
    BOSS_FISH_DATABASE.forEach((boss) => { if (!seen.has(boss.id)) merged.push({ ...boss }); });
    return merged.map((fish) => ({
        ...fish,
        rarity: Number(fish.rarity || 1),
        weight: Number(fish.weight || 1),
        boss: Boolean(fish.boss),
        bossPower: Number(fish.bossPower || 1)
    }));
}

let FISH_DATABASE = mergeBossFish(FALLBACK_FISH_DATABASE.slice());
let fishDataLoaded = false;

function getRarityConfig(rarity) {
    return RARITY_CONFIG[Number(rarity) || 1] || RARITY_CONFIG[1];
}

function rarityBadge(rarity) {
    const info = getRarityConfig(rarity);
    return `<span style="color:${info.color};border:1px solid ${info.color}66;background:${info.color}18" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold">${info.emoji} ${info.name}</span>`;
}

function randomInt(min, max) {
    return Math.floor(Number(min) + Math.random() * (Number(max) - Number(min) + 1));
}

async function loadFishDatabase() {
    try {
        const res = await fetch('data/fish.json');
        if (!res.ok) throw new Error('fish.json not found');
        const data = await res.json();
        if (!Array.isArray(data.fish) || data.fish.length === 0) throw new Error('fish.json format error');
        FISH_DATABASE = mergeBossFish(data.fish.map((fish) => ({ ...fish, rarity: Number(fish.rarity || 1), weight: Number(fish.weight || 1), boss: Boolean(fish.boss), bossPower: Number(fish.bossPower || 1) })));
        fishDataLoaded = true;
        console.log(`[AquaFantasia] Fish database loaded: ${FISH_DATABASE.length} species`);
    } catch (e) {
        fishDataLoaded = false;
        FISH_DATABASE = mergeBossFish(FALLBACK_FISH_DATABASE.slice());
        console.warn('[AquaFantasia] Using embedded fish database:', e.message);
    }
}


function getFishListForRegion(region) {
    const meta = REGION_META[region] || REGION_META['호수'];
    const list = FISH_DATABASE.filter((fish) => fish.region === region && (fish.boss || (fish.rarity >= meta.minRarity && fish.rarity <= meta.maxRarity)));
    return list.length ? list : FISH_DATABASE.filter((fish) => fish.region === region);
}


function getEffectiveFishWeight(fish) {
    const stats = getEquipmentStats();
    const rarity = Number(fish.rarity || 1);
    let weight = Math.max(fish.boss ? .04 : 1, Number(fish.weight || getRarityConfig(rarity).weight || 1));
    if (rarity >= 4) weight *= (1 + stats.rarityBoost * (rarity - 2));
    if (rarity <= 2) weight *= Math.max(.42, 1 - stats.rarityBoost * .55);
    if (fish.boss) {
        const scoreBoost = clamp((Number(stats.equipmentScore || 0) - 900) / 6200, 0, .95);
        const regionBoost = (gameState.currentRegion === fish.region) ? 1 : .72;
        weight *= regionBoost * (.58 + scoreBoost + Number(stats.rarityBoost || 0));
    }
    return Math.max(fish.boss ? .02 : 1, weight);
}

function pickWeightedFish(region) {
    const list = getFishListForRegion(region || '호수');
    if (!list.length) return FALLBACK_FISH_DATABASE[0];
    const totalWeight = list.reduce((sum, fish) => sum + getEffectiveFishWeight(fish), 0);
    let roll = Math.random() * totalWeight;
    for (const fish of list) {
        roll -= getEffectiveFishWeight(fish);
        if (roll <= 0) return fish;
    }
    return list[list.length - 1];
}

// ==================== Boss Patch v1.9 ====================
function isBossFish(fish) {
    return Boolean(fish && fish.boss);
}

function getBossListForRegion(region = gameState.currentRegion || '호수') {
    return FISH_DATABASE.filter((fish) => fish.region === region && isBossFish(fish));
}

function getBossChanceEstimate(region = gameState.currentRegion || '호수') {
    const list = getFishListForRegion(region);
    const total = list.reduce((sum, fish) => sum + getEffectiveFishWeight(fish), 0);
    if (!total) return 0;
    const bossWeight = list.filter(isBossFish).reduce((sum, fish) => sum + getEffectiveFishWeight(fish), 0);
    return clamp((bossWeight / total) * 100, 0, 100);
}

function getBossPowerLabel(fish) {
    const power = Number(fish?.bossPower || 1);
    if (power >= 2) return 'EXTREME';
    if (power >= 1.75) return 'MYTHIC';
    if (power >= 1.45) return 'RAID';
    if (power >= 1.22) return 'HARD';
    return 'ENTRY';
}

function renderBossQuickPanel() {
    const panel = document.getElementById('boss-quick-panel');
    if (!panel) return;
    const region = gameState.currentRegion || '차원의 바다';
    const bosses = getBossListForRegion(region);
    const boss = bosses[0] || BOSS_FISH_DATABASE[BOSS_FISH_DATABASE.length - 1];
    const chance = getBossChanceEstimate(region);
    const defeated = Number(gameState.bossStats?.defeated || 0);
    const encounters = Number(gameState.bossStats?.encounters || 0);
    const fill = document.getElementById('boss-quick-fill');
    const title = document.getElementById('boss-quick-title');
    const status = document.getElementById('boss-quick-status');
    const count = document.getElementById('boss-quick-count');
    if (title) title.textContent = `${boss.emoji || '👑'} ${boss.name}`;
    if (status) status.textContent = `${region} 보스 · 조우 예상 ${chance.toFixed(2)}% · 장비 점수 ${getEquipmentScore().toLocaleString()}`;
    if (count) count.textContent = `${defeated}승/${encounters}전`;
    if (fill) fill.style.width = Math.max(4, Math.min(100, chance * 12 + defeated * 8)).toFixed(1) + '%';
}

function renderBossPhasePanel() {
    const species = gameState.pendingFish;
    const panel = document.getElementById('boss-phase-panel');
    if (!panel) return;
    if (!isBossFish(species)) {
        panel.classList.add('hidden');
        panel.classList.remove('boss-perfect');
        return;
    }
    panel.classList.remove('hidden');
    panel.classList.toggle('boss-perfect', Boolean(gameState.bossWindowActive));
    const name = document.getElementById('boss-phase-name');
    const hint = document.getElementById('boss-phase-hint');
    const badge = document.getElementById('boss-phase-badge');
    if (name) name.textContent = `${species.emoji || '👑'} ${species.name}`;
    if (hint) hint.textContent = gameState.bossWindowActive ? '지금 릴 감기! 카운터 보너스 발동' : '돌진 파동을 버티고 빛나는 순간을 노리세요';
    if (badge) badge.textContent = getBossPowerLabel(species);
}

function activateBossEncounter(species) {
    const visual = document.getElementById('fishing-visual');
    const reel = document.getElementById('reel-game');
    if (visual) visual.classList.add('boss-encounter');
    if (reel) reel.classList.add('boss-reel');
    if (!gameState.bossStats || typeof gameState.bossStats !== 'object') gameState.bossStats = { encounters: 0, defeated: 0, escaped: 0, bestValue: 0 };
    gameState.bossStats.encounters = Number(gameState.bossStats.encounters || 0) + 1;
    showToast(`${species.emoji || '👑'} ${species.name} 보스 조우!`, '⚠️', 3600);
    createBossRipple(3);
}

function resetBossVisuals() {
    const visual = document.getElementById('fishing-visual');
    const reel = document.getElementById('reel-game');
    const panel = document.getElementById('boss-phase-panel');
    if (visual) visual.classList.remove('boss-encounter');
    if (reel) reel.classList.remove('boss-reel');
    if (panel) panel.classList.add('hidden');
    gameState.bossWindowActive = false;
    gameState.bossSurgeTick = 0;
}

function createBossRipple(count = 1) {
    if (reduceMotion) return;
    const visual = document.getElementById('fishing-visual');
    if (!visual) return;
    const max = graphicsMode === 'low' ? Math.min(count, 1) : count;
    for (let i = 0; i < max; i++) {
        const ripple = document.createElement('div');
        ripple.className = 'boss-ripple';
        ripple.style.animationDelay = `${i * 110}ms`;
        visual.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    }
}

function triggerBossSurge() {
    const species = gameState.pendingFish;
    if (!isBossFish(species)) return;
    const power = Number(species.bossPower || 1.2);
    gameState.tension = Math.min(100, Number(gameState.tension || 0) + 4.5 + power * 4.8);
    gameState.reelProgress = Math.max(0, Number(gameState.reelProgress || 0) - (1.8 + power * 1.7));
    const status = document.getElementById('fishing-status');
    if (status) status.innerHTML = `<span class="text-rose-300 font-extrabold">⚠️ ${escapeHTML(species.name)} 돌진 파동!</span>`;
    haptic([14, 24, 14]);
    createBossRipple(2);
}

function openBossPerfectWindow(duration = 860) {
    if (!isBossFish(gameState.pendingFish) || gameState.bossWindowActive) return;
    gameState.bossWindowActive = true;
    renderBossPhasePanel();
    createBossRipple(1);
    setTimeout(() => {
        if (gameState.bossWindowActive) {
            gameState.bossWindowActive = false;
            renderBossPhasePanel();
        }
    }, duration);
}

function createBossVictoryBurst() {
    if (graphicsMode === 'low' || reduceMotion) return;
    const visual = document.getElementById('fishing-visual');
    if (!visual) return;
    const colors = ['#fb7185', '#facc15', '#a78bfa', '#38bdf8', '#ffffff'];
    for (let i = 0; i < 56; i++) {
        const spark = document.createElement('div');
        spark.className = 'boss-spark';
        spark.style.left = (34 + Math.random() * 32) + '%';
        spark.style.top = (26 + Math.random() * 24) + '%';
        spark.style.background = colors[Math.floor(Math.random() * colors.length)];
        spark.style.color = spark.style.background;
        visual.appendChild(spark);
        const x = (Math.random() - .5) * 220;
        const y = -(60 + Math.random() * 170);
        spark.animate([
            { transform:'translate(0,0) scale(1)', opacity:1 },
            { transform:`translate(${x}px, ${y}px) scale(.16) rotate(${Math.random()*260}deg)`, opacity:0 }
        ], { duration: 900 + Math.random() * 640, easing:'cubic-bezier(.16,.9,.2,1)' }).onfinish = () => spark.remove();
    }
}


function getRegionMeta(region) {
    return REGION_META[region] || REGION_META['호수'];
}

function describeRegion(region) {
    const meta = getRegionMeta(region);
    return `${meta.desc} · ${getRarityConfig(meta.minRarity).name}~${getRarityConfig(meta.maxRarity).name}`;
}

function getDiscoveredSpeciesCount() {
    if (!(gameState.discovered instanceof Set)) return 0;
    const validIds = new Set(FISH_DATABASE.map((fish) => fish.id));
    return Array.from(gameState.discovered).filter((id) => validIds.has(id)).length;
}

function getRod(id = gameState.equipment?.rod) {
    return RODS.find((rod) => rod.id === id) || RODS[0];
}

function getBait(id = gameState.equipment?.bait) {
    return BAITS.find((bait) => bait.id === id) || BAITS[0];
}

function getEquipmentStats() {
    const rod = getRod();
    const bait = getBait();
    const enhanceLevel = getRodEnhanceLevel(rod.id);
    const forgeMult = enhanceLevel / ENHANCE_MAX_LEVEL;
    return {
        enhanceLevel,
        equipmentScore: getEquipmentScore(),
        powerBonus: Number(rod.powerBonus || 0) + enhanceLevel * .025,
        tensionControl: Number(rod.tensionControl || 0) + enhanceLevel * .008,
        tensionRelief: Number(rod.tensionRelief || 0) + enhanceLevel * .45,
        rarityBoost: Number(rod.rarityBoost || 0) + Number(bait.rarityBoost || 0) + forgeMult * .06,
        valueBonus: Number(rod.valueBonus || 0) + Number(bait.valueBonus || 0) + enhanceLevel * .01,
        expBonus: Number(rod.expBonus || 0) + Number(bait.expBonus || 0) + enhanceLevel * .006,
        biteSpeed: Number(bait.biteSpeed || 0) + forgeMult * .015
    };
}

function isRodOwned(id) {
    return Array.isArray(gameState.ownedRods) && gameState.ownedRods.includes(id);
}

function getBaitCount(id) {
    if (id === 'basic_bait') return 999999;
    return Math.max(0, Number(gameState.baitInventory?.[id] || 0));
}

function ensureUsableBait() {
    const baitId = gameState.equipment?.bait || 'basic_bait';
    if (baitId !== 'basic_bait' && getBaitCount(baitId) <= 0) {
        gameState.equipment.bait = 'basic_bait';
        showToast('미끼가 부족해 기본 미끼로 교체했어요', '🪱');
    }
}

function consumeEquippedBait() {
    ensureUsableBait();
    const baitId = gameState.equipment?.bait || 'basic_bait';
    if (baitId === 'basic_bait') return;
    gameState.baitInventory[baitId] = Math.max(0, getBaitCount(baitId) - 1);
    if (gameState.baitInventory[baitId] <= 0) gameState.equipment.bait = 'basic_bait';
}

function formatPercent(value) {
    return `${Math.round(Number(value || 0) * 100)}%`;
}


// ==================== Quest Runtime Restored / v1.9 Safe ====================
function getKstDateKey(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit' }).format(date);
}

function daysBetweenKst(fromKey, toKey = getKstDateKey()) {
    if (!fromKey) return 999;
    const a = new Date(`${fromKey}T00:00:00+09:00`).getTime();
    const b = new Date(`${toKey}T00:00:00+09:00`).getTime();
    return Math.round((b - a) / 86400000);
}

function ensureDailyState(preserve = true) {
    const today = getKstDateKey();
    if (!gameState.daily || typeof gameState.daily !== 'object') gameState.daily = { dateKey:'', checkedIn:false, streak:0, lastCheckIn:'', claimedQuests:{}, stats:{ casts:0, caught:0, rareCaught:0, goldEarned:0 } };
    if (!gameState.daily.stats || typeof gameState.daily.stats !== 'object') gameState.daily.stats = { casts:0, caught:0, rareCaught:0, goldEarned:0 };
    if (!gameState.daily.claimedQuests || typeof gameState.daily.claimedQuests !== 'object') gameState.daily.claimedQuests = {};
    if (gameState.daily.dateKey !== today) {
        const last = gameState.daily.lastCheckIn || '';
        const streak = daysBetweenKst(last, today) > 1 ? 0 : Number(gameState.daily.streak || 0);
        gameState.daily = { dateKey:today, checkedIn:false, streak: preserve ? streak : 0, lastCheckIn:last, claimedQuests:{}, stats:{ casts:0, caught:0, rareCaught:0, goldEarned:0 } };
    }
    ['casts','caught','rareCaught','goldEarned'].forEach((key) => { gameState.daily.stats[key] = Math.max(0, Number(gameState.daily.stats[key] || 0)); });
    if (!gameState.season || typeof gameState.season !== 'object') gameState.season = { claimed:{} };
    if (!gameState.season.claimed || typeof gameState.season.claimed !== 'object') gameState.season.claimed = {};
    return gameState.daily;
}

function recordDailyCast() {
    ensureDailyState(true);
    gameState.daily.stats.casts = Number(gameState.daily.stats.casts || 0) + 1;
}

function recordDailyCatch(fish, value = 0) {
    ensureDailyState(true);
    gameState.daily.stats.caught = Number(gameState.daily.stats.caught || 0) + 1;
    if (Number(fish?.rarity || 1) >= 3) gameState.daily.stats.rareCaught = Number(gameState.daily.stats.rareCaught || 0) + 1;
    gameState.daily.stats.goldEarned = Number(gameState.daily.stats.goldEarned || 0) + Number(value || 0);
}

function getQuestProgress(quest) {
    return Math.min(Number(quest.target || 1), Math.max(0, Number(quest.progress?.() || 0)));
}

function isQuestComplete(quest) {
    return getQuestProgress(quest) >= Number(quest.target || 1);
}

function renderMissionQuickSummary() {
    const daily = ensureDailyState(true);
    const total = DAILY_QUESTS.length + 1;
    const completeQuests = DAILY_QUESTS.filter((q) => isQuestComplete(q) || daily.claimedQuests[q.id]).length;
    const complete = completeQuests + (daily.checkedIn ? 1 : 0);
    const count = document.getElementById('mission-quick-count');
    const status = document.getElementById('mission-quick-status');
    const fill = document.getElementById('mission-quick-fill');
    if (count) count.textContent = `${complete}/${total}`;
    if (status) status.textContent = daily.checkedIn ? `데일리 ${completeQuests}/${DAILY_QUESTS.length} 완료 · 연속 ${daily.streak}일` : '출석 보상이 기다리고 있어요';
    if (fill) fill.style.width = `${Math.floor((complete / total) * 100)}%`;
}

function claimAttendance() {
    const daily = ensureDailyState(true);
    if (daily.checkedIn) return showToast('오늘 출석 보상은 이미 받았습니다', '🗓️');
    const today = getKstDateKey();
    daily.streak = daysBetweenKst(daily.lastCheckIn, today) === 1 ? Number(daily.streak || 0) + 1 : 1;
    daily.checkedIn = true;
    daily.lastCheckIn = today;
    const gold = 320 + Math.min(14, daily.streak) * 55;
    const exp = 80 + Math.min(14, daily.streak) * 10;
    addGold(gold);
    addExp(exp);
    showToast(`출석 보상 +${gold.toLocaleString()}골드 · +${exp}EXP`, '🗓️', 3200);
    renderQuests();
    renderMissionQuickSummary();
    savePlayerData();
}

function claimDailyQuest(id) {
    ensureDailyState(true);
    const quest = DAILY_QUESTS.find((q) => q.id === id);
    if (!quest) return;
    if (gameState.daily.claimedQuests[id]) return showToast('이미 받은 미션 보상입니다', '✅');
    if (!isQuestComplete(quest)) return showToast('아직 미션이 완료되지 않았습니다', quest.icon || '🗓️');
    gameState.daily.claimedQuests[id] = true;
    addGold(Number(quest.rewardGold || 0));
    addExp(Number(quest.rewardExp || 0));
    showToast(`${quest.icon} ${quest.name} 보상 수령!`, '🎁', 3200);
    renderQuests();
    renderMissionQuickSummary();
    savePlayerData();
}

function claimSeasonMission(id) {
    if (!gameState.season || typeof gameState.season !== 'object') gameState.season = { claimed:{} };
    if (!gameState.season.claimed || typeof gameState.season.claimed !== 'object') gameState.season.claimed = {};
    const mission = SEASON_MISSIONS.find((q) => q.id === id);
    if (!mission) return;
    if (gameState.season.claimed[id]) return showToast('이미 받은 시즌 보상입니다', '✅');
    if (!isQuestComplete(mission)) return showToast('아직 시즌 미션이 완료되지 않았습니다', mission.icon || '🏁');
    gameState.season.claimed[id] = true;
    addGold(Number(mission.rewardGold || 0));
    addExp(Number(mission.rewardExp || 0));
    showToast(`${mission.icon} ${mission.name} 시즌 보상 수령!`, '🏆', 3600);
    renderQuests();
    savePlayerData();
}

function renderQuestCard(quest, claimed, handler) {
    const progress = getQuestProgress(quest);
    const target = Number(quest.target || 1);
    const pct = clamp((progress / target) * 100, 0, 100);
    const complete = pct >= 100;
    const div = document.createElement('div');
    div.className = `quest-card premium-glass rounded-3xl p-4 ${complete ? 'completed' : ''} ${claimed ? 'claimed' : ''}`;
    div.innerHTML = `
        <div class="relative z-10 flex items-center gap-4">
            <div class="quest-ring" style="--p:${pct}%;--ring:${complete ? '#34d399' : '#38bdf8'}"><span>${Math.floor(pct)}%</span></div>
            <div class="flex-1 min-w-0">
                <div class="font-black text-lg truncate">${escapeHTML(quest.icon || '🗓️')} ${escapeHTML(quest.name)}</div>
                <div class="text-xs text-white/55 mt-0.5">${escapeHTML(quest.desc)}</div>
                <div class="mt-2 mission-progress"><span style="width:${pct}%"></span></div>
                <div class="flex justify-between text-[10px] text-white/50 mt-1"><span>${progress.toLocaleString()}/${target.toLocaleString()}</span><span>+${Number(quest.rewardGold || 0).toLocaleString()}G · +${Number(quest.rewardExp || 0)}EXP</span></div>
            </div>
            <button onclick="${handler}('${quest.id}')" class="px-3 py-2 rounded-2xl text-xs font-extrabold ${claimed ? 'bg-white/10 text-white/45' : complete ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/10 text-white/40'}">${claimed ? '완료' : complete ? '수령' : '진행'}</button>
        </div>`;
    return div;
}

function renderQuests() {
    const daily = ensureDailyState(true);
    const date = document.getElementById('quest-date-label');
    const attendance = document.getElementById('attendance-card');
    const dailyList = document.getElementById('daily-quest-list');
    const seasonList = document.getElementById('season-mission-list');
    const progressLabel = document.getElementById('daily-progress-label');
    if (date) date.textContent = `${daily.dateKey} · KST 기준 데일리 리셋`;
    if (attendance) {
        const reward = 320 + Math.min(14, Number(daily.streak || 0) + 1) * 55;
        attendance.innerHTML = `
            <div class="relative z-10 flex items-start justify-between gap-3">
                <div>
                    <div class="text-[11px] text-cyan-100/70 font-bold tracking-wide">DAILY CHECK-IN</div>
                    <div class="font-black text-2xl tracking-tight mt-1">연속 출석 ${Number(daily.streak || 0)}일</div>
                    <div class="text-xs text-white/60 mt-1">오늘 보상: ${reward.toLocaleString()}골드 + 경험치</div>
                </div>
                <button onclick="claimAttendance()" class="px-4 py-3 rounded-2xl text-sm font-extrabold ${daily.checkedIn ? 'bg-white/10 text-white/45' : 'bg-emerald-400/20 text-emerald-100'}">${daily.checkedIn ? '수령 완료' : '출석 보상'}</button>
            </div>`;
    }
    if (dailyList) {
        dailyList.innerHTML = '';
        DAILY_QUESTS.forEach((quest) => dailyList.appendChild(renderQuestCard(quest, Boolean(daily.claimedQuests[quest.id]), 'claimDailyQuest')));
    }
    if (seasonList) {
        seasonList.innerHTML = '';
        SEASON_MISSIONS.forEach((mission) => seasonList.appendChild(renderQuestCard(mission, Boolean(gameState.season?.claimed?.[mission.id]), 'claimSeasonMission')));
    }
    if (progressLabel) {
        const done = DAILY_QUESTS.filter((q) => daily.claimedQuests[q.id]).length;
        progressLabel.textContent = `${done}/${DAILY_QUESTS.length} 보상 수령`;
    }
    renderMissionQuickSummary();
}


function setFirebaseStatus(mode, text) {
    const el = document.getElementById('firebase-status');
    if (!el) return;
    const color = mode === 'ok' ? '#22c55e' : mode === 'error' ? '#ef4444' : '#facc15';
    el.innerHTML = `<div style="width:6px;height:6px;background:${color};border-radius:9999px"></div><span class="font-medium">${escapeHTML(text)}</span>`;
}

function setCloudSaveStatus(mode, text) {
    const el = document.getElementById('cloud-save-status');
    if (!el) return;
    const color = mode === 'ok' ? 'text-emerald-300' : mode === 'error' ? 'text-rose-300' : 'text-yellow-300';
    el.className = `px-3 py-1 text-[11px] rounded-full bg-white/10 ${color}`;
    el.textContent = text;
}

function escapeHTML(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function sanitizeNickname(value) {
    const nickname = String(value || '낚시꾼').replace(/\s+/g, ' ').trim().slice(0, 24);
    return nickname || '낚시꾼';
}

function showLoginScreen() {
    document.querySelectorAll('[id^="screen-"]').forEach(el => el.classList.add('hidden'));
    document.getElementById('screen-login')?.classList.remove('hidden');
    document.getElementById('logout-btn')?.classList.add('hidden');
}

function waitForFirebase(timeoutMs = 7000) {
    if (window.AquaFirebase) return Promise.resolve(window.AquaFirebase);
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Firebase SDK 로딩 시간이 초과되었습니다.')), timeoutMs);
        window.addEventListener('aqua-firebase-ready', () => { clearTimeout(timer); resolve(window.AquaFirebase); }, { once: true });
        window.addEventListener('aqua-firebase-error', (e) => { clearTimeout(timer); reject(e.detail || new Error('Firebase 초기화 실패')); }, { once: true });
    });
}

// ==================== Visual / Performance Helpers (v1.4) ====================
function runFishingTimer(callback, delay) {
    const id = setTimeout(() => {
        fishingTimers = fishingTimers.filter((timerId) => timerId !== id);
        callback();
    }, delay);
    fishingTimers.push(id);
    return id;
}

function clearFishingTimers() {
    fishingTimers.forEach((timerId) => clearTimeout(timerId));
    fishingTimers = [];
}

function haptic(pattern = 12) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(e) {}
}

function applyGraphicsMode() {
    const low = graphicsMode === 'low' || reduceMotion;
    document.body.classList.toggle('quality-low', low);
    const toggle = document.getElementById('graphics-toggle');
    if (toggle) toggle.textContent = low ? '그래픽 절전' : '그래픽 고급';
}

function toggleGraphicsMode() {
    graphicsMode = graphicsMode === 'low' ? 'high' : 'low';
    localStorage.setItem('aqua_graphics_mode', graphicsMode);
    applyGraphicsMode();
    showToast(graphicsMode === 'low' ? '그래픽 절전 모드로 변경' : '그래픽 고급 모드로 변경', '🌊');
}

function bindPremiumCardPointer() {
    let raf = 0;
    document.addEventListener('pointermove', (event) => {
        const card = event.target.closest?.('.premium-card');
        if (!card) return;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
            card.style.setProperty('--my', `${event.clientY - rect.top}px`);
        });
    }, { passive: true });
}

function showToast(message, icon = '✨', life = 2600) {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;
    const item = document.createElement('div');
    item.className = 'aqua-toast premium-glass rounded-2xl px-4 py-3 text-sm shadow-2xl';
    item.style.setProperty('--life', life + 'ms');
    item.innerHTML = `<div class="flex items-center gap-3"><div class="text-xl">${escapeHTML(icon)}</div><div class="font-bold leading-snug">${escapeHTML(message)}</div></div>`;
    stack.appendChild(item);
    setTimeout(() => item.remove(), life + 420);
}


// ==================== SOUND SYSTEM (NEW) ====================
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
        console.log("Web Audio not supported");
    }
}

function playSound(type) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.type = type === 'success' ? 'sine' : 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.value = type === 'success' ? 1200 : 800;
    
    if (type === 'cast') {
        oscillator.frequency.value = 220;
        gain.gain.value = 0.3;
        setTimeout(() => gain.gain.value = 0, 180);
    } else if (type === 'bite') {
        oscillator.frequency.value = 880;
        gain.gain.value = 0.5;
        setTimeout(() => gain.gain.value = 0, 120);
    } else if (type === 'success') {
        oscillator.frequency.value = 660;
        gain.gain.value = 0.4;
        setTimeout(() => { oscillator.frequency.value = 880; }, 150);
        setTimeout(() => gain.gain.value = 0, 450);
    } else if (type === 'fail') {
        oscillator.frequency.value = 180;
        gain.gain.value = 0.4;
        setTimeout(() => gain.gain.value = 0, 300);
    } else if (type === 'upgrade') {
        oscillator.type = 'triangle';
        oscillator.frequency.value = 520;
        gain.gain.value = 0.36;
        setTimeout(() => { oscillator.frequency.value = 760; }, 90);
        setTimeout(() => { oscillator.frequency.value = 1040; }, 190);
        setTimeout(() => gain.gain.value = 0, 420);
    }
    
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 600);
}

// ==================== UI ====================
function updateUI() {
    gameState.nickname = sanitizeNickname(gameState.nickname);
    document.getElementById('gold-display').textContent = Number(gameState.gold || 0).toLocaleString();
    document.getElementById('level-display').textContent = Number(gameState.level || 1);
    const lvl = document.getElementById('village-level'); if (lvl) lvl.textContent = Number(gameState.level || 1);
    const nameEl = document.getElementById('player-name'); if (nameEl) nameEl.textContent = gameState.nickname;
    
    const avatarImg = document.getElementById('avatar-img');
    if (avatarImg) avatarImg.src = gameState.gender === 'male' ? 'assets/images/zZHXu.jpg' : 'assets/images/sN0n9.jpg';
    const expRatio = Math.max(0, Math.min(100, Math.floor((Number(gameState.exp || 0) / Math.max(1, Number(gameState.expToNext || 1000))) * 100)));
    const xpFill = document.getElementById('xp-fill');
    const xpText = document.getElementById('xp-text');
    if (xpFill) xpFill.style.width = expRatio + '%';
    if (xpText) xpText.textContent = expRatio + '%';
    const mini = document.getElementById('equipped-mini');
    if (mini) {
        const rod = getRod();
        const bait = getBait();
        const countText = bait.id === 'basic_bait' ? '∞' : getBaitCount(bait.id).toLocaleString();
        mini.textContent = `${rod.emoji} ${rod.name} · ${bait.emoji} ${bait.name} x${countText}`;
    }
    ensureDailyState(true);
    renderMissionQuickSummary();
    renderBossQuickPanel();
    updatePWAStatus();
    applyGraphicsMode();
}

function switchScreen(screen) {
    const apply = () => {
        document.querySelectorAll('#main-content > div').forEach(d => {
            d.classList.add('hidden');
            d.classList.remove('screen-enter');
        });
        const el = document.getElementById('screen-' + screen);
        if (el) {
            el.classList.remove('hidden');
            if (!reduceMotion) {
                void el.offsetWidth;
                el.classList.add('screen-enter');
            }
        }
        const heavyRender = () => {
            if (screen === 'quests') renderQuests();
            if (screen === 'equipment') renderEquipment();
            if (screen === 'inventory') renderInventory();
            if (screen === 'record') renderRecord();
            if (screen === 'competition') renderCompetition();
            if (screen === 'achievements') renderAchievements();
            if (screen === 'encyclopedia') renderEncyclopedia();
        };
        if (screen === 'fishing' || screen === 'village') heavyRender();
        else scheduleAquaTask(heavyRender, 'user-visible');
    };
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
    else apply();
}

// ==================== 지역 & 낚시 ====================
function selectRegion(region) {
    gameState.currentRegion = region;
    switchScreen('fishing');
    const meta = getRegionMeta(region);
    document.getElementById('fishing-region-name').textContent = `${meta.emoji} ${region}`;
    const info = document.getElementById('fishing-region-info');
    if (info) info.textContent = `${describeRegion(region)} · ${getRod().name}`;
    renderBossQuickPanel();
    resetBossVisuals();
    const depth = document.getElementById('depth-meter');
    if (depth) depth.style.setProperty('--depth', `${22 + Math.random()*56}%`);
    createFishShadows(region);
}

function createFishShadows(region) {
    const container = document.getElementById('fish-shadow-container');
    if (!container) return;
    container.innerHTML = '';
    const meta = getRegionMeta(region);
    const highQuality = graphicsMode !== 'low' && !reduceMotion;
    const count = highQuality ? (region.includes('용') || region.includes('차원') ? 9 : region.includes('심해') ? 7 : 5) : 3;
    for (let i = 0; i < count; i++) {
        const fish = document.createElement('div');
        fish.className = 'fish-shadow';
        fish.style.left = Math.random()*78 + '%';
        fish.style.top = (16 + Math.random()*54) + '%';
        fish.style.setProperty('--duration', (6 + Math.random()*7) + 's');
        fish.style.setProperty('--drift', (28 + Math.random()*80) + 'px');
        fish.style.setProperty('--rise', ((Math.random() - 0.5) * 24) + 'px');
        fish.style.setProperty('--size', (1.8 + Math.random()*1.6) + 'rem');
        fish.style.animationDelay = (-Math.random()*5) + 's';
        fish.textContent = Math.random() < 0.25 ? meta.emoji : (region.includes('용') || region.includes('차원') ? '🐉' : '🐟');
        container.appendChild(fish);
    }
}

function animateCastOrb() {
    if (graphicsMode === 'low' || reduceMotion) return;
    const orb = document.getElementById('cast-orb');
    if (!orb) return;
    orb.classList.remove('active');
    void orb.offsetWidth;
    orb.classList.add('active');
}

function createSonarPulse(count = 1) {
    if (graphicsMode === 'low' || reduceMotion) return;
    const layer = document.getElementById('sonar-layer');
    if (!layer) return;
    for (let i = 0; i < count; i++) {
        const pulse = document.createElement('div');
        pulse.className = 'sonar-pulse';
        pulse.style.animationDelay = `${i * 120}ms`;
        layer.appendChild(pulse);
        pulse.addEventListener('animationend', () => pulse.remove(), { once: true });
    }
}

function castLine() {
    if (gameState.isFishing) return;
    if (!gameState.currentRegion) {
        alert('먼저 낚시 지역을 선택해주세요!');
        switchScreen('village');
        return;
    }

    clearFishingTimers();
    ensureUsableBait();
    consumeEquippedBait();
    recordDailyCast();
    updateUI();
    savePlayerData(false);
    gameState.isFishing = true;
    gameState.pendingFish = pickWeightedFish(gameState.currentRegion);
    haptic(10);
    playSound('cast');
    animateCastOrb();
    createSonarPulse(2);
    const status = document.getElementById('fishing-status');
    const castBtn = document.getElementById('cast-btn');
    const rod = document.getElementById('rod');
    const meta = getRegionMeta(gameState.currentRegion);
    const stats = getEquipmentStats();
    const biteDelay = Math.max(650, Math.floor(randomInt(meta.biteMin, meta.biteMax) * (1 - stats.biteSpeed)));
    const rarity = getRarityConfig(gameState.pendingFish.rarity);
    const hintDelay = Math.max(700, biteDelay - 850);

    castBtn.style.display = 'none';
    status.textContent = `${getBait().emoji} ${getBait().name} 투척! 입질을 기다리는 중...`;

    if (rod) {
        rod.style.transition = 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)';
        rod.style.transform = 'rotate(-92deg)';
        setTimeout(() => { if (rod) rod.style.transform = 'rotate(-32deg)'; }, 580);
    }

    runFishingTimer(() => {
        if (gameState.isFishing && gameState.pendingFish) {
            status.innerHTML = `<span style="color:${rarity.color}" class="font-extrabold">${rarity.emoji} ${rarity.name} 기운이 느껴집니다...</span>`;
        }
    }, hintDelay);

    runFishingTimer(() => {
        if (!gameState.isFishing || !gameState.pendingFish) return;
        createSplashEffect();
        createSonarPulse(3);
        haptic([18, 30, 18]);
        playSound('bite');
        status.innerHTML = `<span class="text-rose-400 font-extrabold">🎣 물었다! 탭해서 낚아채세요</span>`;

        const visual = document.getElementById('fishing-visual');
        gameState.currentFish = { hookedAt: Date.now(), speciesId: gameState.pendingFish.id };
        visual.onclick = () => {
            visual.onclick = null;
            gameState.currentFish = null;
            haptic(18);
            startReelGame();
        };

        runFishingTimer(() => {
            if (gameState.currentFish) {
                gameState.currentFish = null;
                gameState.pendingFish = null;
                gameState.isFishing = false;
                visual.onclick = null;
                status.textContent = '아쉽게 놓쳤어요...';
                setTimeout(() => { castBtn.style.display = 'flex'; status.textContent = '물고기를 기다리는 중...'; }, 1300);
            }
        }, 1550);
    }, biteDelay);
}

function createSplashEffect() {
    const visual = document.getElementById('fishing-visual');
    const count = (graphicsMode === 'low' || reduceMotion) ? 6 : 16;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'splash-particle';
        p.style.left = (42 + Math.random()*28) + '%';
        p.style.bottom = (28 + Math.random()*18) + '%';
        p.style.setProperty('--dx', ((Math.random() - 0.5) * 34) + 'px');
        visual.appendChild(p);
        setTimeout(() => p.remove(), 650);
    }
}


function startReelGame() {
    const status = document.getElementById('fishing-status');
    const reel = document.getElementById('reel-game');
    const castBtn = document.getElementById('cast-btn');
    const species = gameState.pendingFish || pickWeightedFish(gameState.currentRegion || '호수');
    const rarity = Number(species?.rarity || 1);
    const stats = getEquipmentStats();
    const bossMode = isBossFish(species);
    const bossPower = Number(species?.bossPower || 1);

    haptic(bossMode ? [18, 35, 18] : 12);
    if (bossMode) activateBossEncounter(species);
    else resetBossVisuals();
    status.innerHTML = bossMode ? `<span class="text-rose-300 font-extrabold">👑 ${escapeHTML(species.name)}와 힘겨루기 시작!</span>` : '릴을 감는 중...';
    castBtn.style.display = 'none';
    reel.classList.remove('hidden');

    gameState.bossWindowActive = false;
    gameState.bossSurgeTick = 0;
    gameState.reelProgress = Math.max(bossMode ? 2 : 5, 12 - rarity + stats.powerBonus * 16 - (bossMode ? bossPower * 2.4 : 0));
    gameState.tension = Math.max(bossMode ? 22 : 5, 18 + rarity * 4 - stats.tensionRelief + (bossMode ? bossPower * 7.8 : 0));
    renderBossPhasePanel();
    updateReelUI();

    if (gameState.reelInterval) clearInterval(gameState.reelInterval);

    gameState.reelInterval = setInterval(() => {
        const loopStats = getEquipmentStats();
        const pressureMult = bossMode ? (1.12 + bossPower * .20) : 1;
        gameState.tension += (1.0 + rarity * 0.24) * pressureMult * Math.max(.58, 1 - loopStats.tensionControl);
        if (bossMode) {
            gameState.bossSurgeTick = Number(gameState.bossSurgeTick || 0) + 1;
            const surgeEvery = Math.max(9, Math.floor(24 - bossPower * 5 - Math.min(4, loopStats.enhanceLevel * .25)));
            if (gameState.bossSurgeTick % surgeEvery === 0) triggerBossSurge();
            const windowChance = .018 + Math.min(.032, loopStats.enhanceLevel * .0035 + Number(loopStats.rarityBoost || 0) * .08);
            if (!gameState.bossWindowActive && Math.random() < windowChance) openBossPerfectWindow(760 + Math.min(320, loopStats.enhanceLevel * 22));
        }
        if (gameState.tension >= 100) { clearInterval(gameState.reelInterval); endReelGame(false); }
        updateReelUI();
    }, 130);
}


function updateReelUI() {
    const reelValue = clamp(gameState.reelProgress, 0, 100);
    const tensionValue = clamp(gameState.tension, 0, 100);
    document.getElementById('reel-bar').style.width = reelValue + '%';
    document.getElementById('reel-text').textContent = Math.floor(reelValue) + '%';
    document.getElementById('tension-bar').style.width = tensionValue + '%';
    document.getElementById('tension-text').textContent = Math.floor(tensionValue) + '%';
    renderBossPhasePanel();
}


function reelAction() {
    haptic(gameState.bossWindowActive ? [8, 16, 8] : 6);
    const species = gameState.pendingFish;
    const rarity = Number(species?.rarity || 1);
    const stats = getEquipmentStats();
    const bossMode = isBossFish(species);
    let gain = Math.max(5.2, 9.4 - rarity * 0.45) * (1 + stats.powerBonus);
    let relief = Math.max(6, 11 - rarity * 0.45) + stats.tensionRelief;
    if (bossMode) {
        gain *= .86;
        relief *= .88;
        if (gameState.bossWindowActive) {
            gain *= 1.9;
            relief += 9 + stats.enhanceLevel * .65;
            gameState.bossWindowActive = false;
            const status = document.getElementById('fishing-status');
            if (status) status.innerHTML = '<span class="text-amber-200 font-extrabold">✨ 퍼펙트 카운터!</span>';
            createBossRipple(1);
        }
    }
    gameState.reelProgress += gain;
    gameState.tension = Math.max(5, gameState.tension - relief);
    updateReelUI();
    if (gameState.reelProgress >= 100) { clearInterval(gameState.reelInterval); endReelGame(true); }
}


function endReelGame(success) {
    gameState.currentFish = null;
    gameState.isFishing = false;
    const reel = document.getElementById('reel-game');
    const status = document.getElementById('fishing-status');
    const castBtn = document.getElementById('cast-btn');
    const species = gameState.pendingFish || pickWeightedFish(gameState.currentRegion || '호수');
    const bossMode = isBossFish(species);

    reel.classList.add('hidden');

    if (success) {
        haptic(bossMode ? [24, 42, 24, 42, 24] : [20, 35, 20]);
        playSound('success');
        const rarity = getRarityConfig(species.rarity);
        const stats = getEquipmentStats();
        const bossBonus = bossMode ? Number(species.bossValueBonus || (1.28 + Number(species.bossPower || 1) * .22)) : 1;
        const value = Math.round(randomInt(species.minValue, species.maxValue) * (1 + stats.valueBonus) * bossBonus);
        const fish = {
            id: `${species.id}_${Date.now()}`,
            speciesId: species.id,
            name: species.name,
            emoji: species.emoji || '🐟',
            region: species.region || gameState.currentRegion,
            rarity: Number(species.rarity || 1),
            rarityName: rarity.name,
            soldValue: value,
            boss: bossMode,
            bossTitle: species.bossTitle || '',
            caughtAt: new Date().toISOString()
        };

        gameState.inventory.push(fish);
        gameState.discovered.add(species.id);
        gameState.catchHistory.unshift(fish);
        gameState.catchHistory = gameState.catchHistory.slice(0, 50);
        gameState.totalCaught = (gameState.totalCaught || 0) + 1;
        gameState.totalGoldEarned = (gameState.totalGoldEarned || 0) + value;
        if (bossMode) {
            gameState.bossStats = gameState.bossStats || { encounters: 0, defeated: 0, escaped: 0, bestValue: 0 };
            gameState.bossStats.defeated = Number(gameState.bossStats.defeated || 0) + 1;
            gameState.bossStats.bestValue = Math.max(Number(gameState.bossStats.bestValue || 0), value);
        }
        recordDailyCatch(fish, value);

        if (!gameState.bestCatch || value > Number(gameState.bestCatch.soldValue || 0)) gameState.bestCatch = fish;

        addGold(value);
        addExp(Math.round(Number(species.exp || 50) * (1 + stats.expBonus) * (bossMode ? 1.18 : 1)));
        checkAchievements();

        status.innerHTML = bossMode
            ? `<span class="text-amber-200 font-extrabold">👑 ${fish.emoji} ${escapeHTML(fish.name)} 토벌 성공!</span>`
            : `<span style="color:${rarity.color}" class="font-extrabold">${fish.emoji} ${escapeHTML(fish.name)} 포획!</span>`;
        if (bossMode) createBossVictoryBurst();
        createBigConfetti();

        setTimeout(() => {
            showToast(`${fish.emoji} ${fish.name} 획득! ${bossMode ? '보스 · ' : ''}${rarity.name} · +${value.toLocaleString()} 골드`, bossMode ? '👑' : getRod().emoji, 3800);
            gameState.pendingFish = null;
            resetBossVisuals();
            castBtn.style.display = 'flex';
            status.textContent = '물고기를 기다리는 중...';
        }, 850);
    } else {
        haptic(80);
        playSound('fail');
        if (bossMode) {
            gameState.bossStats = gameState.bossStats || { encounters: 0, defeated: 0, escaped: 0, bestValue: 0 };
            gameState.bossStats.escaped = Number(gameState.bossStats.escaped || 0) + 1;
        }
        gameState.pendingFish = null;
        status.textContent = bossMode ? '보스가 균열 속으로 사라졌어요...' : '줄이 끊어졌어요...';
        setTimeout(() => { resetBossVisuals(); castBtn.style.display = 'flex'; status.textContent = '물고기를 기다리는 중...'; }, bossMode ? 1700 : 1400);
    }
    renderBossQuickPanel();
    savePlayerData();
}

function createBigConfetti() {
    if (graphicsMode === 'low' || reduceMotion) return;
    const visual = document.getElementById('fishing-visual');
    const colors = ['#fbbf24', '#f43f5e', '#a855f7', '#38bdf8'];
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.style.position = 'absolute'; p.style.width = p.style.height = '6px';
        p.style.background = colors[Math.floor(Math.random()*colors.length)];
        p.style.left = (28 + Math.random()*50) + '%'; p.style.bottom = '32%'; p.style.zIndex = '50';
        visual.appendChild(p);
        const angle = (Math.random()-0.5)*110;
        p.animate([
            { transform: 'translateY(0) rotate(0)', opacity:1 },
            { transform: `translateY(-${100+Math.random()*80}px) translateX(${angle}px) rotate(${angle*2}deg)`, opacity:0 }
        ], { duration: 850 + Math.random()*650, easing:'ease-out' }).onfinish = () => p.remove();
    }
}

function addGold(v){ gameState.gold += v; updateUI(); }
function addExp(v){ gameState.exp += v; while(gameState.exp >= gameState.expToNext){ gameState.exp -= gameState.expToNext; gameState.level++; gameState.expToNext = Math.floor(gameState.expToNext*1.22); } updateUI(); checkAchievements(); }

// ==================== 장비 공방 ====================
function renderEquipment() {
    const summary = document.getElementById('equipment-summary');
    const forgePanel = document.getElementById('forge-panel');
    const rodList = document.getElementById('rod-list');
    const baitList = document.getElementById('bait-list');
    if (!summary || !rodList || !baitList) return;
    ensureUsableBait();
    const rod = getRod();
    const bait = getBait();
    const stats = getEquipmentStats();
    summary.innerHTML = `
        <div class="flex items-start justify-between gap-4">
            <div>
                <div class="text-[11px] text-cyan-100/70 font-bold">CURRENT LOADOUT</div>
                <div class="text-2xl font-black tracking-tight mt-1">${escapeHTML(rod.emoji)} ${escapeHTML(rod.name)} <span class="text-amber-300">+${getRodEnhanceLevel(rod.id)}</span></div>
                <div class="text-sm text-white/70 mt-1">${escapeHTML(bait.emoji)} ${escapeHTML(bait.name)} 장착 중 · 전투력 ${Number(stats.equipmentScore || 0).toLocaleString()}</div>
            </div>
            <div class="text-right">
                <div class="text-[11px] text-white/45">보유 골드</div>
                <div class="font-mono text-amber-300 font-black text-xl">${Number(gameState.gold || 0).toLocaleString()}</div>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div class="stat-pill rounded-2xl p-3"><div class="text-white/45">릴 파워</div><div class="font-black text-cyan-200">+${formatPercent(stats.powerBonus)}</div></div>
            <div class="stat-pill rounded-2xl p-3"><div class="text-white/45">장력 제어</div><div class="font-black text-emerald-200">+${formatPercent(stats.tensionControl)}</div></div>
            <div class="stat-pill rounded-2xl p-3"><div class="text-white/45">희귀 기운</div><div class="font-black text-fuchsia-200">+${formatPercent(stats.rarityBoost)}</div></div>
            <div class="stat-pill rounded-2xl p-3"><div class="text-white/45">판매/경험</div><div class="font-black text-amber-200">+${formatPercent(stats.valueBonus)} / +${formatPercent(stats.expBonus)}</div></div>
        </div>`;

    renderForgePanel(forgePanel);

    rodList.innerHTML = '';
    RODS.forEach((item) => {
        const owned = isRodOwned(item.id);
        const equipped = getRod().id === item.id;
        const level = getRodEnhanceLevel(item.id);
        const enhanceCost = getEnhanceCost(item.id);
        const successRate = getEnhanceSuccessRate(item.id);
        const canBuy = Number(gameState.gold || 0) >= Number(item.cost || 0);
        const div = document.createElement('div');
        div.className = `premium-card premium-glass rounded-3xl p-4 ${equipped ? 'equipped-ring' : ''}`;
        div.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="text-4xl">${escapeHTML(item.emoji)}</div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between gap-2">
                        <div><div class="text-[10px] text-cyan-200/70 font-black">${escapeHTML(item.tier)}</div><div class="font-black text-lg truncate">${escapeHTML(item.name)} <span class="text-amber-300">+${level}</span></div></div>
                        <div class="text-right text-amber-300 font-mono font-black">${owned ? `강화 ${level}/${ENHANCE_MAX_LEVEL}` : Number(item.cost || 0).toLocaleString()}</div>
                    </div>
                    <div class="text-xs text-white/58 mt-1">${escapeHTML(item.desc)}</div>
                    <div class="grid grid-cols-2 gap-1.5 mt-3 text-[11px] text-white/75">
                        <div>릴 +${formatPercent(item.powerBonus)}</div><div>희귀 +${formatPercent(item.rarityBoost)}</div>
                        <div>장력 +${Number(item.tensionRelief || 0).toFixed(1)}</div><div>판매 +${formatPercent(item.valueBonus)}</div>
                    </div>
                    <div class="grid ${owned ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mt-3">
                        <button onclick="${owned ? `equipRod('${item.id}')` : `buyRod('${item.id}')`}" class="py-2 rounded-2xl text-sm font-extrabold ${equipped ? 'bg-emerald-400/20 text-emerald-200' : canBuy || owned ? 'bg-sky-400/20 text-sky-100' : 'bg-white/10 text-white/40'}">${equipped ? '장착 중' : owned ? '장착하기' : '구매하기'}</button>
                        ${owned ? `<button onclick="enhanceRod('${item.id}')" class="py-2 rounded-2xl text-sm font-extrabold ${level >= ENHANCE_MAX_LEVEL ? 'bg-amber-400/20 text-amber-100' : Number(gameState.gold || 0) >= enhanceCost ? 'bg-amber-400/20 text-amber-100' : 'bg-white/10 text-white/40'}">${level >= ENHANCE_MAX_LEVEL ? 'MAX' : `강화 ${enhanceCost.toLocaleString()} · ${Math.round(successRate*100)}%`}</button>` : ''}
                    </div>
                </div>
            </div>`;
        rodList.appendChild(div);
    });

    baitList.innerHTML = '';
    BAITS.forEach((item) => {
        const count = getBaitCount(item.id);
        const equipped = getBait().id === item.id;
        const canBuy = item.id === 'basic_bait' || Number(gameState.gold || 0) >= Number(item.cost || 0);
        const div = document.createElement('div');
        div.className = `premium-card premium-glass rounded-3xl p-4 ${equipped ? 'equipped-ring' : ''}`;
        div.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="text-4xl">${escapeHTML(item.emoji)}</div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between gap-2">
                        <div><div class="text-[10px] text-cyan-200/70 font-black">${escapeHTML(item.tier)}</div><div class="font-black text-lg truncate">${escapeHTML(item.name)}</div></div>
                        <div class="text-right"><div class="font-mono text-amber-300 font-black">${item.id === 'basic_bait' ? 'FREE' : Number(item.cost || 0).toLocaleString()}</div><div class="text-[10px] text-white/50">보유 ${item.id === 'basic_bait' ? '∞' : count}</div></div>
                    </div>
                    <div class="text-xs text-white/58 mt-1">${escapeHTML(item.desc)}</div>
                    <div class="grid grid-cols-2 gap-1.5 mt-3 text-[11px] text-white/75">
                        <div>입질 -${formatPercent(item.biteSpeed)}</div><div>희귀 +${formatPercent(item.rarityBoost)}</div>
                        <div>판매 +${formatPercent(item.valueBonus)}</div><div>경험 +${formatPercent(item.expBonus)}</div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mt-3">
                        <button onclick="equipBait('${item.id}')" class="py-2 rounded-2xl text-sm font-extrabold ${equipped ? 'bg-emerald-400/20 text-emerald-200' : count > 0 || item.id === 'basic_bait' ? 'bg-sky-400/20 text-sky-100' : 'bg-white/10 text-white/40'}">${equipped ? '장착 중' : '장착'}</button>
                        <button onclick="buyBait('${item.id}')" class="py-2 rounded-2xl text-sm font-extrabold ${canBuy && item.id !== 'basic_bait' ? 'bg-amber-400/20 text-amber-100' : 'bg-white/10 text-white/40'}">${item.id === 'basic_bait' ? '무제한' : `x${item.pack} 구매`}</button>
                    </div>
                </div>
            </div>`;
        baitList.appendChild(div);
    });
    updateUI();
}


function renderForgePanel(panel) {
    if (!panel) return;
    const rod = getRod();
    const level = getRodEnhanceLevel(rod.id);
    const cost = getEnhanceCost(rod.id);
    const successRate = getEnhanceSuccessRate(rod.id);
    const isMax = level >= ENHANCE_MAX_LEVEL;
    const canPay = Number(gameState.gold || 0) >= cost;
    const spentRatio = getEconomyHealthRatio();
    panel.innerHTML = `
        <div class="relative z-10 flex items-start gap-4">
            <div class="forge-core text-4xl shrink-0">⚒️</div>
            <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <div class="text-[11px] text-amber-100/75 font-black tracking-wide">FORGE UPGRADE LAB</div>
                        <div class="text-2xl font-black tracking-tight mt-0.5">${escapeHTML(rod.name)} <span class="text-amber-300">+${level}</span></div>
                        <div class="text-xs text-white/60 mt-1">강화는 릴 파워·장력 제어·희귀 기운·판매가에 직접 반영됩니다.</div>
                    </div>
                    <div class="upgrade-level-pill rounded-2xl px-3 py-2 text-right shrink-0">
                        <div class="text-[10px] text-white/55">성공률</div>
                        <div class="font-mono font-black text-amber-200">${isMax ? 'MAX' : Math.round(successRate * 100) + '%'}</div>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-2 mt-4 text-[11px]">
                    <div class="enhance-chip rounded-2xl p-3"><div class="text-white/45">다음 비용</div><div class="font-mono font-black text-amber-200">${isMax ? '완료' : cost.toLocaleString()}</div></div>
                    <div class="enhance-chip rounded-2xl p-3"><div class="text-white/45">강화 투자</div><div class="font-mono font-black text-cyan-200">${Number(gameState.economy?.upgradeSpent || 0).toLocaleString()}</div></div>
                    <div class="enhance-chip rounded-2xl p-3"><div class="text-white/45">성공/시도</div><div class="font-mono font-black text-emerald-200">${Number(gameState.economy?.enhancementSuccess || 0)}/${Number(gameState.economy?.enhancementAttempts || 0)}</div></div>
                </div>
                <div class="mt-4">
                    <div class="flex justify-between text-[10px] text-white/50 mb-1"><span>성장 투자율</span><span>${Math.round(spentRatio)}%</span></div>
                    <div class="economy-meter"><span style="width:${spentRatio}%"></span></div>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-4">
                    <button onclick="enhanceRod('${rod.id}')" class="py-3 rounded-2xl font-extrabold text-sm ${isMax ? 'bg-amber-400/20 text-amber-100' : canPay ? 'bg-amber-400/20 text-amber-100' : 'bg-white/10 text-white/40'}">${isMax ? '최대 강화 완료' : '현재 낚싯대 강화'}</button>
                    <button onclick="rebalanceEconomyHint()" class="py-3 rounded-2xl font-extrabold text-sm bg-cyan-300/12 text-cyan-100 border border-cyan-200/15">성장 추천</button>
                </div>
            </div>
        </div>`;
}

function createForgeBurst(success = true) {
    const panel = document.getElementById('forge-panel');
    if (!panel || reduceMotion) return;
    const rect = panel.getBoundingClientRect();
    const colors = success ? ['#fde047','#22d3ee','#a78bfa','#34d399'] : ['#94a3b8','#38bdf8','#ffffff'];
    const count = graphicsMode === 'low' ? 10 : 28;
    for (let i = 0; i < count; i++) {
        const spark = document.createElement('div');
        spark.className = 'forge-spark';
        spark.style.left = (rect.width * (.18 + Math.random() * .58)) + 'px';
        spark.style.top = (rect.height * (.16 + Math.random() * .36)) + 'px';
        spark.style.background = colors[Math.floor(Math.random() * colors.length)];
        panel.appendChild(spark);
        const x = (Math.random() - .5) * (success ? 220 : 110);
        const y = -(40 + Math.random() * (success ? 150 : 72));
        spark.animate([
            { transform:'translate(0,0) scale(1)', opacity:1 },
            { transform:`translate(${x}px, ${y}px) scale(${success ? .22 : .12})`, opacity:0 }
        ], { duration: success ? 980 + Math.random() * 520 : 520 + Math.random() * 260, easing:'cubic-bezier(.16,.9,.2,1)' }).onfinish = () => spark.remove();
    }
}

function enhanceRod(id = gameState.equipment?.rod) {
    const rod = getRod(id);
    if (!isRodOwned(rod.id)) return buyRod(rod.id);
    const level = getRodEnhanceLevel(rod.id);
    if (level >= ENHANCE_MAX_LEVEL) {
        showToast(`${rod.name}은 이미 최대 강화입니다`, '🏆');
        return;
    }
    const cost = getEnhanceCost(rod.id);
    if (Number(gameState.gold || 0) < cost) {
        showToast(`강화 비용 ${cost.toLocaleString()}골드가 필요합니다`, '💰');
        return;
    }
    gameState.gold -= cost;
    gameState.economy = gameState.economy || {};
    gameState.economy.upgradeSpent = Number(gameState.economy.upgradeSpent || 0) + cost;
    gameState.economy.enhancementAttempts = Number(gameState.economy.enhancementAttempts || 0) + 1;
    const successRate = getEnhanceSuccessRate(rod.id);
    const success = Math.random() < successRate;
    if (success) {
        gameState.rodEnhance[rod.id] = level + 1;
        gameState.economy.enhancementSuccess = Number(gameState.economy.enhancementSuccess || 0) + 1;
        gameState.economy.enhancePity = 0;
        gameState.economy.lastUpgradeAt = new Date().toISOString();
        haptic([24, 35, 24]);
        playSound('upgrade');
        showToast(`${rod.emoji} ${rod.name} +${level + 1} 강화 성공!`, '🔥', 3200);
    } else {
        gameState.economy.enhancePity = clamp(Number(gameState.economy.enhancePity || 0) + 1, 0, ENHANCE_SOFT_PITY);
        haptic(38);
        playSound('fail');
        showToast('강화 실패. 장비는 파괴되지 않고 다음 성공률이 보정됩니다', '💦', 3400);
    }
    updateUI();
    renderEquipment();
    createForgeBurst(success);
    checkAchievements();
    savePlayerData();
}

function autoEnhanceEquippedRod() {
    const rod = getRod();
    const level = getRodEnhanceLevel(rod.id);
    if (level >= ENHANCE_MAX_LEVEL) return showToast('현재 낚싯대는 최대 강화입니다', '🏆');
    const cost = getEnhanceCost(rod.id);
    if (Number(gameState.gold || 0) < cost) return rebalanceEconomyHint();
    enhanceRod(rod.id);
}

function rebalanceEconomyHint() {
    const rod = getRod();
    const cost = getEnhanceCost(rod.id);
    const missing = Math.max(0, cost - Number(gameState.gold || 0));
    if (missing > 0) showToast(`강화까지 ${missing.toLocaleString()}골드 부족. 데일리 미션과 전체 판매를 먼저 추천!`, '🗓️', 3600);
    else showToast('지금은 현재 낚싯대를 강화하는 효율이 가장 좋습니다', '⚒️', 3000);
}

function buyRod(id) {
    const rod = getRod(id);
    if (isRodOwned(id)) return equipRod(id);
    if (Number(gameState.gold || 0) < Number(rod.cost || 0)) {
        showToast('골드가 부족합니다', '💰');
        return;
    }
    gameState.gold -= Number(rod.cost || 0);
    gameState.economy = gameState.economy || {};
    gameState.economy.upgradeSpent = Number(gameState.economy.upgradeSpent || 0) + Number(rod.cost || 0);
    gameState.ownedRods.push(id);
    gameState.rodEnhance[id] = getRodEnhanceLevel(id);
    gameState.equipment.rod = id;
    showToast(`${rod.emoji} ${rod.name} 구매 및 장착!`, '🧰');
    checkAchievements();
    updateUI();
    renderEquipment();
    savePlayerData();
}

function equipRod(id) {
    if (!isRodOwned(id)) return buyRod(id);
    gameState.equipment.rod = id;
    showToast(`${getRod(id).name} 장착`, getRod(id).emoji);
    checkAchievements();
    updateUI();
    renderEquipment();
    savePlayerData();
}

function buyBait(id) {
    const bait = getBait(id);
    if (bait.id === 'basic_bait') return equipBait('basic_bait');
    if (Number(gameState.gold || 0) < Number(bait.cost || 0)) {
        showToast('골드가 부족합니다', '💰');
        return;
    }
    gameState.gold -= Number(bait.cost || 0);
    gameState.economy = gameState.economy || {};
    gameState.economy.upgradeSpent = Number(gameState.economy.upgradeSpent || 0) + Number(bait.cost || 0);
    gameState.baitInventory[bait.id] = getBaitCount(bait.id) + Number(bait.pack || 1);
    gameState.equipment.bait = bait.id;
    showToast(`${bait.emoji} ${bait.name} ${bait.pack}개 구매`, '🪱');
    updateUI();
    renderEquipment();
    savePlayerData();
}

function equipBait(id) {
    const bait = getBait(id);
    if (bait.id !== 'basic_bait' && getBaitCount(bait.id) <= 0) {
        showToast('보유 미끼가 없습니다. 먼저 구매해주세요', '🪱');
        return;
    }
    gameState.equipment.bait = bait.id;
    showToast(`${bait.emoji} ${bait.name} 장착`, '🪱');
    updateUI();
    renderEquipment();
    savePlayerData();
}

function buyBestAffordableRod() {
    const next = RODS.filter((rod) => !isRodOwned(rod.id) && Number(gameState.gold || 0) >= Number(rod.cost || 0)).pop();
    if (!next) {
        showToast('지금 구매 가능한 새 낚싯대가 없습니다', '✨');
        return;
    }
    buyRod(next.id);
}

function buyStarterBaitPack() {
    const best = [...BAITS].reverse().find((bait) => bait.id !== 'basic_bait' && Number(gameState.gold || 0) >= Number(bait.cost || 0)) || BAITS.find((bait) => bait.id === 'glow_bait');
    buyBait(best.id);
}

// ==================== 인벤토리 ====================
function renderInventory() {
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = '';
    if (!gameState.inventory.length) {
        grid.innerHTML = `<div class="col-span-2 premium-glass p-5 rounded-2xl text-sm text-white/70">아직 가방에 물고기가 없습니다. 낚시터에서 첫 어종을 잡아보세요.</div>`;
        return;
    }
    gameState.inventory.slice().reverse().forEach((item, idx) => {
        const originalIdx = gameState.inventory.length - 1 - idx;
        const div = document.createElement('div');
        div.className = `premium-card premium-glass p-4 rounded-2xl`;
        div.innerHTML = `
            <div class="flex items-start justify-between gap-2">
                <div class="text-3xl">${escapeHTML(item.emoji || '🐟')}</div>
                ${rarityBadge(item.rarity || 1)}
            </div>
            <div class="font-extrabold mt-2">${item.boss ? '👑 ' : ''}${escapeHTML(item.name)}</div>
            <div class="text-xs text-white/50">${escapeHTML(item.region)}${item.boss ? ' · BOSS' : ''}</div>
            <div class="mt-3 flex justify-between items-center gap-2">
                <div class="text-amber-400 font-mono font-bold text-sm">${Number(item.soldValue || 0).toLocaleString()} 골드</div>
                <button onclick="sellFish(${originalIdx}, this)" class="text-xs px-4 py-1 bg-white/10 rounded-xl">판매</button>
            </div>`;
        grid.appendChild(div);
    });
}

function sellFish(idx, el) {
    const fish = gameState.inventory[idx];
    if (!fish) return;
    addGold(Number(fish.soldValue || 0));
    gameState.inventory.splice(idx, 1);
    el?.closest('.premium-card')?.remove();
    renderInventory();
    savePlayerData();
}

function sellAll() {
    if (!gameState.inventory.length) {
        alert('판매할 물고기가 없습니다.');
        return;
    }
    let total = 0;
    gameState.inventory.forEach(f => total += Number(f.soldValue || 0));
    addGold(total);
    gameState.inventory = [];
    renderInventory();
    savePlayerData();
    alert(`${total.toLocaleString()} 골드를 획득했습니다!`);
}

// ==================== 기록 ====================
function renderRecord() {
    document.getElementById('stat-total-catch').textContent = gameState.totalCaught || 0;
    document.getElementById('stat-total-gold').textContent = (gameState.totalGoldEarned || 0).toLocaleString() + ' 골드';
    document.getElementById('stat-best-fish').textContent = gameState.bestCatch ? `${gameState.bestCatch.emoji || '🐟'} ${gameState.bestCatch.name} (${Number(gameState.bestCatch.soldValue || 0).toLocaleString()}골드)` : '-';

    const list = document.getElementById('record-list');
    list.innerHTML = '';
    if (!gameState.catchHistory || gameState.catchHistory.length === 0) {
        list.innerHTML = `<div class="text-white/50 text-sm">아직 잡은 물고기가 없습니다.</div>`;
        return;
    }
    gameState.catchHistory.slice(0, 12).forEach(fish => {
        const div = document.createElement('div');
        div.className = `flex justify-between items-center p-3 bg-white/5 rounded-2xl gap-3`;
        const time = new Date(fish.caughtAt).toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'});
        div.innerHTML = `<div class="flex items-center gap-3 min-w-0"><div class="text-2xl">${escapeHTML(fish.emoji || '🐟')}</div><div class="min-w-0"><div class="font-bold truncate">${fish.boss ? '👑 ' : ''}${escapeHTML(fish.name)}</div><div class="text-xs text-white/50">${escapeHTML(fish.region)}${fish.boss ? ' · BOSS' : ''} • ${time}</div></div></div><div class="text-right shrink-0"><div>${rarityBadge(fish.rarity || 1)}</div><div class="font-mono text-amber-400 font-bold mt-1">${Number(fish.soldValue || 0).toLocaleString()} 골드</div></div>`;
        list.appendChild(div);
    });
}

// ==================== 경쟁 ====================
function renderSeasonRankingPanel() {
    const panel = document.getElementById('season-ranking-panel');
    if (!panel) return;
    const score = getSeasonScore();
    const tier = getRankTier(score);
    const seasonKey = getSeasonKey();
    gameState.seasonRank = gameState.seasonRank || { seasonKey, bestScore: 0, submittedAt: '' };
    gameState.seasonRank.seasonKey = seasonKey;
    gameState.seasonRank.bestScore = Math.max(Number(gameState.seasonRank.bestScore || 0), score);
    panel.innerHTML = `
        <div class="relative z-10 flex items-center gap-4">
            <div class="rank-trophy text-4xl">${escapeHTML(tier.emoji)}</div>
            <div class="flex-1 min-w-0">
                <div class="text-[11px] text-cyan-100/70 font-black tracking-wide">${escapeHTML(seasonKey)} SEASON</div>
                <div class="font-black text-2xl tracking-tight ${tier.color}">${escapeHTML(tier.name)}</div>
                <div class="text-xs text-white/55 mt-1">시즌 점수 ${score.toLocaleString()} · 장비 점수 ${getEquipmentScore().toLocaleString()}</div>
                <div class="mt-3 boss-meter"><span style="width:${clamp(score / 120000 * 100, 6, 100)}%"></span></div>
            </div>
        </div>`;
}

function renderLeaderboardRow(entry, index, mode = 'gold') {
    const isMe = entry.name === gameState.nickname;
    const div = document.createElement('div');
    div.className = `rank-row ${isMe ? 'me' : ''} ${index === 0 ? 'top-1' : ''} rounded-2xl p-3 flex justify-between items-center gap-3`;
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : String(index + 1);
    const score = mode === 'boss'
        ? `${Number(entry.bossDefeated || 0).toLocaleString()}승 · ${Number(entry.bossBestValue || 0).toLocaleString()}G`
        : `${Number(entry.score || 0).toLocaleString()}점`;
    div.innerHTML = `<div class="flex items-center gap-3 min-w-0"><div class="w-8 h-8 grid place-items-center rounded-xl bg-white/10 font-black text-sm shrink-0">${escapeHTML(medal)}</div><div class="min-w-0"><div class="font-black truncate">${escapeHTML(entry.name || '낚시꾼')}</div><div class="text-[11px] text-white/45">Lv.${Number(entry.level || 1)} · ${mode === 'boss' ? 'Boss Rift' : 'Season Score'}</div></div></div><div class="font-mono font-black text-amber-300 text-right shrink-0">${score}</div>`;
    return div;
}

// ==================== 경쟁 ====================
function renderCompetition() {
    const today = document.getElementById('today-best');
    if (today) today.textContent = (gameState.todayBest || 0).toLocaleString() + ' 골드';
    const bossBest = document.getElementById('boss-best-value');
    const bossCount = document.getElementById('boss-defeat-count');
    if (bossBest) bossBest.textContent = Number(gameState.bossStats?.bestValue || 0).toLocaleString() + ' 골드';
    if (bossCount) bossCount.textContent = Number(gameState.bossStats?.defeated || 0).toLocaleString();
    renderSeasonRankingPanel();
    renderDeployActionsPanel();

    const board = document.getElementById('leaderboard');
    if (board) {
        board.innerHTML = '';
        if (!Array.isArray(gameState.leaderboard) || gameState.leaderboard.length === 0) gameState.leaderboard = getLocalLeaderboardFallback();
        const myScore = getSeasonScore();
        let myEntry = gameState.leaderboard.find(e => e.name === gameState.nickname);
        if (!myEntry) { myEntry = { name: gameState.nickname, score: myScore, level: Number(gameState.level || 1) }; gameState.leaderboard.push(myEntry); }
        myEntry.score = Math.max(Number(myEntry.score || 0), myScore);
        myEntry.level = Number(gameState.level || 1);
        gameState.leaderboard.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
        gameState.leaderboard.slice(0, 8).forEach((entry, index) => board.appendChild(renderLeaderboardRow(entry, index, 'gold')));
    }

    const bossBoard = document.getElementById('boss-leaderboard');
    if (bossBoard) {
        bossBoard.innerHTML = '';
        if (!Array.isArray(gameState.bossLeaderboard) || gameState.bossLeaderboard.length === 0) gameState.bossLeaderboard = getBossLeaderboardFallback();
        let myBoss = gameState.bossLeaderboard.find(e => e.name === gameState.nickname);
        if (!myBoss) { myBoss = { name: gameState.nickname, bossDefeated: 0, bossBestValue: 0, level: Number(gameState.level || 1) }; gameState.bossLeaderboard.push(myBoss); }
        myBoss.bossDefeated = Math.max(Number(myBoss.bossDefeated || 0), Number(gameState.bossStats?.defeated || 0));
        myBoss.bossBestValue = Math.max(Number(myBoss.bossBestValue || 0), Number(gameState.bossStats?.bestValue || 0));
        myBoss.level = Number(gameState.level || 1);
        gameState.bossLeaderboard.sort((a, b) => (Number(b.bossDefeated || 0) - Number(a.bossDefeated || 0)) || (Number(b.bossBestValue || 0) - Number(a.bossBestValue || 0)));
        gameState.bossLeaderboard.slice(0, 8).forEach((entry, index) => bossBoard.appendChild(renderLeaderboardRow(entry, index, 'boss')));
    }
}

function refreshCompetitionBoards() {
    renderCompetition();
    showToast('랭킹 보드를 새로고침했습니다', '🔄');
}

function updateTodayBest() {
    const newBest = Math.max(gameState.todayBest || 0, gameState.gold);
    const seasonScore = getSeasonScore();
    gameState.todayBest = newBest;
    
    let myEntry = gameState.leaderboard.find(e => e.name === gameState.nickname);
    if (!myEntry) { myEntry = { name: gameState.nickname, score: 0 }; gameState.leaderboard.push(myEntry); }
    myEntry.score = Math.max(Number(myEntry.score || 0), newBest, seasonScore);
    
    renderCompetition();
    savePlayerData();
    alert(`오늘의 최고 기록이 ${newBest.toLocaleString()} 골드로 갱신되었습니다!`);
}

async function submitToGlobalLeaderboard() {
    if (!isFirebaseConnected || !gameState.userId) {
        alert("Firebase에 연결되어 있지 않습니다. 로그인 후 다시 시도해주세요.");
        return;
    }
    try {
        const fb = await waitForFirebase();
        const score = getSeasonScore();
        gameState.todayBest = Math.max(Number(gameState.todayBest || 0), Number(gameState.gold || 0));
        gameState.seasonRank = { seasonKey: getSeasonKey(), bestScore: Math.max(Number(gameState.seasonRank?.bestScore || 0), score), submittedAt: new Date().toISOString() };
        await fb.setDoc(fb.doc(fb.db, 'leaderboard', gameState.userId), {
            uid: gameState.userId,
            name: sanitizeNickname(gameState.nickname),
            score,
            level: Number(gameState.level || 1),
            seasonKey: getSeasonKey(),
            equipmentScore: getEquipmentScore(),
            bossDefeated: Number(gameState.bossStats?.defeated || 0),
            updatedAt: fb.serverTimestamp()
        }, { merge: true });
        await submitBossLeaderboard(true);
        renderCompetition();
        savePlayerData();
        alert("글로벌 시즌 리더보드에 제출되었습니다!");
    } catch(e) {
        console.error(e);
        alert("제출 중 오류가 발생했습니다: " + e.message);
    }
}

async function submitBossLeaderboard(silent = false) {
    if (!isFirebaseConnected || !gameState.userId) {
        if (!silent) alert("Firebase에 연결되어 있지 않습니다. 로그인 후 다시 시도해주세요.");
        return;
    }
    try {
        const fb = await waitForFirebase();
        await fb.setDoc(fb.doc(fb.db, 'bossLeaderboard', gameState.userId), {
            uid: gameState.userId,
            name: sanitizeNickname(gameState.nickname),
            bossDefeated: Number(gameState.bossStats?.defeated || 0),
            bossBestValue: Number(gameState.bossStats?.bestValue || 0),
            level: Number(gameState.level || 1),
            seasonKey: getSeasonKey(),
            updatedAt: fb.serverTimestamp()
        }, { merge: true });
        if (!silent) {
            renderCompetition();
            savePlayerData();
            alert("보스 토벌 랭킹에 제출되었습니다!");
        }
    } catch(e) {
        console.error(e);
        if (!silent) alert("보스 랭킹 제출 중 오류가 발생했습니다: " + e.message);
    }
}


// ==================== 업적 시스템 (NEW) ====================
const ACHIEVEMENTS = [
    { id: 'first_catch', name: '첫 낚시 성공', desc: '첫 물고기를 잡으세요', check: (s) => s.totalCaught >= 1 },
    { id: 'ten_catches', name: '열 마리 사냥꾼', desc: '총 10마리 이상 잡기', check: (s) => s.totalCaught >= 10 },
    { id: 'collector_10', name: '도감 수집가', desc: '서로 다른 어종 10종 발견', check: () => getDiscoveredSpeciesCount() >= 10 },
    { id: 'hero_catcher', name: '영웅 어종 포획', desc: '영웅 등급 이상 어종 잡기', check: (s) => s.bestCatch && Number(s.bestCatch.rarity || 1) >= 4 },
    { id: 'mythic_catcher', name: '신화의 낚시꾼', desc: '신화 등급 어종 잡기', check: (s) => Array.isArray(s.catchHistory) && s.catchHistory.some(f => Number(f.rarity || 1) >= 6) },
    { id: 'rich_fisher', name: '부유한 낚시꾼', desc: '총 5,000 골드 이상 벌기', check: (s) => (s.totalGoldEarned || 0) >= 5000 },
    { id: 'legend_catcher', name: '전설의 낚시꾼', desc: '최고 가치 3,000골드 이상 물고기 잡기', check: (s) => s.bestCatch && Number(s.bestCatch.soldValue || 0) >= 3000 },
    { id: 'gear_owner', name: '장비 수집 입문', desc: '낚싯대 2종 이상 보유', check: (s) => Array.isArray(s.ownedRods) && s.ownedRods.length >= 2 },
    { id: 'forge_5', name: '공방의 불꽃', desc: '낚싯대 하나를 +5 이상 강화', check: (s) => s.rodEnhance && Object.values(s.rodEnhance).some(v => Number(v || 0) >= 5) },
    { id: 'master_forge', name: '마스터 포지', desc: '낚싯대 하나를 +10까지 강화', check: (s) => s.rodEnhance && Object.values(s.rodEnhance).some(v => Number(v || 0) >= 10) },
    { id: 'dragon_loadout', name: '용의 장비', desc: '용린 낚싯대 장착', check: (s) => s.equipment && s.equipment.rod === 'dragon_rod' },
    { id: 'season_ranker', name: '시즌 랭커', desc: '시즌 점수 20,000점 이상 달성', check: () => getSeasonScore() >= 20000 },
    { id: 'actions_ready', name: '자동 배포 선장', desc: 'v2.0 자동 배포 패치 접속', check: () => APP_VERSION === '2.0.0' },
    { id: 'boss_first_win', name: '대어 토벌자', desc: '보스 어종 1마리 포획', check: (s) => Number(s.bossStats?.defeated || 0) >= 1 },
    { id: 'boss_master', name: '균열의 정복자', desc: '보스 어종 3마리 포획', check: (s) => Number(s.bossStats?.defeated || 0) >= 3 }
];

function checkAchievements() {
    let unlocked = false;
    ACHIEVEMENTS.forEach(ach => {
        if (!gameState.achievements[ach.id] && ach.check(gameState)) {
            gameState.achievements[ach.id] = { unlockedAt: new Date().toISOString() };
            unlocked = true;
            showToast(`업적 달성: ${ach.name}`, '🏅', 3200);
        }
    });
    if (unlocked) savePlayerData();
}

function renderAchievements() {
    const list = document.getElementById('achievements-list');
    list.innerHTML = '';
    
    ACHIEVEMENTS.forEach(ach => {
        const unlocked = gameState.achievements[ach.id];
        const div = document.createElement('div');
        div.className = `premium-glass p-4 rounded-2xl flex items-center gap-x-4 ${unlocked ? 'border border-emerald-400/50' : 'opacity-60'}`;
        div.innerHTML = `
            <div class="text-3xl">${unlocked ? '🏅' : '🔒'}</div>
            <div class="flex-1">
                <div class="font-extrabold">${ach.name}</div>
                <div class="text-xs text-white/60">${ach.desc}</div>
                ${unlocked ? `<div class="text-[10px] text-emerald-400 mt-1">달성: ${new Date(unlocked.unlockedAt).toLocaleDateString('ko-KR')}</div>` : ''}
            </div>
        `;
        list.appendChild(div);
    });
}

// ==================== 도감 ====================
function renderEncyclopedia() {
    const list = document.getElementById('enc-list');
    const keyword = document.getElementById('search-box')?.value?.trim().toLowerCase() || '';
    const discoveredCount = getDiscoveredSpeciesCount();
    const filtered = FISH_DATABASE.filter((fish) => {
        const text = `${fish.name} ${fish.region} ${getRarityConfig(fish.rarity).name}`.toLowerCase();
        return !keyword || text.includes(keyword);
    });

    list.innerHTML = `
        <div class="premium-glass p-4 rounded-2xl text-sm mb-3">
            <div class="flex justify-between items-center">
                <div class="font-extrabold">도감 진행도</div>
                <div class="font-mono text-sky-300">${discoveredCount}/${FISH_DATABASE.length}</div>
            </div>
            <div class="text-xs text-white/50 mt-1">${fishDataLoaded ? 'data/fish.json 연결됨' : '내장 어종 데이터 사용 중'} · 지역별 확률 적용</div>
        </div>`;

    if (!filtered.length) {
        list.innerHTML += `<div class="text-white/50 text-sm">검색 결과가 없습니다.</div>`;
        return;
    }

    filtered.forEach((fish) => {
        const unlocked = gameState.discovered instanceof Set && gameState.discovered.has(fish.id);
        const div = document.createElement('div');
        div.className = `premium-glass p-4 rounded-2xl flex items-center gap-3 ${unlocked ? '' : 'opacity-60'}`;
        div.innerHTML = `
            <div class="text-3xl shrink-0">${unlocked ? escapeHTML(fish.emoji || '🐟') : '❔'}</div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                    <div class="font-extrabold truncate">${unlocked ? escapeHTML(fish.name) : '미발견 어종'}</div>
                    ${rarityBadge(fish.rarity)}
                    ${fish.boss ? '<span class="boss-chip inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold text-rose-100">👑 BOSS</span>' : ''}
                </div>
                <div class="text-xs text-white/50 mt-1">${escapeHTML(fish.region)}${fish.boss ? ' · BOSS' : ''} · ${Number(fish.minValue || 0).toLocaleString()}~${Number(fish.maxValue || 0).toLocaleString()} 골드</div>
                <div class="text-xs text-white/60 mt-1">${unlocked ? escapeHTML(fish.desc || '') : '해당 지역에서 낚시에 성공하면 도감이 열립니다.'}</div>
            </div>`;
        list.appendChild(div);
    });
}

// ==================== 기타 ====================
function goFishing() {
    if (!gameState.currentRegion) { switchScreen('village'); alert('지역을 선택해주세요!'); return; }
    selectRegion(gameState.currentRegion);
}
function exitFishing() {
    clearFishingTimers();
    const visual = document.getElementById('fishing-visual');
    const castBtn = document.getElementById('cast-btn');
    const reel = document.getElementById('reel-game');
    if (gameState.reelInterval) clearInterval(gameState.reelInterval);
    if (visual) visual.onclick = null;
    if (castBtn) castBtn.style.display = 'flex';
    if (reel) reel.classList.add('hidden');
    resetBossVisuals();
    gameState.isFishing = false;
    gameState.currentFish = null;
    gameState.pendingFish = null;
    switchScreen('village');
}

function showCharacterModal() {
    const newName = prompt("닉네임 변경", gameState.nickname);
    if (newName) {
        gameState.nickname = sanitizeNickname(newName);
        updateUI();
        savePlayerData();
        alert(`닉네임이 ${gameState.nickname}(으)로 변경되었습니다.`);
    }
}

// ==================== Firebase Auth + Firestore ====================
async function logoutGame() {
    try {
        if (!confirm('로그아웃할까요? 현재 데이터는 로컬에 저장됩니다.')) return;
        savePlayerData(false);
        if (leaderboardUnsubscribe) {
            leaderboardUnsubscribe();
            leaderboardUnsubscribe = null;
        }
        if (bossLeaderboardUnsubscribe) {
            bossLeaderboardUnsubscribe();
            bossLeaderboardUnsubscribe = null;
        }
        const fb = await waitForFirebase();
        await fb.signOut(fb.auth);
        isFirebaseConnected = false;
        gameState.userId = null;
        setFirebaseStatus('wait', '로그인 필요');
        setCloudSaveStatus('ok', '로컬 저장됨');
        showLoginScreen();
    } catch(e) {
        console.error('Logout error:', e);
        alert('로그아웃 중 오류가 발생했습니다: ' + e.message);
    }
}

function getEmailPassword() {
    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('pw')?.value || '';
    if (!email || !password) throw new Error('이메일과 비밀번호를 입력해주세요.');
    if (password.length < 6) throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
    return { email, password };
}

async function loginAnonymous() {
    try {
        setFirebaseStatus('wait', '로그인 중');
        const fb = await waitForFirebase();
        await fb.signInAnonymously(fb.auth);
    } catch(e) {
        console.error('Anonymous login error:', e);
        setFirebaseStatus('error', 'Firebase 오류');
        alert('익명 로그인 중 오류가 발생했습니다: ' + e.message);
    }
}

async function loginWithEmail() {
    try {
        setFirebaseStatus('wait', '로그인 중');
        const { email, password } = getEmailPassword();
        const fb = await waitForFirebase();
        await fb.signInWithEmailAndPassword(fb.auth, email, password);
    } catch(e) {
        console.error('Email login error:', e);
        setFirebaseStatus('error', 'Firebase 오류');
        alert('이메일 로그인 오류: ' + e.message);
    }
}

async function registerWithEmail() {
    try {
        setFirebaseStatus('wait', '가입 중');
        const { email, password } = getEmailPassword();
        const fb = await waitForFirebase();
        await fb.createUserWithEmailAndPassword(fb.auth, email, password);
    } catch(e) {
        console.error('Email register error:', e);
        setFirebaseStatus('error', 'Firebase 오류');
        alert('회원가입 오류: ' + e.message);
    }
}

async function loginWithGoogle() {
    try {
        setFirebaseStatus('wait', 'Google 로그인');
        const fb = await waitForFirebase();
        await fb.signInWithPopup(fb.auth, fb.googleProvider);
    } catch(e) {
        console.error('Google login error:', e);
        setFirebaseStatus('error', 'Firebase 오류');
        alert('Google 로그인 오류: ' + e.message);
    }
}

function serializeGameState() {
    const plain = { ...gameState };
    plain.nickname = sanitizeNickname(plain.nickname);
    plain.gold = Number(plain.gold || 0);
    plain.level = Number(plain.level || 1);
    plain.discovered = Array.from(gameState.discovered instanceof Set ? gameState.discovered : []);
    delete plain.reelInterval;
    delete plain.currentFish;
    delete plain.pendingFish;
    delete plain.isFishing;
    return plain;
}

function normalizeGameState(data) {
    const next = { ...gameState, ...(data || {}) };
    next.nickname = sanitizeNickname(next.nickname || '여우');
    next.gold = Math.max(0, Number(next.gold || 0));
    next.level = Math.max(1, Number(next.level || 1));
    next.exp = Math.max(0, Number(next.exp || 0));
    next.expToNext = Math.max(100, Number(next.expToNext || 1000));
    if (Array.isArray(next.discovered)) next.discovered = new Set(next.discovered);
    else if (!(next.discovered instanceof Set)) next.discovered = new Set();
    if (!Array.isArray(next.inventory)) next.inventory = [];
    if (!Array.isArray(next.catchHistory)) next.catchHistory = [];
    next.isFishing = false;
    next.currentFish = null;
    next.pendingFish = null;
    if (!Array.isArray(next.leaderboard)) next.leaderboard = [];
    if (!next.achievements || typeof next.achievements !== 'object') next.achievements = {};
    if (!Array.isArray(next.ownedRods)) next.ownedRods = ['starter_rod'];
    if (!next.ownedRods.includes('starter_rod')) next.ownedRods.unshift('starter_rod');
    next.ownedRods = next.ownedRods.filter((id, idx, arr) => RODS.some((rod) => rod.id === id) && arr.indexOf(id) === idx);
    if (!next.rodEnhance || typeof next.rodEnhance !== 'object') next.rodEnhance = { starter_rod: 0 };
    RODS.forEach((rod) => { next.rodEnhance[rod.id] = clamp(Number(next.rodEnhance[rod.id] || 0), 0, ENHANCE_MAX_LEVEL); });
    if (!next.economy || typeof next.economy !== 'object') next.economy = { upgradeSpent: 0, enhancementAttempts: 0, enhancementSuccess: 0, lastUpgradeAt: '' };
    next.economy.upgradeSpent = Math.max(0, Number(next.economy.upgradeSpent || 0));
    next.economy.enhancementAttempts = Math.max(0, Number(next.economy.enhancementAttempts || 0));
    next.economy.enhancementSuccess = Math.max(0, Number(next.economy.enhancementSuccess || 0));
    next.economy.enhancePity = clamp(Number(next.economy.enhancePity || 0), 0, ENHANCE_SOFT_PITY);
    if (!next.baitInventory || typeof next.baitInventory !== 'object') next.baitInventory = { basic_bait: 999999 };
    next.baitInventory.basic_bait = 999999;
    BAITS.forEach((bait) => { next.baitInventory[bait.id] = Math.max(0, Number(next.baitInventory[bait.id] || 0)); });
    if (!next.equipment || typeof next.equipment !== 'object') next.equipment = { rod: 'starter_rod', bait: 'basic_bait' };
    if (!next.ownedRods.includes(next.equipment.rod)) next.equipment.rod = 'starter_rod';
    if (!BAITS.some((bait) => bait.id === next.equipment.bait) || (next.equipment.bait !== 'basic_bait' && Number(next.baitInventory[next.equipment.bait] || 0) <= 0)) next.equipment.bait = 'basic_bait';
    if (!next.daily || typeof next.daily !== 'object') next.daily = { dateKey: '', checkedIn: false, streak: 0, lastCheckIn: '', claimedQuests: {}, stats: { casts: 0, caught: 0, rareCaught: 0, goldEarned: 0 } };
    if (!next.season || typeof next.season !== 'object') next.season = { claimed: {} };
    if (!next.season.claimed || typeof next.season.claimed !== 'object') next.season.claimed = {};
    if (!next.bossStats || typeof next.bossStats !== 'object') next.bossStats = { encounters: 0, defeated: 0, escaped: 0, bestValue: 0 };
    if (!Array.isArray(next.bossLeaderboard)) next.bossLeaderboard = [];
    if (!next.seasonRank || typeof next.seasonRank !== 'object') next.seasonRank = { seasonKey: getSeasonKey(), bestScore: 0, submittedAt: '' };
    next.seasonRank.seasonKey = String(next.seasonRank.seasonKey || getSeasonKey());
    next.seasonRank.bestScore = Math.max(0, Number(next.seasonRank.bestScore || 0));
    next.bossStats.encounters = Math.max(0, Number(next.bossStats.encounters || 0));
    next.bossStats.defeated = Math.max(0, Number(next.bossStats.defeated || 0));
    next.bossStats.escaped = Math.max(0, Number(next.bossStats.escaped || 0));
    next.bossStats.bestValue = Math.max(0, Number(next.bossStats.bestValue || 0));
    next.bossWindowActive = false;
    next.bossSurgeTick = 0;
    return next;
}

function savePlayerData(syncCloud = true) {
    try {
        const plain = serializeGameState();
        localStorage.setItem('aqua_v2.0', JSON.stringify(plain));
        localStorage.setItem('aqua_v1.9', JSON.stringify(plain));
        localStorage.setItem('aqua_v1.8', JSON.stringify(plain));
        localStorage.setItem('aqua_v1.7', JSON.stringify(plain));
        localStorage.setItem('aqua_v1.6', JSON.stringify(plain));
        localStorage.setItem('aqua_v1.5', JSON.stringify(plain));
        localStorage.setItem('aqua_v1.4', JSON.stringify(plain));
        localStorage.setItem('aqua_v1.3', JSON.stringify(plain));
        localStorage.setItem('aqua_v1.2', JSON.stringify(plain));
        localStorage.setItem('aqua_v1.1', JSON.stringify(plain)); // 이전 버전과 호환 유지
        setCloudSaveStatus('ok', '로컬 저장됨');

        if (syncCloud && isFirebaseConnected && gameState.userId && window.AquaFirebase) {
            setCloudSaveStatus('wait', '클라우드 저장 중');
            clearTimeout(cloudSaveTimer);
            cloudSaveTimer = setTimeout(async () => {
                try {
                    const fb = await waitForFirebase();
                    await fb.setDoc(fb.doc(fb.db, 'users', gameState.userId), {
                        uid: gameState.userId,
                        nickname: sanitizeNickname(gameState.nickname),
                        gold: Number(gameState.gold || 0),
                        level: Number(gameState.level || 1),
                        state: serializeGameState(),
                        updatedAt: fb.serverTimestamp()
                    }, { merge: true });
                    setCloudSaveStatus('ok', '클라우드 저장됨');
                } catch (e) {
                    console.warn('Cloud save skipped:', e.message);
                    setCloudSaveStatus('error', '클라우드 저장 실패');
                }
            }, 600);
        }
    } catch(e) {
        console.error('Save error:', e);
        setCloudSaveStatus('error', '저장 실패');
    }
}

async function loadPlayerDataFromCloud() {
    if (!isFirebaseConnected || !gameState.userId) return;
    try {
        setCloudSaveStatus('wait', '클라우드 불러오는 중');
        const fb = await waitForFirebase();
        const ref = fb.doc(fb.db, 'users', gameState.userId);
        const snap = await fb.getDoc(ref);
        if (snap.exists()) {
            const cloud = snap.data();
            if (cloud.state) {
                const localUserId = gameState.userId;
                gameState = normalizeGameState({ ...cloud.state, userId: localUserId });
                updateUI();
                setCloudSaveStatus('ok', '클라우드 불러옴');
                savePlayerData(false);
            }
        } else {
            await fb.setDoc(ref, {
                uid: gameState.userId,
                nickname: sanitizeNickname(gameState.nickname),
                gold: Number(gameState.gold || 0),
                level: Number(gameState.level || 1),
                state: serializeGameState(),
                createdAt: fb.serverTimestamp(),
                updatedAt: fb.serverTimestamp()
            }, { merge: true });
            setCloudSaveStatus('ok', '클라우드 저장 준비');
        }
    } catch(e) {
        console.warn('Cloud load skipped:', e.message);
        setCloudSaveStatus('error', '클라우드 불러오기 실패');
    }
}

async function subscribeGlobalLeaderboard() {
    if (!isFirebaseConnected || !window.AquaFirebase) return;
    try {
        const fb = await waitForFirebase();
        if (leaderboardUnsubscribe) leaderboardUnsubscribe();
        const q = fb.query(fb.collection(fb.db, 'leaderboard'), fb.orderBy('score', 'desc'), fb.limit(20));
        leaderboardUnsubscribe = fb.onSnapshot(q, (snapshot) => {
            const remoteBoard = snapshot.docs.map((docSnap) => docSnap.data());
            if (remoteBoard.length > 0) {
                gameState.leaderboard = remoteBoard.map((entry) => ({
                    name: entry.name || '낚시꾼',
                    score: Number(entry.score || 0),
                    level: Number(entry.level || 1),
                    seasonKey: entry.seasonKey || ''
                }));
                const competition = document.getElementById('screen-competition');
                if (competition && !competition.classList.contains('hidden')) renderCompetition();
                savePlayerData(false);
            }
        }, (error) => console.warn('Leaderboard listen error:', error.message));

        if (bossLeaderboardUnsubscribe) bossLeaderboardUnsubscribe();
        const bossQ = fb.query(fb.collection(fb.db, 'bossLeaderboard'), fb.orderBy('bossDefeated', 'desc'), fb.limit(20));
        bossLeaderboardUnsubscribe = fb.onSnapshot(bossQ, (snapshot) => {
            const remoteBossBoard = snapshot.docs.map((docSnap) => docSnap.data());
            if (remoteBossBoard.length > 0) {
                gameState.bossLeaderboard = remoteBossBoard.map((entry) => ({
                    name: entry.name || '낚시꾼',
                    bossDefeated: Number(entry.bossDefeated || 0),
                    bossBestValue: Number(entry.bossBestValue || 0),
                    level: Number(entry.level || 1),
                    seasonKey: entry.seasonKey || ''
                }));
                const competition = document.getElementById('screen-competition');
                if (competition && !competition.classList.contains('hidden')) renderCompetition();
                savePlayerData(false);
            }
        }, (error) => console.warn('Boss leaderboard listen error:', error.message));
    } catch(e) {
        console.warn('Leaderboard subscribe skipped:', e.message);
    }
}

async function startFirebaseAuthListener() {
    if (firebaseListenerStarted) return;
    firebaseListenerStarted = true;
    try {
        const fb = await waitForFirebase();
        setFirebaseStatus('wait', 'Firebase 준비');
        fb.onAuthStateChanged(fb.auth, async (user) => {
            if (user) {
                isFirebaseConnected = true;
                gameState.userId = user.uid;
                setFirebaseStatus('ok', user.isAnonymous ? '익명 접속' : '로그인됨');
                document.getElementById('logout-btn')?.classList.remove('hidden');
                await loadPlayerDataFromCloud();
                await subscribeGlobalLeaderboard();
                document.getElementById('screen-login').classList.add('hidden');
                switchScreen('village');
                initAudio();
                savePlayerData(false);
            } else {
                isFirebaseConnected = false;
                gameState.userId = null;
                setFirebaseStatus('wait', '로그인 필요');
                setCloudSaveStatus('ok', '로컬 저장 가능');
                showLoginScreen();
            }
        });
    } catch(e) {
        console.error('Firebase listener error:', e);
        setFirebaseStatus('error', 'Firebase 오류');
    }
}

function bindLoginEnterKey() {
    ['email', 'pw'].forEach(id => {
        document.getElementById(id)?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') loginWithEmail();
        });
    });
}


document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('fx-paused', document.hidden);
});

async function init() {
    try {
        await loadFishDatabase();
        const saved = localStorage.getItem('aqua_v2.0') || localStorage.getItem('aqua_v1.9') || localStorage.getItem('aqua_v1.8') || localStorage.getItem('aqua_v1.7') || localStorage.getItem('aqua_v1.6') || localStorage.getItem('aqua_v1.5') || localStorage.getItem('aqua_v1.4') || localStorage.getItem('aqua_v1.3') || localStorage.getItem('aqua_v1.2') || localStorage.getItem('aqua_v1.1');
        if (saved) gameState = normalizeGameState(JSON.parse(saved));
        else gameState = normalizeGameState(gameState);
        
        if (!gameState.leaderboard || gameState.leaderboard.length === 0) gameState.leaderboard = getLocalLeaderboardFallback();
        if (!gameState.bossLeaderboard || gameState.bossLeaderboard.length === 0) gameState.bossLeaderboard = getBossLeaderboardFallback();
        
        if (!gameState.achievements) gameState.achievements = {};
        ensureDailyState(true);
        
        applyAdaptivePerformance();
        applyGraphicsMode();
        await initPWA();
        updateUI();
        initAudio();
        bindLoginEnterKey();
        bindPremiumCardPointer();
        startFirebaseAuthListener();
        
        console.log('%c[AquaFantasia v2.0] Actions Rank Visual Max Patch Ready', 'color:#67e8f9');
    } catch(e) {
        console.error('Init error:', e);
        alert('게임 초기화 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.');
    }
}

window.addEventListener('beforeunload', () => savePlayerData(false));
window.onload = init;
