const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const coinsRunEl = document.getElementById("coins-run");
const bestScoreEl = document.getElementById("best-score");
const bankCoinsEl = document.getElementById("bank-coins");
const levelEl = document.getElementById("level");
const missionEl = document.getElementById("mission");

const endlessBtn = document.getElementById("endless-btn");
const campaignBtn = document.getElementById("campaign-btn");
const campaignStageMeta = document.getElementById("campaign-stage-meta");
const restartBtn = document.getElementById("restart-btn");
const restartLabel = document.getElementById("restart-label");
const restartStageZeroBtn = document.getElementById("restart-stage-zero-btn");
const resetEverythingBtn = document.getElementById("reset-everything-btn");
const reviveBtn = document.getElementById("revive-btn");
const upgradeJumpBtn = document.getElementById("upgrade-jump-btn");
const upgradeMagnetBtn = document.getElementById("upgrade-magnet-btn");
const upgradeJumpMeta = document.getElementById("upgrade-jump-meta");
const upgradeMagnetMeta = document.getElementById("upgrade-magnet-meta");
const musicToggleBtn = document.getElementById("music-toggle-btn");
const musicToggleLabel = document.getElementById("music-toggle-label");
const menuToggleBtn = document.getElementById("menu-toggle-btn");
const menuCloseBtn = document.getElementById("menu-close-btn");
const gameMenu = document.getElementById("game-menu");
const menuBackdrop = document.getElementById("menu-backdrop");
const exitAppBtn = document.getElementById("exit-app-btn");
const exitAppOverlay = document.getElementById("exit-app-overlay");
const exitAppMessage = document.getElementById("exit-app-message");
const exitAppDismissBtn = document.getElementById("exit-app-dismiss-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const gameShell = document.querySelector(".game-shell");
const canvasWrap = document.querySelector(".canvas-wrap");
const canvasStage = document.querySelector(".canvas-stage");
const scorePanel = document.querySelector(".score-panel");
const bgMusic = document.getElementById("bg-music");

const GAME_ASPECT = 16 / 9;
const FONT_TITLE = '"Press Start 2P", monospace';
const FONT_UI = '"Russo One", sans-serif';

const groundY = canvas.height - 68;
const WATER_TOP = 68;
const WATER_BOTTOM = groundY - 20;
const WATER_SINK = 0.13;
const SWIM_UP_FORCE = -5.6;
const SWIM_DOWN_FORCE = 4.4;
const WATER_DRAG = 0.968;
const gravity = 0.84;
const baseJumpForce = -14.8;

const STAGES_PER_WORLD = 8;
const WORLD2_START = STAGES_PER_WORLD + 1;
const WORLD3_START = STAGES_PER_WORLD * 2 + 1;
const WORLD4_START = STAGES_PER_WORLD * 3 + 1;
const WORLD5_START = STAGES_PER_WORLD * 4 + 1;

// Same bg-loop track; per-world speed / warmth (lowshelf dB) / depth (lowpass Hz).
const WORLD_AUDIO_PROFILES = [
  { speed: 1.0, warmth: 0, depth: 20000 },
  { speed: 0.86, warmth: -3.5, depth: 850 },
  { speed: 0.9, warmth: -5, depth: 4800 },
  { speed: 1.05, warmth: -2, depth: 16500 },
  { speed: 1.08, warmth: 5, depth: 11500 },
];

const STAGES = [
  { name: "Sunny Trail", targetScore: 90, startSpeed: 3.0, accel: 0.00065, spawn: 80, boss: false, biome: "grass" },
  { name: "Rock Dust", targetScore: 150, startSpeed: 3.6, accel: 0.00085, spawn: 72, boss: false, biome: "desert" },
  { name: "Windy Ridge", targetScore: 185, startSpeed: 3.9, accel: 0.00095, spawn: 68, boss: false, biome: "dusk" },
  { name: "Boss: Thorn Lord", targetScore: 230, startSpeed: 4.0, accel: 0.00105, spawn: 64, boss: true, biome: "grass" },
  { name: "Wild Barrens", targetScore: 320, startSpeed: 4.6, accel: 0.0012, spawn: 56, boss: false, biome: "storm" },
  { name: "Storm Flats", targetScore: 365, startSpeed: 4.9, accel: 0.00125, spawn: 53, boss: false, biome: "storm" },
  { name: "Night Canyons", targetScore: 420, startSpeed: 5.1, accel: 0.0013, spawn: 50, boss: false, biome: "night" },
  { name: "Final Boss: Cactus King", targetScore: 480, startSpeed: 5.4, accel: 0.0014, spawn: 46, boss: true, biome: "night" },
  { name: "Shallow Shores", targetScore: 540, startSpeed: 5.6, accel: 0.00145, spawn: 44, boss: false, biome: "ocean", swimming: true },
  { name: "Coral Gardens", targetScore: 600, startSpeed: 5.8, accel: 0.0015, spawn: 42, boss: false, biome: "reef", swimming: true },
  { name: "Kelp Forest", targetScore: 660, startSpeed: 6.0, accel: 0.00155, spawn: 40, boss: false, biome: "reef", swimming: true },
  { name: "Boss: Kraken's Gate", targetScore: 790, startSpeed: 6.3, accel: 0.00165, spawn: 36, boss: true, biome: "deep", swimming: true },
  { name: "Sunken Ruins", targetScore: 860, startSpeed: 6.5, accel: 0.0017, spawn: 34, boss: false, biome: "deep", swimming: true },
  { name: "Glow Caverns", targetScore: 930, startSpeed: 6.7, accel: 0.00175, spawn: 32, boss: false, biome: "abyss", swimming: true },
  { name: "Mariana Sprint", targetScore: 1000, startSpeed: 6.9, accel: 0.0018, spawn: 30, boss: false, biome: "abyss", swimming: true },
  { name: "Final Boss: Leviathan", targetScore: 1180, startSpeed: 7.3, accel: 0.00195, spawn: 26, boss: true, biome: "abyss", swimming: true },
  { name: "Frozen Tundra", targetScore: 1250, startSpeed: 7.4, accel: 0.002, spawn: 25, boss: false, biome: "frost", slippery: true },
  { name: "Ice Ravine", targetScore: 1320, startSpeed: 7.5, accel: 0.00205, spawn: 24, boss: false, biome: "frost", slippery: true },
  { name: "Glacier Pass", targetScore: 1400, startSpeed: 7.6, accel: 0.0021, spawn: 23, boss: false, biome: "frost", slippery: true },
  { name: "Boss: Frost Titan", targetScore: 1570, startSpeed: 7.8, accel: 0.0022, spawn: 21, boss: true, biome: "frost", slippery: true },
  { name: "Thawing Crust", targetScore: 1660, startSpeed: 7.9, accel: 0.00225, spawn: 20, boss: false, biome: "ash", slippery: true },
  { name: "Steam Flats", targetScore: 1760, startSpeed: 8.0, accel: 0.0023, spawn: 19, boss: false, biome: "ash", slippery: true },
  { name: "Cinder Gale", targetScore: 1960, startSpeed: 8.2, accel: 0.0024, spawn: 17, boss: false, biome: "ash", slippery: true },
  { name: "Boss: Thaw Colossus", targetScore: 2100, startSpeed: 8.3, accel: 0.0025, spawn: 16, boss: true, biome: "ash", slippery: true },
  { name: "Cloud Peaks", targetScore: 2200, startSpeed: 8.4, accel: 0.00255, spawn: 15, boss: false, biome: "sky", flying: true },
  { name: "Gust Valley", targetScore: 2320, startSpeed: 8.5, accel: 0.0026, spawn: 14, boss: false, biome: "sky", flying: true },
  { name: "Rain Squall", targetScore: 2560, startSpeed: 8.6, accel: 0.0027, spawn: 13, boss: false, biome: "storm", flying: true },
  { name: "Boss: Storm Hawk", targetScore: 2680, startSpeed: 8.65, accel: 0.00275, spawn: 13, boss: true, biome: "storm", flying: true },
  { name: "Aurora Drift", targetScore: 2800, startSpeed: 8.7, accel: 0.0028, spawn: 12, boss: false, biome: "aurora", flying: true },
  { name: "Moonlit Skyway", targetScore: 2920, startSpeed: 8.75, accel: 0.00285, spawn: 12, boss: false, biome: "aurora", flying: true },
  { name: "Void Horizon", targetScore: 3160, startSpeed: 8.85, accel: 0.00295, spawn: 11, boss: false, biome: "void", flying: true },
  { name: "Final Boss: Sky Serpent", targetScore: 3300, startSpeed: 8.9, accel: 0.00305, spawn: 10, boss: true, biome: "void", flying: true },
  { name: "Cinder Trail", targetScore: 3420, startSpeed: 9.0, accel: 0.0031, spawn: 10, boss: false, biome: "lava", volcanic: true },
  { name: "Geyser Fields", targetScore: 3660, startSpeed: 9.1, accel: 0.0032, spawn: 9, boss: false, biome: "volcanic", volcanic: true },
  { name: "Ashfall Ridge", targetScore: 3780, startSpeed: 9.15, accel: 0.00325, spawn: 8, boss: false, biome: "ember", volcanic: true },
  { name: "Boss: Magma Wyrm", targetScore: 3920, startSpeed: 9.2, accel: 0.0033, spawn: 8, boss: true, biome: "inferno", volcanic: true },
  { name: "Caldera Run", targetScore: 4060, startSpeed: 9.25, accel: 0.00335, spawn: 8, boss: false, biome: "volcanic", volcanic: true },
  { name: "Hellforge", targetScore: 4200, startSpeed: 9.3, accel: 0.0034, spawn: 7, boss: false, biome: "inferno", volcanic: true },
  { name: "Pyroclast Peaks", targetScore: 4340, startSpeed: 9.35, accel: 0.00345, spawn: 7, boss: false, biome: "lava", volcanic: true },
  { name: "Final Boss: Phoenix King", targetScore: 4640, startSpeed: 9.45, accel: 0.0036, spawn: 6, boss: true, biome: "inferno", volcanic: true },
];

const ENDLESS_CONFIG = {
  name: "Endless Rush",
  targetScore: Number.POSITIVE_INFINITY,
  startSpeed: 7.5,
  accel: 0.0021,
  spawn: 24,
  boss: true,
  biome: "aurora",
  flying: true,
  endless: true,
};

function stageTargetScore(stageIndex = save.currentStage) {
  if (endlessMode) {
    return ENDLESS_CONFIG.targetScore;
  }
  const stage = STAGES[stageIndex - 1];
  if (!stage) {
    return 0;
  }
  if (stageIndex >= 33) {
    return Math.floor(stage.targetScore * 0.82);
  }
  if (stageIndex >= 25) {
    return Math.floor(stage.targetScore * 0.88);
  }
  if (stageIndex >= 17) {
    return Math.floor(stage.targetScore * 0.92);
  }
  return stage.targetScore;
}

const BIOME_PALETTES = {
  grass: {
    sky: ["#8bd5ff", "#d7f1ff"],
    ground: "#8bc34a",
    hills: "#7fb069",
    dunes: "rgba(126, 90, 47, 0.22)",
    line: "#6b8f2a",
    clouds: "rgba(255,255,255,0.85)",
  },
  desert: {
    sky: ["#fdba74", "#fef3c7"],
    ground: "#d4a056",
    hills: "#c2853a",
    dunes: "rgba(120, 53, 15, 0.28)",
    line: "#92400e",
    clouds: "rgba(255,255,255,0.55)",
  },
  dusk: {
    sky: ["#7c3aed", "#fb7185"],
    ground: "#84cc16",
    hills: "#65a30d",
    dunes: "rgba(88, 28, 135, 0.24)",
    line: "#4d7c0f",
    clouds: "rgba(254, 243, 199, 0.45)",
  },
  storm: {
    sky: ["#64748b", "#94a3b8"],
    ground: "#4d7c0f",
    hills: "#3f6212",
    dunes: "rgba(30, 41, 59, 0.35)",
    line: "#365314",
    clouds: "rgba(203, 213, 225, 0.7)",
  },
  night: {
    sky: ["#0f172a", "#312e81"],
    ground: "#166534",
    hills: "#14532d",
    dunes: "rgba(15, 23, 42, 0.45)",
    line: "#14532d",
    clouds: "rgba(148, 163, 184, 0.35)",
  },
  frost: {
    sky: ["#dbeafe", "#f0f9ff"],
    ground: "#e2e8f0",
    hills: "#cbd5e1",
    dunes: "rgba(125, 211, 252, 0.35)",
    line: "#94a3b8",
    clouds: "rgba(255,255,255,0.92)",
  },
  ash: {
    sky: ["#44403c", "#7f1d1d"],
    ground: "#292524",
    hills: "#44403c",
    dunes: "rgba(248, 113, 113, 0.28)",
    line: "#57534e",
    clouds: "rgba(120, 113, 108, 0.55)",
  },
  sky: {
    sky: ["#38bdf8", "#e0f2fe"],
    ground: "#86efac",
    hills: "#4ade80",
    dunes: "rgba(255,255,255,0.45)",
    line: "#16a34a",
    clouds: "rgba(255,255,255,0.92)",
  },
  aurora: {
    sky: ["#1e1b4b", "#312e81"],
    ground: "#334155",
    hills: "#475569",
    dunes: "rgba(52, 211, 153, 0.22)",
    line: "#64748b",
    clouds: "rgba(167, 243, 208, 0.35)",
  },
  void: {
    sky: ["#020617", "#312e81"],
    ground: "#1e1b4b",
    hills: "#3730a3",
    dunes: "rgba(129, 140, 248, 0.28)",
    line: "#4338ca",
    clouds: "rgba(196, 181, 253, 0.25)",
  },
  ocean: {
    sky: ["#0c4a6e", "#0284c7"],
    ground: "#ca8a04",
    hills: "#eab308",
    dunes: "rgba(125, 211, 252, 0.22)",
    line: "#0369a1",
    clouds: "rgba(224, 242, 254, 0.35)",
  },
  reef: {
    sky: ["#155e75", "#0891b2"],
    ground: "#d97706",
    hills: "#f59e0b",
    dunes: "rgba(52, 211, 153, 0.2)",
    line: "#0e7490",
    clouds: "rgba(167, 243, 208, 0.3)",
  },
  deep: {
    sky: ["#0f172a", "#1e3a8a"],
    ground: "#475569",
    hills: "#64748b",
    dunes: "rgba(56, 189, 248, 0.16)",
    line: "#334155",
    clouds: "rgba(186, 230, 253, 0.2)",
  },
  abyss: {
    sky: ["#020617", "#172554"],
    ground: "#334155",
    hills: "#475569",
    dunes: "rgba(129, 140, 248, 0.18)",
    line: "#1e293b",
    clouds: "rgba(196, 181, 253, 0.22)",
  },
  lava: {
    sky: ["#7f1d1d", "#fb923c"],
    ground: "#292524",
    hills: "#44403c",
    dunes: "rgba(251, 146, 60, 0.35)",
    line: "#ea580c",
    clouds: "rgba(254, 215, 170, 0.4)",
  },
  volcanic: {
    sky: ["#431407", "#9a3412"],
    ground: "#1c1917",
    hills: "#292524",
    dunes: "rgba(234, 88, 12, 0.28)",
    line: "#c2410c",
    clouds: "rgba(120, 113, 108, 0.45)",
  },
  ember: {
    sky: ["#991b1b", "#fdba74"],
    ground: "#44403c",
    hills: "#57534e",
    dunes: "rgba(248, 113, 113, 0.3)",
    line: "#b45309",
    clouds: "rgba(254, 202, 202, 0.35)",
  },
  inferno: {
    sky: ["#450a0a", "#7f1d1d"],
    ground: "#1c1917",
    hills: "#292524",
    dunes: "rgba(239, 68, 68, 0.32)",
    line: "#dc2626",
    clouds: "rgba(251, 191, 36, 0.25)",
  },
};

/**
 * Dev preview URLs (local testing only):
 *   ?worldintro=2|3|4|5     — show that world intro immediately on load
 *   ?postgame=world2      — start at stage 9 (World 2: water)
 *   ?postgame=world3      — start at stage 17 (World 3: frost)
 *   ?postgame=world4      — start at stage 25 (World 4: sky)
 *   ?postgame=world5      — start at stage 33 (World 5)
 *   ?postgame=N           — start at stage N (1–40)
 *   ?postgame=final       — last stage
 *   ?postgame=endless     — endless mode
 */
const GAME_CONFIG = {
  unlockPostGame: false,
  startStage: 9,
  unlockEndless: true,
  startInEndlessMode: false,
  demoBankCoins: 0,
};

let endlessMode = false;
let previewMode = false;
let worldIntroBeforeRun = false;

const WORLD_INTRO_PREVIEW = {
  2: WORLD2_START,
  3: WORLD3_START,
  4: WORLD4_START,
  5: WORLD5_START,
};

const saveKey = "runner_rush_save_v3";
const world2IntroKey = "runner_rush_world2_intro_seen";
const world3IntroKey = "runner_rush_world3_intro_seen";
const world4IntroKey = "runner_rush_world4_intro_seen";
const world5IntroKey = "runner_rush_world5_intro_seen";
const defaultSave = {
  bestScore: 0,
  bankCoins: 40,
  totalCoins: 0,
  jumpLevel: 1,
  magnetLevel: 0,
  unlockedStage: 1,
  currentStage: 1,
  endlessUnlocked: false,
  endlessBest: 0,
};
const save = { ...defaultSave, ...JSON.parse(localStorage.getItem(saveKey) || "{}") };
save.unlockedStage = Math.max(1, Math.min(STAGES.length, save.unlockedStage));
save.currentStage = Math.max(1, Math.min(save.unlockedStage, save.currentStage));
save.endlessUnlocked = !!save.endlessUnlocked;
save.endlessBest = Math.max(0, save.endlessBest || 0);

const STAGE_LAYOUT_MIGRATION_KEY = "runner_rush_stage_layout_v8";
const WORLD_ORDER_MIGRATION_KEY = "runner_rush_world_order_water_w2";

if (localStorage.getItem(WORLD_ORDER_MIGRATION_KEY) !== "1") {
  localStorage.removeItem(world2IntroKey);
  localStorage.removeItem(world3IntroKey);
  localStorage.removeItem(world4IntroKey);
  localStorage.setItem(WORLD_ORDER_MIGRATION_KEY, "1");
}

function mapOldStageToNew(oldStage) {
  if (oldStage <= STAGES_PER_WORLD) {
    return Math.min(oldStage, STAGES.length);
  }
  const beaten = oldStage - 1;
  return Math.min(STAGES.length, Math.ceil((beaten * STAGES.length) / 50) + 1);
}

if (localStorage.getItem(STAGE_LAYOUT_MIGRATION_KEY) !== "1") {
  const oldUnlocked = save.unlockedStage;
  const oldCurrent = save.currentStage;
  if (oldUnlocked > STAGES_PER_WORLD || oldCurrent > STAGES_PER_WORLD) {
    save.unlockedStage = mapOldStageToNew(oldUnlocked);
    save.currentStage = Math.min(save.unlockedStage, mapOldStageToNew(oldCurrent));
    if (save.unlockedStage === STAGES_PER_WORLD && oldUnlocked > STAGES_PER_WORLD) {
      save.unlockedStage = WORLD2_START;
    }
    if (save.endlessUnlocked && save.unlockedStage >= STAGES_PER_WORLD * 2) {
      save.unlockedStage = Math.max(save.unlockedStage, WORLD3_START);
      if (save.currentStage === STAGES_PER_WORLD * 2) {
        save.currentStage = WORLD3_START;
      }
    }
    if (save.unlockedStage >= STAGES_PER_WORLD * 3) {
      save.unlockedStage = Math.max(save.unlockedStage, WORLD4_START);
      if (save.currentStage === STAGES_PER_WORLD * 3) {
        save.currentStage = WORLD4_START;
      }
    }
    if (save.unlockedStage >= STAGES_PER_WORLD * 4) {
      save.unlockedStage = Math.max(save.unlockedStage, WORLD5_START);
      if (save.currentStage === STAGES_PER_WORLD * 4) {
        save.currentStage = WORLD5_START;
      }
    }
  }
  localStorage.setItem(STAGE_LAYOUT_MIGRATION_KEY, "1");
  localStorage.setItem(saveKey, JSON.stringify(save));
}

function resolvePostgameStage(postgameParam) {
  if (postgameParam === "endless") {
    return null;
  }
  if (postgameParam === "final") {
    return STAGES.length;
  }
  if (postgameParam === "world2") {
    return WORLD2_START;
  }
  if (postgameParam === "world3") {
    return WORLD3_START;
  }
  if (postgameParam === "world4") {
    return WORLD4_START;
  }
  if (postgameParam === "world5") {
    return WORLD5_START;
  }
  if (postgameParam === null || postgameParam === "") {
    return null;
  }
  const parsed = Number.parseInt(postgameParam, 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.max(1, Math.min(STAGES.length, parsed));
}

function clearWorldIntroSeen(worldId) {
  if (worldId === 2) {
    localStorage.removeItem(world2IntroKey);
  }
  if (worldId === 3) {
    localStorage.removeItem(world3IntroKey);
  }
  if (worldId === 4) {
    localStorage.removeItem(world4IntroKey);
  }
  if (worldId === 5) {
    localStorage.removeItem(world5IntroKey);
  }
}

function resolveWorldIntroPreview(param) {
  if (param === null || param === "") {
    return null;
  }
  const world = Number.parseInt(param, 10);
  if (!Number.isFinite(world) || !WORLD_INTRO_PREVIEW[world]) {
    return null;
  }
  return world;
}

function applyWorldIntroPreview(worldId) {
  const stage = WORLD_INTRO_PREVIEW[worldId];
  clearWorldIntroSeen(worldId);
  save.currentStage = stage;
  save.unlockedStage = Math.max(save.unlockedStage, stage);
  save.endlessUnlocked = true;
  activeWorldIntro = worldId;
  worldIntroBeforeRun = true;
  setState("worldintro");
  updateHud();
}

function applyGameConfig() {
  const params = new URLSearchParams(window.location.search);
  const postgameParam = params.get("postgame");
  const worldIntroParam = params.get("worldintro");
  previewMode =
    GAME_CONFIG.unlockPostGame || postgameParam !== null || worldIntroParam !== null;
  if (!previewMode) {
    return;
  }

  let persistPostgameStage = false;

  save.unlockedStage = STAGES.length;

  if (postgameParam === "endless") {
    save.endlessUnlocked = true;
    endlessMode = true;
  } else {
    const stage = resolvePostgameStage(postgameParam);
    if (stage !== null) {
      save.currentStage = stage;
      save.unlockedStage = Math.max(save.unlockedStage, stage);
      save.endlessUnlocked = true;
      persistPostgameStage = true;
      if (postgameParam === "world2") {
        clearWorldIntroSeen(2);
      }
      if (postgameParam === "world3") {
        clearWorldIntroSeen(3);
      }
      if (postgameParam === "world4") {
        clearWorldIntroSeen(4);
      }
      if (postgameParam === "world5") {
        clearWorldIntroSeen(5);
      }
    } else if (resolveWorldIntroPreview(worldIntroParam) !== null) {
      save.endlessUnlocked = true;
    } else {
      save.currentStage = Math.max(1, Math.min(STAGES.length, GAME_CONFIG.startStage || STAGES.length));
      if (GAME_CONFIG.unlockEndless) {
        save.endlessUnlocked = true;
      }
      if (GAME_CONFIG.startInEndlessMode) {
        endlessMode = true;
      }
    }
  }

  if (GAME_CONFIG.demoBankCoins > 0) {
    save.bankCoins = Math.max(save.bankCoins, GAME_CONFIG.demoBankCoins);
  }

  if (persistPostgameStage) {
    localStorage.setItem(saveKey, JSON.stringify(save));
  }
}

function bootWorldIntroPreviewFromUrl() {
  const worldIntroParam = new URLSearchParams(window.location.search).get("worldintro");
  const previewWorld = resolveWorldIntroPreview(worldIntroParam);
  if (previewWorld === null) {
    return false;
  }
  applyWorldIntroPreview(previewWorld);
  return true;
}

applyGameConfig();

const player = {
  x: 90,
  y: groundY - 56,
  w: 44,
  h: 56,
  vy: 0,
  grounded: true,
  sliding: false,
  slideTimer: 0,
  shieldTimer: 0,
};

let obstacles = [];
let coins = [];
let powerups = [];
let dustParticles = [];
let score = 0;
let runCoins = 0;
let stageStartScore = 0;
let rewardCheckpointScore = 0;
let rewardCheckpointCoins = 0;
let speed = 3.2;
let frame = 0;
let obstacleTimer = 0;
let coinTimer = 0;
let powerupTimer = 0;
let state = "menu";
let reviveUsed = false;
let sprinting = false;
const EARLY_OBSTACLE_GRACE_FRAMES = 220;
const HEAT_PULSE_WARN_FRAMES = 78;
const REVIVE_COIN_COST = 40;
const SCORE_BASE_PER_FRAME = 0.2;
const SCORE_SPEED_FACTOR = 0.013;
const STAGE_CLEAR_SHIELD_FRAMES = 120;
const musicPrefKey = "runner_rush_music_enabled";
let activeWorldIntro = null;
let heatPulseTimer = 0;
let heatPulseWarning = 0;
const OVERLAY_READ_MS = 750;
let overlayEpoch = 0;
let overlayShownAt = 0;
let pointerOverlayEpoch = null;
let musicEnabled = localStorage.getItem(musicPrefKey) !== "false";
let musicUnlocked = false;
let musicContext = null;
let musicBuffer = null;
let musicBufferLoading = null;
let musicBufferSource = null;
let musicDepthFilter = null;
let musicWarmthFilter = null;
let musicGainNode = null;
let musicWebAudioActive = false;
let activeMusicWorldId = null;

function musicWorldForStage() {
  if (endlessMode) {
    return 5;
  }
  if (save.currentStage >= WORLD5_START) {
    return 5;
  }
  if (save.currentStage >= WORLD4_START) {
    return 4;
  }
  if (save.currentStage >= WORLD3_START) {
    return 3;
  }
  if (save.currentStage >= WORLD2_START) {
    return 2;
  }
  return 1;
}

function ensureMusicContext() {
  if (musicContext) {
    return musicContext;
  }
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return null;
  }
  musicContext = new AudioCtx();
  musicDepthFilter = musicContext.createBiquadFilter();
  musicDepthFilter.type = "lowpass";
  musicDepthFilter.Q.value = 0.7;
  musicWarmthFilter = musicContext.createBiquadFilter();
  musicWarmthFilter.type = "lowshelf";
  musicWarmthFilter.frequency.value = 320;
  musicGainNode = musicContext.createGain();
  musicGainNode.gain.value = 0;
  musicDepthFilter.connect(musicWarmthFilter);
  musicWarmthFilter.connect(musicGainNode);
  musicGainNode.connect(musicContext.destination);
  return musicContext;
}

function resumeMusicContextSync() {
  if (musicContext?.state === "suspended") {
    void musicContext.resume();
  }
}

async function loadMusicBuffer() {
  if (musicBuffer) {
    return musicBuffer;
  }
  if (musicBufferLoading) {
    return musicBufferLoading;
  }
  const ctx = ensureMusicContext();
  if (!ctx || !bgMusic) {
    return null;
  }
  musicBufferLoading = (async () => {
    const src = bgMusic.currentSrc || bgMusic.src;
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error("music fetch failed");
    }
    const data = await response.arrayBuffer();
    musicBuffer = await ctx.decodeAudioData(data);
    return musicBuffer;
  })();
  try {
    return await musicBufferLoading;
  } catch {
    musicBufferLoading = null;
    return null;
  }
}

function stopWebAudioPlayback() {
  if (musicBufferSource) {
    try {
      musicBufferSource.stop();
    } catch {
      // Already stopped.
    }
    musicBufferSource.disconnect();
    musicBufferSource = null;
  }
  musicWebAudioActive = false;
}

function stopHtmlAudioPlayback() {
  if (!bgMusic) {
    return;
  }
  bgMusic.pause();
}

function pauseMusic() {
  stopWebAudioPlayback();
  if (musicGainNode) {
    musicGainNode.gain.value = 0;
  }
  stopHtmlAudioPlayback();
}

function setAudioParam(param, value, smooth = true) {
  if (!param) {
    return;
  }
  if (!musicContext || !smooth) {
    param.value = value;
    return;
  }
  const now = musicContext.currentTime;
  param.cancelScheduledValues(now);
  param.setTargetAtTime(value, now, 0.12);
}

function syncWorldAudioProfile(force = false) {
  const worldId = musicWorldForStage();
  if (!force && worldId === activeMusicWorldId) {
    return;
  }
  const profile = WORLD_AUDIO_PROFILES[worldId - 1];
  if (!profile) {
    return;
  }
  if (musicBufferSource) {
    setAudioParam(musicBufferSource.playbackRate, profile.speed);
  }
  if (bgMusic) {
    bgMusic.playbackRate = profile.speed;
  }
  if (musicDepthFilter && musicWarmthFilter) {
    setAudioParam(musicDepthFilter.frequency, profile.depth);
    setAudioParam(musicWarmthFilter.gain, profile.warmth);
  }
  activeMusicWorldId = worldId;
}

function startWebAudioPlayback() {
  if (!musicContext || !musicBuffer || !musicEnabled) {
    return false;
  }
  stopWebAudioPlayback();
  stopHtmlAudioPlayback();
  const profile = WORLD_AUDIO_PROFILES[musicWorldForStage() - 1];
  if (!profile) {
    return false;
  }
  musicBufferSource = musicContext.createBufferSource();
  musicBufferSource.buffer = musicBuffer;
  musicBufferSource.loop = true;
  musicBufferSource.playbackRate.value = profile.speed;
  musicBufferSource.connect(musicDepthFilter);
  musicBufferSource.start(0);
  musicWebAudioActive = true;
  activeMusicWorldId = null;
  syncWorldAudioProfile(true);
  if (musicGainNode) {
    musicGainNode.gain.value = 0.35;
  }
  return true;
}

function startHtmlAudioPlayback() {
  if (!bgMusic || !musicEnabled) {
    return;
  }
  stopWebAudioPlayback();
  syncWorldAudioProfile(true);
  bgMusic.volume = 0.35;
  bgMusic.muted = false;
  const playAttempt = bgMusic.play();
  if (playAttempt !== undefined) {
    playAttempt.catch(() => {});
  }
}

async function enhanceWithWebAudioIfReady() {
  ensureMusicContext();
  if (!musicContext) {
    return;
  }
  if (musicContext.state === "suspended") {
    try {
      await musicContext.resume();
    } catch {
      return;
    }
  }
  const buffer = await loadMusicBuffer();
  if (!musicContext || musicContext.state !== "running" || !buffer) {
    return;
  }
  if (!musicEnabled || state !== "playing" || document.hidden) {
    return;
  }
  startWebAudioPlayback();
}

function startMusicPlayback() {
  if (!musicEnabled || state !== "playing" || document.hidden) {
    return;
  }
  syncWorldAudioProfile(true);
  startHtmlAudioPlayback();
  void enhanceWithWebAudioIfReady();
}

function unlockMusicFromGesture() {
  if (!musicEnabled || musicUnlocked) {
    return;
  }
  musicUnlocked = true;
  ensureMusicContext();
  resumeMusicContextSync();
  void loadMusicBuffer();
}

function registerMusicGestureUnlock() {
  const onGesture = () => {
    ensureMusicContext();
    resumeMusicContextSync();
    if (!musicUnlocked) {
      musicUnlocked = true;
      void loadMusicBuffer();
    }
    startMusicPlayback();
  };
  document.addEventListener("pointerdown", onGesture, { passive: true });
  document.addEventListener("keydown", onGesture);
}

function updateMusicButton() {
  if (!musicToggleBtn) {
    return;
  }
  musicToggleBtn.classList.toggle("is-muted", !musicEnabled);
  if (musicToggleLabel) {
    musicToggleLabel.textContent = musicEnabled ? "Music on" : "Music off";
  }
  musicToggleBtn.setAttribute("aria-label", musicEnabled ? "Turn music off" : "Turn music on");
}

async function openGameMenu() {
  if (!gameMenu || !menuBackdrop) {
    return;
  }
  if (isSmallScreen() && isFullscreenActive()) {
    await ensureLandscape();
  }
  gameMenu.classList.add("open");
  gameMenu.setAttribute("aria-hidden", "false");
  menuBackdrop.hidden = false;
  document.documentElement.classList.add("menu-open");
  document.body.classList.add("menu-open");
  menuToggleBtn?.setAttribute("aria-expanded", "true");
}

function closeGameMenu() {
  if (!gameMenu || !menuBackdrop) {
    return;
  }
  gameMenu.classList.remove("open");
  gameMenu.setAttribute("aria-hidden", "true");
  menuBackdrop.hidden = true;
  document.documentElement.classList.remove("menu-open");
  document.body.classList.remove("menu-open");
  menuToggleBtn?.setAttribute("aria-expanded", "false");
}

function toggleGameMenu() {
  if (gameMenu?.classList.contains("open")) {
    closeGameMenu();
  } else {
    openGameMenu();
  }
}

function updateMenuAlert() {
  if (!menuToggleBtn) {
    return;
  }
  const reviveReady = state === "gameover" && !reviveUsed && save.bankCoins >= REVIVE_COIN_COST;
  menuToggleBtn.classList.toggle("has-alert", reviveReady);
}

function isSmallScreen() {
  return window.matchMedia(
    "(max-width: 900px), (orientation: landscape) and (max-height: 500px)"
  ).matches;
}

function isStandaloneApp() {
  return (
    window.RunnerRushPwa?.isStandaloneApp?.() ??
    (window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true)
  );
}

function updateExitAppButton() {
  if (!exitAppBtn) {
    return;
  }
  exitAppBtn.hidden = !(isSmallScreen() && isStandaloneApp());
}

function getExitAppMessage() {
  if (window.RunnerRushPwa?.isIOS?.()) {
    return "Swipe up from the bottom of the screen to close Runner Rush, or press the Home button.";
  }
  if (window.RunnerRushPwa?.isAndroid?.()) {
    return "Use your device's back button, recent-apps button, or swipe up from the bottom to leave Runner Rush.";
  }
  return "Use your device's home or app-switcher gesture to leave Runner Rush.";
}

function showExitAppOverlay() {
  if (!exitAppOverlay) {
    return;
  }
  if (exitAppMessage) {
    exitAppMessage.textContent = getExitAppMessage();
  }
  exitAppOverlay.hidden = false;
  exitAppOverlay.classList.remove("hidden");
  exitAppDismissBtn?.focus();
}

function hideExitAppOverlay() {
  if (!exitAppOverlay) {
    return;
  }
  exitAppOverlay.hidden = true;
  exitAppOverlay.classList.add("hidden");
  if (isSmallScreen() && isStandaloneApp() && !isFullscreenActive()) {
    userDismissedMobileFullscreen = false;
    tryAutoMobileFullscreen();
  }
  ensureMusicPlayback();
  layoutCanvasStage();
  requestAnimationFrame(layoutCanvasStage);
}

async function exitApp() {
  closeGameMenu();
  pauseMusic();
  sprinting = false;

  try {
    window.open("", "_self");
    window.close();
  } catch {
    // Browsers block close when the page wasn't opened by script.
  }

  window.setTimeout(() => {
    if (document.visibilityState !== "hidden") {
      showExitAppOverlay();
    }
  }, 250);
}

function useLandscapeCanvasLayout() {
  return isLandscape() && window.matchMedia("(max-height: 900px)").matches;
}

function usePortraitCanvasHud() {
  return isPortrait();
}

function useCanvasHudLayout() {
  return useLandscapeCanvasLayout() || usePortraitCanvasHud();
}

function isPortrait() {
  return window.matchMedia("(orientation: portrait)").matches;
}

function isLandscape() {
  return window.matchMedia("(orientation: landscape)").matches;
}

function isNativeFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

let pseudoFullscreen = false;
let userDismissedMobileFullscreen = false;

function isFullscreenActive() {
  return isNativeFullscreen() || pseudoFullscreen;
}

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function canUseNativeFullscreen() {
  if (isIOS()) {
    return false;
  }
  const root = document.documentElement;
  return !!(root.requestFullscreen || root.webkitRequestFullscreen);
}

const FULLSCREEN_ENTER_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
const FULLSCREEN_EXIT_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>';

function updateFullscreenButton() {
  if (!fullscreenBtn) {
    return;
  }
  if (isSmallScreen()) {
    fullscreenBtn.hidden = true;
    return;
  }
  fullscreenBtn.hidden = false;
  const active = isFullscreenActive();
  fullscreenBtn.innerHTML = active ? FULLSCREEN_EXIT_ICON : FULLSCREEN_ENTER_ICON;
  fullscreenBtn.setAttribute("aria-label", active ? "Exit fullscreen" : "Enter fullscreen");
}

function applyForceLandscape() {
  if (isLandscape()) {
    clearForceLandscape();
    return;
  }
  canvasWrap?.classList.add("force-landscape");
  document.documentElement.classList.add("force-landscape-active");
  document.body.classList.add("force-landscape-active");
  requestAnimationFrame(() => {
    layoutCanvasStage();
    requestAnimationFrame(layoutCanvasStage);
  });
}

function clearForceLandscape() {
  canvasWrap?.classList.remove("force-landscape");
  document.documentElement.classList.remove("force-landscape-active");
  document.body.classList.remove("force-landscape-active");
}

async function ensureLandscape() {
  if (!isSmallScreen() || !isFullscreenActive()) {
    return;
  }
  if (isLandscape()) {
    clearForceLandscape();
    layoutCanvasStage();
    return;
  }
  await lockLandscape();
  // Re-check after lock: some browsers report success without actually rotating.
  if (isLandscape()) {
    clearForceLandscape();
  } else if (isPortrait()) {
    applyForceLandscape();
  }
  requestAnimationFrame(() => {
    layoutCanvasStage();
    requestAnimationFrame(layoutCanvasStage);
  });
}

async function lockLandscape() {
  if (!screen.orientation?.lock) {
    return false;
  }
  for (const mode of ["landscape-primary", "landscape", "landscape-secondary"]) {
    try {
      await screen.orientation.lock(mode);
      return true;
    } catch {
      // Try the next lock mode supported by this browser.
    }
  }
  return false;
}

function unlockOrientation() {
  try {
    screen.orientation?.unlock?.();
  } catch {
    // Ignore unlock failures.
  }
}

async function tryNativeFullscreen() {
  const targets = isSmallScreen()
    ? [document.documentElement, document.body, gameShell]
    : [document.documentElement, document.body, gameShell];
  for (const target of targets) {
    if (!target) {
      continue;
    }
    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen({ navigationUI: "hide" });
        if (isNativeFullscreen()) {
          return true;
        }
      }
      if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen();
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (isNativeFullscreen()) {
          return true;
        }
      }
    } catch {
      // Try the next fullscreen target.
    }
  }
  return false;
}

async function enterFullscreen() {
  if (canUseNativeFullscreen()) {
    const entered = await tryNativeFullscreen();
    if (entered) {
      return;
    }
  }
  enterPseudoFullscreen();
}

async function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    }
  } catch {
    // Ignore exit failures.
  }
}

function onEnterFullscreenMode() {
  gameShell?.classList.add("is-fullscreen");
  if (isSmallScreen()) {
    gameShell?.classList.add("canvas-only-fs");
    ensureLandscape();
    setTimeout(() => {
      ensureLandscape();
      layoutCanvasStage();
    }, 300);
  }
  layoutCanvasStage();
  updateFullscreenButton();
}

function onExitFullscreenMode() {
  clearForceLandscape();
  gameShell?.classList.remove("is-fullscreen", "canvas-only-fs");
  unlockOrientation();
  layoutCanvasStage();
  updateFullscreenButton();
}

function enterPseudoFullscreen() {
  if (pseudoFullscreen) {
    return;
  }
  pseudoFullscreen = true;
  document.documentElement.classList.add("pseudo-fullscreen-active");
  document.body.classList.add("pseudo-fullscreen-active");
  window.scrollTo(0, 0);
  onEnterFullscreenMode();
  requestAnimationFrame(() => {
    layoutCanvasStage();
    requestAnimationFrame(layoutCanvasStage);
  });
}

function exitPseudoFullscreen() {
  if (!pseudoFullscreen) {
    return;
  }
  pseudoFullscreen = false;
  document.documentElement.classList.remove("pseudo-fullscreen-active");
  document.body.classList.remove("pseudo-fullscreen-active");
  onExitFullscreenMode();
}

async function tryAutoMobileFullscreen() {
  if (!isSmallScreen() || userDismissedMobileFullscreen) {
    return;
  }

  if (!isFullscreenActive()) {
    await enterFullscreen();
  }

  if (isFullscreenActive()) {
    await ensureLandscape();
    layoutCanvasStage();
  }
}

function scheduleAutoMobileFullscreen() {
  if (!isSmallScreen() || userDismissedMobileFullscreen) {
    return;
  }
  tryAutoMobileFullscreen();
  requestAnimationFrame(tryAutoMobileFullscreen);
  setTimeout(tryAutoMobileFullscreen, 300);
}

function registerMobileFullscreenFallback() {
  const retry = () => {
    tryAutoMobileFullscreen();
  };
  document.addEventListener("pointerdown", retry, { once: true, passive: true });
  document.addEventListener("touchstart", retry, { once: true, passive: true });
  document.addEventListener("keydown", retry, { once: true });
}

function layoutCanvasStage() {
  if (!canvasStage || !canvasWrap || !gameShell) {
    return;
  }

  const isFs = gameShell.classList.contains("is-fullscreen");
  const forceLandscape = canvasWrap.classList.contains("force-landscape");

  if (!isFs && !forceLandscape) {
    let width = Math.floor(window.innerWidth * 0.6);
    width = Math.min(Math.max(width, 280), 960);
    let height = Math.floor(width / GAME_ASPECT);

    const hudReserve = (scorePanel?.offsetHeight || 0) + 48;
    const maxHeight = Math.floor(window.innerHeight - hudReserve);
    if (height > maxHeight && maxHeight >= 90) {
      height = maxHeight;
      width = Math.floor(height * GAME_ASPECT);
    }

    width = Math.max(160, width);
    height = Math.max(90, height);

    canvasStage.style.width = `${width}px`;
    canvasStage.style.height = `${height}px`;
    if (scorePanel) {
      scorePanel.style.width = usePortraitCanvasHud() ? "" : `${width}px`;
    }
    return;
  }

  if (isFs && forceLandscape) {
    canvasStage.style.width = "100%";
    canvasStage.style.height = "100%";
    if (scorePanel) {
      scorePanel.style.width = "";
    }
    return;
  }

  const portraitFs =
    isFs && isPortrait() && !forceLandscape && gameShell.classList.contains("canvas-only-fs");
  const shellStyle = getComputedStyle(gameShell);
  const shellPadX =
    (parseFloat(shellStyle.paddingLeft) || 0) + (parseFloat(shellStyle.paddingRight) || 0);
  const shellPadY =
    (parseFloat(shellStyle.paddingTop) || 0) + (parseFloat(shellStyle.paddingBottom) || 0);

  let maxW = Math.max(160, gameShell.clientWidth - shellPadX);
  let maxH = Math.max(90, gameShell.clientHeight - shellPadY);

  if (portraitFs && scorePanel) {
    maxH -= (scorePanel.offsetHeight || 48) + 8;
  }

  let width;
  let height;
  if (isPortrait() && !forceLandscape) {
    width = maxW;
    height = width / GAME_ASPECT;
    if (height > maxH) {
      height = maxH;
      width = height * GAME_ASPECT;
    }
  } else {
    height = maxH;
    width = height * GAME_ASPECT;
    if (width > maxW) {
      width = maxW;
      height = width / GAME_ASPECT;
    }
  }

  const w = Math.max(160, Math.floor(width));
  const h = Math.max(90, Math.floor(height));
  canvasStage.style.width = `${w}px`;
  canvasStage.style.height = `${h}px`;
  if (scorePanel) {
    scorePanel.style.width = isLandscape() ? `${w}px` : "";
  }
}

function handleFullscreenChange() {
  if (isNativeFullscreen()) {
    onEnterFullscreenMode();
  } else if (!pseudoFullscreen) {
    onExitFullscreenMode();
  }
}

async function toggleFullscreen() {
  if (isFullscreenActive()) {
    if (isSmallScreen()) {
      userDismissedMobileFullscreen = true;
    }
    if (isNativeFullscreen()) {
      await exitFullscreen();
    }
    if (pseudoFullscreen) {
      exitPseudoFullscreen();
    }
  } else {
    if (isSmallScreen()) {
      userDismissedMobileFullscreen = false;
    }
    await enterFullscreen();
  }
}

async function handleOrientationChange() {
  if (isLandscape()) {
    clearForceLandscape();
  }
  await tryAutoMobileFullscreen();
  if (!isFullscreenActive() || !isLandscape()) {
    layoutCanvasStage();
  }
}

layoutCanvasStage();
requestAnimationFrame(() => {
  layoutCanvasStage();
  scheduleAutoMobileFullscreen();
  requestAnimationFrame(layoutCanvasStage);
});
scheduleAutoMobileFullscreen();
registerMobileFullscreenFallback();

function applyMusicSettings() {
  if (musicGainNode) {
    musicGainNode.gain.value = musicEnabled && musicWebAudioActive ? 0.35 : 0;
  }
  if (!bgMusic) {
    return;
  }
  bgMusic.muted = !musicEnabled;
  if (!musicEnabled) {
    stopHtmlAudioPlayback();
  }
}

function ensureMusicPlayback() {
  startMusicPlayback();
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  localStorage.setItem(musicPrefKey, String(musicEnabled));
  applyMusicSettings();
  updateMusicButton();
  if (musicEnabled) {
    unlockMusicFromGesture();
    startMusicPlayback();
  } else {
    pauseMusic();
  }
}

function currentStageConfig() {
  if (endlessMode) {
    return ENDLESS_CONFIG;
  }
  return STAGES[save.currentStage - 1];
}

function isFrostStage() {
  return !endlessMode && currentStageConfig().slippery === true;
}

function isWorld3Stage() {
  return !endlessMode && save.currentStage >= WORLD3_START && save.currentStage < WORLD4_START;
}

function isThawStage() {
  return isWorld3Stage() && currentStageConfig().biome === "ash";
}

function isPureFrostStage() {
  return isWorld3Stage() && currentStageConfig().biome === "frost";
}

function isSwimmingStage() {
  return !endlessMode && currentStageConfig().swimming === true;
}

function isVolcanicStage() {
  return !endlessMode && currentStageConfig().volcanic === true;
}

function heatPulseInterval() {
  return Math.max(210, 370 - (save.currentStage - WORLD5_START) * 15);
}

function resetHeatPulse() {
  heatPulseTimer = isVolcanicStage() ? heatPulseInterval() : 0;
  heatPulseWarning = 0;
}

function updateHeatPulse() {
  if (!isVolcanicStage()) {
    return;
  }
  if (heatPulseWarning > 0) {
    heatPulseWarning -= 1;
    if (heatPulseWarning === 0) {
      const caughtInSurge =
        player.grounded && !player.sliding && player.y + player.h >= groundY - 6;
      if (caughtInSurge) {
        if (player.shieldTimer > 0) {
          player.shieldTimer = 0;
          emitDust(player.x + player.w * 0.5, groundY - 4, true);
        } else {
          registerGameOver();
          return;
        }
      }
      heatPulseTimer = heatPulseInterval();
    }
    return;
  }
  heatPulseTimer -= 1;
  if (heatPulseTimer <= 0) {
    heatPulseWarning = HEAT_PULSE_WARN_FRAMES;
  }
}

function applyStageWorldTransition(prevStage) {
  const nextStage = currentStageConfig();
  const modeChanged =
    !!prevStage?.swimming !== !!nextStage.swimming ||
    !!prevStage?.volcanic !== !!nextStage.volcanic ||
    !!prevStage?.flying !== !!nextStage.flying ||
    !!prevStage?.slippery !== !!nextStage.slippery;
  if (!modeChanged) {
    return;
  }
  obstacles = obstacles.filter((obs) => obs.x <= player.x + 36);
  resetPlayerPosition();
  resetHeatPulse();
}

function frostSlipStrength() {
  if (!isFrostStage()) {
    return 0;
  }
  if (isThawStage()) {
    const thawIndex = save.currentStage - (WORLD3_START + 4);
    return Math.max(0.18, 0.52 - thawIndex * 0.09);
  }
  return Math.min(1, 0.28 + (save.currentStage - WORLD3_START) * 0.18);
}

function getPendingWorldIntro() {
  if (endlessMode) {
    return null;
  }
  if (save.currentStage === WORLD2_START && localStorage.getItem(world2IntroKey) !== "1") {
    return 2;
  }
  if (save.currentStage === WORLD3_START && localStorage.getItem(world3IntroKey) !== "1") {
    return 3;
  }
  if (save.currentStage === WORLD4_START && localStorage.getItem(world4IntroKey) !== "1") {
    return 4;
  }
  if (save.currentStage === WORLD5_START && localStorage.getItem(world5IntroKey) !== "1") {
    return 5;
  }
  return null;
}

function markWorldIntroSeen(worldId) {
  if (worldId === 2) {
    localStorage.setItem(world2IntroKey, "1");
  }
  if (worldId === 3) {
    localStorage.setItem(world3IntroKey, "1");
  }
  if (worldId === 4) {
    localStorage.setItem(world4IntroKey, "1");
  }
  if (worldId === 5) {
    localStorage.setItem(world5IntroKey, "1");
  }
}

function dismissWorldIntro() {
  if (activeWorldIntro !== null) {
    markWorldIntroSeen(activeWorldIntro);
  }
  activeWorldIntro = null;
  if (worldIntroBeforeRun) {
    worldIntroBeforeRun = false;
    unlockMusicFromGesture();
    startRun();
    return;
  }
  setState("playing");
  unlockMusicFromGesture();
  startMusicPlayback();
}

function beginWorldIntroIfNeeded() {
  const pending = getPendingWorldIntro();
  if (pending === null) {
    setState("playing");
    return;
  }
  activeWorldIntro = pending;
  setState("worldintro");
}

function resetPlayerPosition() {
  if (isSwimmingStage()) {
    player.y = WATER_TOP + (WATER_BOTTOM - WATER_TOP - player.h) * 0.42;
    player.vy = 0;
    player.grounded = false;
  } else {
    player.y = groundY - player.h;
    player.vy = 0;
    player.grounded = true;
  }
  player.sliding = false;
  player.slideTimer = 0;
  player.shieldTimer = 0;
}

function randomWaterY(minHeight) {
  const top = WATER_TOP + 10;
  const bottom = WATER_BOTTOM - minHeight - 10;
  return top + Math.random() * Math.max(24, bottom - top);
}

function endlessRunScore() {
  return Math.max(0, Math.floor(score - stageStartScore));
}

function persistSave() {
  if (previewMode) {
    return;
  }
  localStorage.setItem(saveKey, JSON.stringify(save));
}

function jumpUpgradeCost() {
  return 120 + (save.jumpLevel - 1) * 90;
}

function magnetUpgradeCost() {
  return 120 + save.magnetLevel * 100;
}

function currentJumpForce() {
  return baseJumpForce - Math.min(3.2, (save.jumpLevel - 1) * 0.58);
}

function magnetRange() {
  return 68 + save.magnetLevel * 34;
}

function currentHitbox() {
  if (player.sliding) {
    return { x: player.x + 2, y: player.y + 22, w: player.w, h: player.h - 22 };
  }
  return { x: player.x + 2, y: player.y, w: player.w, h: player.h };
}

function updateHud() {
  const stage = currentStageConfig();
  const scoreNow = Math.floor(score);
  const stageProgress = endlessMode ? endlessRunScore() : Math.max(0, Math.floor(score - stageStartScore));
  scoreEl.textContent = String(scoreNow);
  coinsRunEl.textContent = String(runCoins);
  bestScoreEl.textContent = String(save.bestScore);
  bankCoinsEl.textContent = String(save.bankCoins);
  if (endlessMode) {
    levelEl.textContent = "∞";
    missionEl.textContent = `${stageProgress} · best ${save.endlessBest}`;
  } else {
    levelEl.textContent = `${save.currentStage}/${STAGES.length}`;
    const goal = stageTargetScore();
    const capped = Math.min(stageProgress, goal);
    missionEl.textContent = `${stage.name} · ${capped}/${goal}`;
  }
  if (upgradeJumpMeta) {
    upgradeJumpMeta.textContent = String(jumpUpgradeCost());
  }
  if (upgradeMagnetMeta) {
    upgradeMagnetMeta.textContent = String(magnetUpgradeCost());
  }
  if (endlessBtn) {
    endlessBtn.hidden = !save.endlessUnlocked || endlessMode;
    endlessBtn.disabled = state === "playing";
  }
  if (campaignBtn) {
    campaignBtn.hidden = !endlessMode;
    campaignBtn.disabled = state === "playing";
  }
  if (campaignStageMeta) {
    campaignStageMeta.textContent = `Stage ${save.currentStage}`;
  }
  updateMenuAlert();
}

function updateRestartLabel(text) {
  if (restartLabel) {
    restartLabel.textContent = text;
  }
}

function markOverlayShown() {
  overlayEpoch += 1;
  overlayShownAt = performance.now();
}

function overlayContinueReady() {
  return performance.now() - overlayShownAt >= OVERLAY_READ_MS;
}

function getOverlayContinueButton() {
  const w = Math.min(220, canvas.width * 0.48);
  const h = 44;
  const x = (canvas.width - w) / 2;
  let y = canvas.height / 2 + 56;
  if (state === "worldintro") {
    y = canvas.height / 2 + 88;
  } else if (state === "stageclear") {
    y = canvas.height / 2 + 72;
  }
  return { x, y, w, h };
}

function overlayContinueLabel() {
  if (state === "gameover") {
    return "Try again";
  }
  if (state === "stageclear") {
    return save.currentStage >= STAGES.length && save.endlessUnlocked ? "Endless mode" : "Continue";
  }
  return "Continue";
}

function canvasPointFromOffset(offsetX, offsetY) {
  const scaleX = canvas.width / canvas.offsetWidth;
  const scaleY = canvas.height / canvas.offsetHeight;
  return { x: offsetX * scaleX, y: offsetY * scaleY };
}

function isPointInOverlayButton(offsetX, offsetY) {
  const point = canvasPointFromOffset(offsetX, offsetY);
  const btn = getOverlayContinueButton();
  return (
    point.x >= btn.x &&
    point.x <= btn.x + btn.w &&
    point.y >= btn.y &&
    point.y <= btn.y + btn.h
  );
}

function drawOverlayContinueButton() {
  const ready = overlayContinueReady();
  const btn = getOverlayContinueButton();
  const radius = 10;

  ctx.beginPath();
  ctx.moveTo(btn.x + radius, btn.y);
  ctx.lineTo(btn.x + btn.w - radius, btn.y);
  ctx.quadraticCurveTo(btn.x + btn.w, btn.y, btn.x + btn.w, btn.y + radius);
  ctx.lineTo(btn.x + btn.w, btn.y + btn.h - radius);
  ctx.quadraticCurveTo(btn.x + btn.w, btn.y + btn.h, btn.x + btn.w - radius, btn.y + btn.h);
  ctx.lineTo(btn.x + radius, btn.y + btn.h);
  ctx.quadraticCurveTo(btn.x, btn.y + btn.h, btn.x, btn.y + btn.h - radius);
  ctx.lineTo(btn.x, btn.y + radius);
  ctx.quadraticCurveTo(btn.x, btn.y, btn.x + radius, btn.y);
  ctx.closePath();

  ctx.fillStyle = ready ? "rgba(0, 0, 0, 0.18)" : "rgba(0, 0, 0, 0.08)";
  ctx.fill();
  ctx.strokeStyle = ready ? "rgba(255, 255, 255, 0.62)" : "rgba(255, 255, 255, 0.32)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = `16px ${FONT_UI}`;
  ctx.fillStyle = ready ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.45)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(overlayContinueLabel(), btn.x + btn.w / 2, btn.y + btn.h / 2);
}

function tryOverlayContinue(offsetX, offsetY) {
  if (state !== "gameover" && state !== "worldintro" && state !== "stageclear") {
    return false;
  }
  if (pointerOverlayEpoch !== overlayEpoch) {
    return true;
  }
  if (!overlayContinueReady()) {
    return true;
  }
  if (!isPointInOverlayButton(offsetX, offsetY)) {
    return true;
  }
  if (state === "worldintro") {
    dismissWorldIntro();
  } else {
    restart();
  }
  return true;
}

function setState(nextState) {
  state = nextState;
  if (nextState === "gameover" || nextState === "worldintro" || nextState === "stageclear") {
    markOverlayShown();
  }
  const playing = nextState === "playing";
  restartBtn.disabled = playing;
  restartStageZeroBtn.disabled = playing;
  reviveBtn.disabled = !(nextState === "gameover" && !reviveUsed && save.bankCoins >= REVIVE_COIN_COST);

  if (nextState === "gameover") {
    updateRestartLabel(endlessMode ? "Retry endless" : "Retry stage");
  } else if (nextState === "stageclear") {
    if (save.currentStage < STAGES.length) {
      updateRestartLabel("Next stage");
    } else if (save.endlessUnlocked && !endlessMode) {
      updateRestartLabel("Endless mode");
    } else {
      updateRestartLabel("Play again");
    }
  } else {
    updateRestartLabel("Restart");
  }

  if (playing) {
    closeGameMenu();
    ensureMusicPlayback();
  } else {
    pauseMusic();
  }

  updateMenuAlert();
}

function emitDust(x, y, burst) {
  const count = burst ? 10 : 4;
  const snow = isFrostStage();
  const bubble = isSwimmingStage();
  const ember = isVolcanicStage();
  for (let i = 0; i < count; i += 1) {
    dustParticles.push({
      x: x + Math.random() * 14 - 7,
      y: y + Math.random() * 4 - 2,
      vx: (Math.random() - 0.5) * 1.8 - speed * 0.09,
      vy: bubble ? -0.6 - Math.random() * 1.4 : ember ? -0.8 - Math.random() * 1.6 : -Math.random() * (burst ? 1.7 : 0.9),
      life: burst ? 30 : 18,
      size: 2 + Math.random() * (burst ? 4 : 2),
      snow,
      bubble,
      ember,
    });
  }
}

function collectRunRewards(completedStage) {
  const stageBonus = completedStage ? 80 + save.currentStage * 14 : 0;
  const earnedCoins = Math.max(0, runCoins - rewardCheckpointCoins);
  const earnedScore = Math.max(0, Math.floor((score - rewardCheckpointScore) / 24));
  const earned = earnedCoins + earnedScore + stageBonus;
  save.bankCoins += earned;
  save.totalCoins += earnedCoins;
  rewardCheckpointCoins = runCoins;
  rewardCheckpointScore = score;
  if (Math.floor(score) > save.bestScore) {
    save.bestScore = Math.floor(score);
  }
}

function startEndlessRun() {
  if (!save.endlessUnlocked) {
    return;
  }
  endlessMode = true;
  startRun();
}

function exitEndlessMode() {
  if (!endlessMode) {
    return;
  }
  endlessMode = false;
  closeGameMenu();
  if (state === "playing") {
    return;
  }
  setState("menu");
  updateHud();
}

function startRun(options = {}) {
  const stage = currentStageConfig();
  obstacles = [];
  coins = [];
  powerups = [];
  dustParticles = [];
  score = 0;
  runCoins = 0;
  stageStartScore = 0;
  rewardCheckpointScore = 0;
  rewardCheckpointCoins = 0;
  speed = stage.startSpeed;
  frame = 0;
  obstacleTimer = -140;
  coinTimer = 0;
  powerupTimer = 0;
  reviveUsed = false;
  resetPlayerPosition();
  resetHeatPulse();
  if (options.continueAfterClear) {
    player.shieldTimer = STAGE_CLEAR_SHIELD_FRAMES;
  }
  syncWorldAudioProfile(true);
  beginWorldIntroIfNeeded();
  updateHud();
}

function restart() {
  const continuingStage = state === "stageclear";
  if (continuingStage) {
    if (save.currentStage >= STAGES.length && save.endlessUnlocked && !endlessMode) {
      endlessMode = true;
    } else if (save.currentStage > STAGES.length) {
      save.currentStage = STAGES.length;
      endlessMode = false;
    }
    persistSave();
  }
  startRun({ continueAfterClear: continuingStage && save.currentStage <= STAGES.length });
}

function restartFromStageZero() {
  if (state === "playing") {
    return;
  }
  save.currentStage = 1;
  save.unlockedStage = 1;
  endlessMode = false;
  persistSave();
  startRun();
}

function resetEverything() {
  const accepted = window.confirm("Reset all progress, coins, and upgrades? This cannot be undone.");
  if (!accepted) {
    return;
  }

  Object.assign(save, defaultSave);
  endlessMode = false;
  localStorage.removeItem(world2IntroKey);
  localStorage.removeItem(world3IntroKey);
  localStorage.removeItem(world4IntroKey);
  localStorage.removeItem(world5IntroKey);
  persistSave();

  obstacles = [];
  coins = [];
  powerups = [];
  dustParticles = [];
  score = 0;
  runCoins = 0;
  stageStartScore = 0;
  rewardCheckpointScore = 0;
  rewardCheckpointCoins = 0;
  speed = currentStageConfig().startSpeed;
  frame = 0;
  obstacleTimer = 0;
  coinTimer = 0;
  powerupTimer = 0;
  reviveUsed = false;
  sprinting = false;

  resetPlayerPosition();

  setState("menu");
  updateHud();
}

function revive() {
  if (state !== "gameover" || reviveUsed || save.bankCoins < REVIVE_COIN_COST) {
    return;
  }
  save.bankCoins -= REVIVE_COIN_COST;
  reviveUsed = true;
  player.shieldTimer = 160;
  obstacles = obstacles.filter((obs) => obs.x > player.x + 45);
  resetPlayerPosition();
  persistSave();
  setState("playing");
  updateHud();
}

function jump() {
  unlockMusicFromGesture();
  if (state === "menu") {
    endlessMode = false;
    startRun();
    return;
  }
  if (state !== "playing") {
    return;
  }
  if (isSwimmingStage()) {
    player.vy = SWIM_UP_FORCE;
    emitDust(player.x + player.w * 0.5, player.y + player.h * 0.55, true);
    return;
  }
  if (!player.grounded) {
    return;
  }
  player.vy = currentJumpForce();
  player.grounded = false;
}

function slide() {
  if (state !== "playing") {
    return;
  }
  if (isSwimmingStage()) {
    player.vy = SWIM_DOWN_FORCE;
    player.sliding = true;
    player.slideTimer = 22;
    emitDust(player.x + player.w * 0.5, player.y + 8, false);
    return;
  }
  if (!player.grounded || player.sliding) {
    return;
  }
  player.sliding = true;
  const frostBonus = isFrostStage() ? Math.floor(8 + frostSlipStrength() * 18) : 0;
  player.slideTimer = 30 + frostBonus;
}

function tryBuyJumpUpgrade() {
  const cost = jumpUpgradeCost();
  if (save.bankCoins < cost) {
    return;
  }
  save.bankCoins -= cost;
  save.jumpLevel += 1;
  persistSave();
  updateHud();
}

function tryBuyMagnetUpgrade() {
  const cost = magnetUpgradeCost();
  if (save.bankCoins < cost) {
    return;
  }
  save.bankCoins -= cost;
  save.magnetLevel += 1;
  persistSave();
  updateHud();
}

function spawnFlyingObstacle(stageIndex) {
  const roll = Math.random();
  let type;
  let w;
  let h;
  let baseY;

  if (stageIndex >= STAGES.length - 1 && roll < 0.22) {
    type = "fly_serpent";
    w = 50;
    h = 24;
    baseY = groundY - 88;
  } else if (roll < 0.34) {
    type = "fly_bat";
    w = 36;
    h = 26;
    baseY = groundY - 66;
  } else if (roll < 0.64) {
    type = "fly_hawk";
    w = 42;
    h = 30;
    baseY = groundY - 112;
  } else if (roll < 0.84) {
    type = "fly_drone";
    w = 34;
    h = 30;
    baseY = groundY - 54;
  } else {
    type = "fly_serpent";
    w = 48;
    h = 22;
    baseY = groundY - 82;
  }

  obstacles.push({
    x: canvas.width + 20,
    y: baseY,
    baseY,
    w,
    h,
    type,
    flying: true,
    phase: Math.random() * Math.PI * 2,
  });
}

function spawnAquaticObstacle(stageIndex) {
  const roll = Math.random();
  if (stageIndex >= STAGES.length - 1 && roll < 0.18) {
    const h = 24;
    const baseY = randomWaterY(h + 20);
    obstacles.push({
      x: canvas.width + 20,
      y: baseY,
      baseY,
      w: 52,
      h,
      type: "swim_leviathan",
      aquatic: true,
      phase: Math.random() * Math.PI * 2,
    });
    return;
  }
  if (roll < 0.26) {
    const h = 30;
    const baseY = randomWaterY(h + 12);
    obstacles.push({
      x: canvas.width + 20,
      y: baseY,
      baseY,
      w: 34,
      h,
      type: "swim_jelly",
      aquatic: true,
      phase: Math.random() * Math.PI * 2,
    });
  } else if (roll < 0.52) {
    const h = 48 + Math.floor(Math.random() * 36);
    obstacles.push({
      x: canvas.width + 20,
      y: randomWaterY(h),
      w: 24,
      h,
      type: "swim_kelp",
    });
  } else if (roll < 0.78) {
    obstacles.push({
      x: canvas.width + 20,
      y: randomWaterY(36),
      w: 36,
      h: 36,
      type: "swim_rock",
    });
  } else {
    const h = 72 + Math.floor(Math.random() * 40);
    obstacles.push({
      x: canvas.width + 20,
      y: WATER_TOP + 6,
      w: 40,
      h,
      type: "swim_coral",
    });
  }
}

function spawnVolcanicObstacle(stageIndex) {
  const roll = Math.random();
  if (roll < 0.26) {
    obstacles.push({
      x: canvas.width + 20,
      y: groundY - 72,
      w: 30,
      h: 72,
      type: "fire_geyser",
    });
  } else if (roll < 0.5) {
    const h = 28;
    const baseY = groundY - 88 - Math.random() * 72;
    obstacles.push({
      x: canvas.width + 20,
      y: baseY,
      baseY,
      w: 34,
      h,
      type: "fire_ember",
      volcanic: true,
      phase: Math.random() * Math.PI * 2,
    });
  } else if (roll < 0.76) {
    obstacles.push({
      x: canvas.width + 20,
      y: groundY - 38,
      w: 36,
      h: 38,
      type: "fire_rock",
    });
  } else {
    obstacles.push({
      x: canvas.width + 20,
      y: groundY - 66,
      w: 34,
      h: 66,
      type: "fire_pillar",
    });
  }
}

function flyingSpawnChance(stageIndex) {
  if (stageIndex < WORLD4_START) {
    return 0;
  }
  if (endlessMode) {
    return 0.44;
  }
  return Math.min(0.62, 0.32 + (stageIndex - WORLD4_START) * 0.035);
}

function spawnFrostObstacle() {
  const roll = Math.random();
  if (roll < 0.24) {
    obstacles.push({ x: canvas.width + 20, y: groundY - 94, w: 40, h: 30, type: "high" });
    if (Math.random() < 0.45) {
      obstacles.push({ x: canvas.width + 66, y: groundY - 38, w: 28, h: 38, type: "low" });
    }
    return;
  }
  if (roll < 0.44) {
    obstacles.push({ x: canvas.width + 20, y: groundY - 36, w: 32, h: 36, type: "low" });
    obstacles.push({ x: canvas.width + 58, y: groundY - 88, w: 36, h: 28, type: "high" });
    return;
  }
  if (roll < 0.62) {
    obstacles.push({ x: canvas.width + 20, y: groundY - 70, w: 38, h: 70, type: "wall" });
    return;
  }
  if (roll < 0.8) {
    obstacles.push({ x: canvas.width + 20, y: groundY - 34, w: 30, h: 34, type: "low" });
  } else {
    obstacles.push({ x: canvas.width + 20, y: groundY - 86, w: 34, h: 24, type: "high" });
  }
}

function spawnThawObstacle() {
  const roll = Math.random();
  if (roll < 0.26) {
    obstacles.push({ x: canvas.width + 20, y: groundY - 72, w: 40, h: 72, type: "thaw_pillar" });
    return;
  }
  if (roll < 0.46) {
    obstacles.push({ x: canvas.width + 20, y: groundY - 34, w: 30, h: 34, type: "thaw_low" });
    obstacles.push({ x: canvas.width + 58, y: groundY - 90, w: 36, h: 28, type: "high" });
    return;
  }
  if (roll < 0.64) {
    obstacles.push({ x: canvas.width + 20, y: groundY - 34, w: 30, h: 34, type: "low" });
    obstacles.push({ x: canvas.width + 58, y: groundY - 86, w: 34, h: 24, type: "high" });
    return;
  }
  if (roll < 0.82) {
    obstacles.push({ x: canvas.width + 20, y: groundY - 66, w: 36, h: 66, type: "wall" });
  } else {
    obstacles.push({ x: canvas.width + 20, y: groundY - 38, w: 32, h: 38, type: "low" });
  }
}

function spawnObstacle() {
  const stage = currentStageConfig();
  const roll = Math.random();
  const stageIndex = endlessMode ? STAGES.length + 1 : save.currentStage;

  if (stage.boss && roll < (endlessMode ? 0.28 : 0.2)) {
    if (stage.volcanic) {
      const h = 46;
      const baseY = groundY - 96;
      obstacles.push({
        x: canvas.width + 20,
        y: baseY,
        baseY,
        w: stageIndex >= STAGES.length ? 58 : 50,
        h,
        type: stageIndex >= STAGES.length ? "fire_phoenix" : "fire_boss",
        volcanic: true,
        phase: Math.random() * Math.PI * 2,
      });
    } else if (stage.swimming) {
      const h = 42;
      const baseY = randomWaterY(h + 16);
      obstacles.push({
        x: canvas.width + 20,
        y: baseY,
        baseY,
        w: stageIndex >= STAGES_PER_WORLD * 2 ? 60 : 52,
        h,
        type: stageIndex >= STAGES_PER_WORLD * 2 ? "swim_leviathan" : "swim_boss",
        aquatic: true,
        phase: Math.random() * Math.PI * 2,
      });
    } else if (stage.flying) {
      obstacles.push({
        x: canvas.width + 20,
        y: groundY - 92,
        baseY: groundY - 92,
        w: stageIndex >= STAGES_PER_WORLD * 4 ? 58 : 52,
        h: stageIndex >= STAGES_PER_WORLD * 4 ? 36 : 40,
        type: "fly_boss",
        flying: true,
        phase: Math.random() * Math.PI * 2,
      });
    } else if (isWorld3Stage() && stage.slippery) {
      obstacles.push({
        x: canvas.width + 20,
        y: groundY - (stage.boss ? 88 : 80),
        w: stage.boss ? 48 : 44,
        h: stage.boss ? 88 : 80,
        type: stage.boss ? "frost_titan" : "boss",
      });
    } else {
      obstacles.push({
        x: canvas.width + 20,
        y: groundY - 80,
        w: 44,
        h: 80,
        type: "boss",
      });
    }
    return;
  }

  if (stage.volcanic) {
    spawnVolcanicObstacle(stageIndex);
    if (stageIndex >= STAGES.length - 4 && Math.random() < 0.2) {
      obstacles.push({
        x: canvas.width + 68,
        y: groundY - 34,
        w: 30,
        h: 34,
        type: "fire_rock",
      });
    }
    return;
  }

  if (stage.swimming) {
    spawnAquaticObstacle(stageIndex);
    if (stageIndex >= WORLD2_START + 5 && Math.random() < 0.22) {
      obstacles.push({
        x: canvas.width + 72,
        y: randomWaterY(28),
        w: 28,
        h: 28,
        type: "swim_rock",
      });
    }
    return;
  }

  if (isWorld3Stage()) {
    if (isPureFrostStage()) {
      spawnFrostObstacle();
    } else {
      spawnThawObstacle();
    }
    return;
  }

  if (stageIndex >= WORLD4_START && roll < flyingSpawnChance(stageIndex)) {
    spawnFlyingObstacle(stageIndex);
    if (stageIndex >= WORLD4_START + 3 && Math.random() < 0.24) {
      obstacles.push({ x: canvas.width + 72, y: groundY - 34, w: 30, h: 34, type: "low" });
    }
    return;
  }
  if (roll < 0.45) {
    obstacles.push({ x: canvas.width + 20, y: groundY - 34, w: 30, h: 34, type: "low" });
  } else if (roll < 0.82) {
    obstacles.push({ x: canvas.width + 20, y: groundY - 86, w: 34, h: 24, type: "high" });
  } else {
    obstacles.push({ x: canvas.width + 20, y: groundY - 62, w: 34, h: 62, type: "wall" });
  }
}

function spawnCoin() {
  if (isSwimmingStage()) {
    coins.push({ x: canvas.width + 12, y: randomWaterY(18), r: 9 });
    return;
  }
  const lane = Math.random();
  const coinY = lane < 0.34 ? groundY - 102 : lane < 0.68 ? groundY - 68 : groundY - 38;
  coins.push({ x: canvas.width + 12, y: coinY, r: 9 });
}

function spawnPowerup() {
  const powerY = isSwimmingStage() ? randomWaterY(22) : groundY - 96;
  powerups.push({ x: canvas.width + 20, y: powerY, w: 22, h: 22, kind: "shield" });
}

function rectHit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function registerGameOver() {
  if (endlessMode) {
    const runScore = endlessRunScore();
    if (runScore > save.endlessBest) {
      save.endlessBest = runScore;
    }
  }
  collectRunRewards(false);
  persistSave();
  setState("gameover");
  updateHud();
}

function registerStageClear() {
  collectRunRewards(true);
  if (save.currentStage < STAGES.length) {
    const prevStage = STAGES[save.currentStage - 1];
    if (save.unlockedStage === save.currentStage) {
      save.unlockedStage += 1;
    }
    save.currentStage += 1;
    persistSave();
    applyStageWorldTransition(prevStage);
    updateHud();
    const pendingIntro = getPendingWorldIntro();
    if (pendingIntro !== null) {
      activeWorldIntro = pendingIntro;
      setState("worldintro");
    } else {
      setState("stageclear");
    }
    return;
  }

  save.endlessUnlocked = true;
  persistSave();
  setState("stageclear");
  updateHud();
}

function update() {
  if (state !== "playing") {
    return;
  }
  const stage = currentStageConfig();
  const currentSpeed = speed + (sprinting ? 1.8 : 0);
  frame += 1;
  obstacleTimer += 1;
  coinTimer += 1;
  powerupTimer += 1;

  const wasGrounded = player.grounded;
  if (isSwimmingStage()) {
    player.vy += WATER_SINK;
    player.vy *= WATER_DRAG;
    player.y += player.vy;
    if (player.y < WATER_TOP) {
      player.y = WATER_TOP;
      player.vy = Math.max(0, player.vy * 0.35);
    }
    if (player.y + player.h > WATER_BOTTOM) {
      player.y = WATER_BOTTOM - player.h;
      player.vy = Math.min(0, player.vy * 0.35);
    }
    player.grounded = false;
  } else {
    player.vy += gravity;
    player.y += player.vy;
    if (player.y + player.h >= groundY) {
      player.y = groundY - player.h;
      const landingImpact = Math.abs(player.vy);
      player.vy = 0;
      if (!wasGrounded) {
        emitDust(player.x + player.w * 0.5, groundY, true);
        if (isFrostStage() && landingImpact > 1.4) {
          player.sliding = true;
          player.slideTimer = Math.max(
            player.slideTimer,
            Math.floor(8 + frostSlipStrength() * 9),
          );
        }
      }
      player.grounded = true;
    }
  }

  if (player.sliding) {
    player.slideTimer -= 1;
    if (player.slideTimer <= 0) {
      player.sliding = false;
    }
  }
  if (player.shieldTimer > 0) {
    player.shieldTimer -= 1;
  }

  updateHeatPulse();
  if (state !== "playing") {
    return;
  }

  const stageProgressScore = Math.max(0, score - stageStartScore);
  const spawnThreshold = Math.max(
    endlessMode ? 22 : 38,
    stage.spawn - Math.floor(stageProgressScore * (endlessMode ? 0.018 : 0.01)),
  );
  const earlySpawnBonus = frame < 420 ? Math.floor((420 - frame) / 12) : 0;
  const adjustedSpawnThreshold = spawnThreshold + earlySpawnBonus;
  if (frame > EARLY_OBSTACLE_GRACE_FRAMES && obstacleTimer > adjustedSpawnThreshold) {
    spawnObstacle();
    obstacleTimer = 0;
  }
  if (coinTimer > 24) {
    spawnCoin();
    coinTimer = 0;
  }
  if (powerupTimer > 520 && Math.random() < 0.25) {
    spawnPowerup();
    powerupTimer = 0;
  }

  speed += stage.accel;
  if (endlessMode) {
    speed = Math.min(9.4, speed);
  }
  score += SCORE_BASE_PER_FRAME + currentSpeed * SCORE_SPEED_FACTOR;
  if (isVolcanicStage() && frame % 12 === 0) {
    emitDust(player.x + 10, player.y + player.h - 6, false);
  } else if (isSwimmingStage() && frame % 16 === 0) {
    emitDust(player.x + 34, player.y + 18, false);
  } else if (player.grounded && !player.sliding && frame % 10 === 0) {
    emitDust(player.x + 6, groundY, false);
  } else if (isFrostStage() && player.sliding && frame % 6 === 0) {
    emitDust(player.x + player.w * 0.5, groundY, false);
  }

  if (!endlessMode && Math.floor(score - stageStartScore) >= stageTargetScore()) {
    registerStageClear();
    return;
  }

  const hitbox = currentHitbox();
  const magnet = magnetRange();

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const obs = obstacles[i];
    obs.x -= currentSpeed;
    if (obs.volcanic && obs.baseY !== undefined) {
      const bob = obs.type === "fire_phoenix" ? 10 : obs.type === "fire_boss" ? 8 : 6;
      obs.y = obs.baseY + Math.sin(frame * 0.09 + obs.phase) * bob;
    }
    if (obs.aquatic && obs.baseY !== undefined) {
      const bob = obs.type === "swim_leviathan" ? 9 : obs.type === "swim_boss" ? 8 : 6;
      obs.y = obs.baseY + Math.sin(frame * 0.08 + obs.phase) * bob;
    }
    if (obs.flying && obs.baseY !== undefined) {
      const bob = obs.type === "fly_boss" ? 10 : obs.type === "fly_serpent" ? 8 : 7;
      obs.y = obs.baseY + Math.sin(frame * 0.07 + obs.phase) * bob;
    }
    if (obs.x + obs.w < -14) {
      obstacles.splice(i, 1);
      continue;
    }
    if (rectHit(hitbox, obs)) {
      if (player.shieldTimer > 0) {
        player.shieldTimer = 0;
        obstacles.splice(i, 1);
      } else {
        registerGameOver();
        return;
      }
    }
  }

  for (let i = coins.length - 1; i >= 0; i -= 1) {
    const c = coins[i];
    c.x -= currentSpeed;
    const dx = player.x + player.w / 2 - c.x;
    const dy = player.y + 20 - c.y;
    const dist = Math.hypot(dx, dy);
    if (dist < magnet && save.magnetLevel > 0) {
      c.x += dx * 0.08;
      c.y += dy * 0.08;
    }
    if (c.x + c.r < -10) {
      coins.splice(i, 1);
      continue;
    }
    if (dist < c.r + 18) {
      runCoins += 1;
      coins.splice(i, 1);
    }
  }

  for (let i = powerups.length - 1; i >= 0; i -= 1) {
    const p = powerups[i];
    p.x -= currentSpeed;
    if (p.x + p.w < -10) {
      powerups.splice(i, 1);
      continue;
    }
    if (rectHit(hitbox, p)) {
      player.shieldTimer = 220;
      powerups.splice(i, 1);
    }
  }

  for (let i = dustParticles.length - 1; i >= 0; i -= 1) {
    const p = dustParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03;
    p.life -= 1;
    if (p.life <= 0) {
      dustParticles.splice(i, 1);
    }
  }

  updateHud();
}

function drawUnderwaterBackground() {
  const palette = BIOME_PALETTES[currentStageConfig().biome] || BIOME_PALETTES.ocean;
  const waterGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  waterGrad.addColorStop(0, palette.sky[0]);
  waterGrad.addColorStop(0.45, palette.sky[1]);
  waterGrad.addColorStop(1, palette.hills);
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(224, 242, 254, 0.12)";
  for (let i = 0; i < 5; i += 1) {
    const rayX = (i * 210 + frame * 0.6) % (canvas.width + 120) - 60;
    ctx.beginPath();
    ctx.moveTo(rayX, WATER_TOP);
    ctx.lineTo(rayX + 50, canvas.height);
    ctx.lineTo(rayX + 18, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = palette.ground;
  ctx.fillRect(0, WATER_BOTTOM, canvas.width, canvas.height - WATER_BOTTOM);

  const sandOffset = (frame * 0.12) % (canvas.width + 180);
  ctx.fillStyle = palette.dunes;
  ctx.beginPath();
  ctx.ellipse(canvas.width - sandOffset, WATER_BOTTOM + 8, 120, 16, 0, 0, Math.PI * 2);
  ctx.ellipse(canvas.width - sandOffset + 150, WATER_BOTTOM + 10, 90, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, WATER_BOTTOM);
  ctx.lineTo(canvas.width, WATER_BOTTOM);
  ctx.stroke();

  ctx.fillStyle = "rgba(186, 230, 253, 0.35)";
  ctx.fillRect(0, 0, canvas.width, WATER_TOP + 8);
  ctx.strokeStyle = "rgba(224, 242, 254, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x += 18) {
    const wave = Math.sin(frame * 0.08 + x * 0.06) * 4;
    ctx.lineTo(x, WATER_TOP + wave);
  }
  ctx.stroke();
}

function drawWaterEffects() {
  if (!isSwimmingStage()) {
    return;
  }
  ctx.fillStyle = "rgba(224, 242, 254, 0.55)";
  for (let i = 0; i < 24; i += 1) {
    const bx = (i * 83 + frame * (0.25 + (i % 4) * 0.06)) % (canvas.width + 16) - 8;
    const by = WATER_TOP + 20 + ((i * 59 + frame * 0.5) % (WATER_BOTTOM - WATER_TOP - 40));
    ctx.beginPath();
    ctx.arc(bx, by, i % 3 === 0 ? 2.2 : 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBackground() {
  if (isSwimmingStage()) {
    drawUnderwaterBackground();
    return;
  }

  const palette = BIOME_PALETTES[currentStageConfig().biome] || BIOME_PALETTES.grass;
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, palette.sky[0]);
  skyGradient.addColorStop(1, palette.sky[1]);
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (currentStageConfig().biome === "night" || currentStageConfig().biome === "storm") {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (let i = 0; i < 24; i += 1) {
      const sx = (i * 113 + frame * 0.04) % canvas.width;
      const sy = 24 + (i * 37) % 120;
      ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
    }
  }

  if (currentStageConfig().biome === "aurora" || currentStageConfig().biome === "void") {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (let i = 0; i < 18; i += 1) {
      const sx = (i * 97 + frame * 0.02) % canvas.width;
      const sy = 18 + (i * 41) % 100;
      ctx.fillRect(sx, sy, 2, 2);
    }
    if (currentStageConfig().biome === "aurora") {
      const auroraGrad = ctx.createLinearGradient(0, 40, canvas.width, 160);
      auroraGrad.addColorStop(0, "rgba(52, 211, 153, 0)");
      auroraGrad.addColorStop(0.45, "rgba(52, 211, 153, 0.18)");
      auroraGrad.addColorStop(0.7, "rgba(167, 139, 250, 0.16)");
      auroraGrad.addColorStop(1, "rgba(52, 211, 153, 0)");
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, 30, canvas.width, 140);
    }
  }

  if (currentStageConfig().biome === "frost") {
    const auroraGrad = ctx.createLinearGradient(0, 24, canvas.width, 120);
    auroraGrad.addColorStop(0, "rgba(125, 211, 252, 0)");
    auroraGrad.addColorStop(0.5, "rgba(186, 230, 253, 0.22)");
    auroraGrad.addColorStop(1, "rgba(167, 139, 250, 0.12)");
    ctx.fillStyle = auroraGrad;
    ctx.fillRect(0, 20, canvas.width, 110);
  }

  if (isThawStage()) {
    const steamGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    steamGrad.addColorStop(0, "rgba(68, 64, 60, 0.15)");
    steamGrad.addColorStop(0.55, "rgba(127, 29, 29, 0.12)");
    steamGrad.addColorStop(1, "rgba(251, 146, 60, 0.08)");
    ctx.fillStyle = steamGrad;
    ctx.fillRect(0, 0, canvas.width, groundY);
  }

  const cloudOffset = (frame * 0.35) % (canvas.width + 120);
  ctx.fillStyle = palette.clouds;
  ctx.beginPath();
  ctx.ellipse(canvas.width - cloudOffset, 70, 44, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(canvas.width - cloudOffset + 28, 64, 30, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.ground;
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  const hillOffset = (frame * 0.15) % (canvas.width + 220);
  ctx.fillStyle = palette.hills;
  ctx.beginPath();
  ctx.ellipse(canvas.width - hillOffset, groundY + 10, 140, 48, 0, 0, Math.PI * 2);
  ctx.ellipse(canvas.width - hillOffset + 190, groundY + 12, 120, 44, 0, 0, Math.PI * 2);
  ctx.fill();

  const duneOffset = (frame * 0.26) % (canvas.width + 280);
  ctx.fillStyle = palette.dunes;
  ctx.beginPath();
  ctx.ellipse(canvas.width - duneOffset, groundY + 12, 200, 26, 0, 0, Math.PI * 2);
  ctx.ellipse(canvas.width - duneOffset + 260, groundY + 14, 180, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();

  if (currentStageConfig().biome === "frost") {
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(0, groundY - 28, canvas.width, 32);
    ctx.fillStyle = "rgba(186, 230, 253, 0.18)";
    ctx.fillRect(0, groundY - 4, canvas.width, 8);
    ctx.strokeStyle = "rgba(186, 230, 253, 0.35)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i += 1) {
      const crackX = (i * 137 + frame * 0.08) % (canvas.width + 80) - 40;
      ctx.beginPath();
      ctx.moveTo(crackX, groundY + 4);
      ctx.lineTo(crackX + 18, groundY + 10);
      ctx.lineTo(crackX + 8, groundY + 18);
      ctx.stroke();
    }
  }

  if (isThawStage()) {
    ctx.fillStyle = "rgba(226, 232, 240, 0.14)";
    ctx.fillRect(0, groundY - 18, canvas.width, 22);
    ctx.fillStyle = "rgba(251, 146, 60, 0.22)";
    for (let i = 0; i < 10; i += 1) {
      const gx = (i * 149 + frame * 0.12) % (canvas.width + 60) - 30;
      ctx.fillRect(gx, groundY + 2, 14, 3);
    }
    ctx.strokeStyle = "rgba(248, 113, 113, 0.35)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i += 1) {
      const cx = (i * 211 + frame * 0.05) % (canvas.width + 100) - 50;
      ctx.beginPath();
      ctx.moveTo(cx, groundY + 6);
      ctx.lineTo(cx + 22, groundY + 12);
      ctx.lineTo(cx + 10, groundY + 20);
      ctx.stroke();
    }
  }

  if (isVolcanicStage()) {
    const lavaGrad = ctx.createLinearGradient(0, groundY - 8, 0, canvas.height);
    lavaGrad.addColorStop(0, "rgba(251, 146, 60, 0.55)");
    lavaGrad.addColorStop(0.45, "rgba(234, 88, 12, 0.75)");
    lavaGrad.addColorStop(1, "rgba(124, 45, 18, 0.95)");
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, groundY - 4, canvas.width, canvas.height - groundY + 4);
    ctx.fillStyle = "rgba(253, 224, 71, 0.35)";
    for (let i = 0; i < 6; i += 1) {
      const bubbleX = (i * 163 + frame * 0.35) % (canvas.width + 40);
      const bubbleR = 3 + (i % 3);
      ctx.beginPath();
      ctx.arc(bubbleX, groundY + 14 + (i % 4) * 8, bubbleR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawFireEffects() {
  if (!isVolcanicStage()) {
    return;
  }

  ctx.fillStyle = "rgba(251, 146, 60, 0.75)";
  for (let i = 0; i < 28; i += 1) {
    const ex = (i * 73 + frame * (0.4 + (i % 4) * 0.08)) % (canvas.width + 20) - 10;
    const ey = groundY - 20 - ((i * 41 + frame * (0.7 + (i % 3) * 0.15)) % (canvas.height - groundY - 40));
    const size = i % 3 === 0 ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.arc(ex, ey, size, 0, Math.PI * 2);
    ctx.fill();
  }

  if (heatPulseWarning > 0) {
    const pulse = 0.35 + (heatPulseWarning / HEAT_PULSE_WARN_FRAMES) * 0.45;
    const surgeHeight = 36 + (1 - heatPulseWarning / HEAT_PULSE_WARN_FRAMES) * 48;
    const warnGrad = ctx.createLinearGradient(0, groundY - surgeHeight, 0, groundY + 20);
    warnGrad.addColorStop(0, "rgba(239, 68, 68, 0)");
    warnGrad.addColorStop(0.55, `rgba(249, 115, 22, ${pulse * 0.55})`);
    warnGrad.addColorStop(1, `rgba(220, 38, 38, ${pulse * 0.85})`);
    ctx.fillStyle = warnGrad;
    ctx.fillRect(0, groundY - surgeHeight, canvas.width, surgeHeight + 20);
  }
}

function drawFrostEffects() {
  if (!isPureFrostStage()) {
    return;
  }

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 48; i += 1) {
    const drift = 0.35 + (i % 5) * 0.12;
    const sx = (i * 71 + frame * drift) % (canvas.width + 24) - 12;
    const sy = (i * 47 + frame * (0.55 + (i % 4) * 0.14)) % (groundY + 16);
    const size = i % 4 === 0 ? 2.6 : 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawThawEffects() {
  if (!isThawStage()) {
    return;
  }

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  for (let i = 0; i < 18; i += 1) {
    const sx = (i * 89 + frame * 0.28) % (canvas.width + 20) - 10;
    const sy = (i * 53 + frame * 0.42) % (groundY * 0.75);
    ctx.beginPath();
    ctx.arc(sx, sy, i % 3 === 0 ? 1.8 : 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(251, 146, 60, 0.55)";
  for (let i = 0; i < 14; i += 1) {
    const ex = (i * 97 + frame * (0.22 + (i % 3) * 0.06)) % (canvas.width + 16) - 8;
    const ey = groundY - 24 - ((i * 37 + frame * 0.35) % (groundY * 0.45));
    ctx.beginPath();
    ctx.arc(ex, ey, i % 2 === 0 ? 2 : 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(226, 232, 240, 0.22)";
  for (let i = 0; i < 8; i += 1) {
    const vx = (i * 163 + frame * 0.18) % (canvas.width + 40);
    const vy = groundY - 40 - (i * 29) % 60;
    ctx.beginPath();
    ctx.ellipse(vx, vy, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawIceSkidTrail() {
  if (!isFrostStage() || !player.sliding || state !== "playing") {
    return;
  }
  ctx.strokeStyle = "rgba(186, 230, 253, 0.45)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(player.x - 8, groundY + 1);
  ctx.lineTo(player.x + player.w + 18, groundY + 1);
  ctx.stroke();
  ctx.fillStyle = "rgba(224, 242, 254, 0.25)";
  ctx.fillRect(player.x - 4, groundY - 1, player.w + 22, 4);
}

function drawPlayer() {
  if (isSwimmingStage()) {
    drawSwimmingPlayer();
    return;
  }

  const drawY = player.y + (player.sliding ? 18 : 0);
  const drawH = player.h - (player.sliding ? 18 : 0);
  const stride = Math.sin(frame * 0.45) * 4;
  const catFur = player.shieldTimer > 0 ? "#6366f1" : "#9a7b5f";
  const catFurDark = player.shieldTimer > 0 ? "#4f46e5" : "#7c624b";

  ctx.fillStyle = "rgba(15, 23, 42, 0.28)";
  ctx.beginPath();
  ctx.ellipse(player.x + player.w * 0.5, groundY + 2, 19, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = catFur;
  ctx.beginPath();
  ctx.ellipse(player.x + 20, drawY + drawH * 0.6, 17, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = catFurDark;
  ctx.beginPath();
  ctx.ellipse(player.x + 18, drawY + drawH * 0.62, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = catFur;
  ctx.beginPath();
  ctx.ellipse(player.x + 34, drawY + 11, 10, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = catFurDark;
  ctx.beginPath();
  ctx.moveTo(player.x + 27, drawY + 6);
  ctx.lineTo(player.x + 30, drawY - 4);
  ctx.lineTo(player.x + 33, drawY + 6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(player.x + 34, drawY + 5);
  ctx.lineTo(player.x + 38, drawY - 5);
  ctx.lineTo(player.x + 41, drawY + 6);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = catFurDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(player.x + 6, drawY + 19);
  ctx.quadraticCurveTo(player.x - 3, drawY + 12 - stride * 0.3, player.x + 2, drawY + 7 - stride * 0.45);
  ctx.stroke();

  const legLift = player.grounded && !player.sliding ? stride : 0;
  ctx.fillStyle = catFurDark;
  ctx.fillRect(player.x + 11, drawY + drawH - 12 - Math.max(0, legLift), 5, 12 + Math.max(0, legLift));
  ctx.fillRect(player.x + 22, drawY + drawH - 12 - Math.max(0, -legLift), 5, 12 + Math.max(0, -legLift));

  ctx.fillStyle = "#111827";
  ctx.fillRect(player.x + 36, drawY + 10, 2, 2);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(player.x + 34, drawY + 14, 4, 1);
}

function drawSwimmingPlayer() {
  const tuck = player.sliding ? 10 : 0;
  const drawY = player.y + tuck;
  const drawH = player.h - tuck;
  const wiggle = Math.sin(frame * 0.28) * 5;
  const catFur = player.shieldTimer > 0 ? "#6366f1" : "#9a7b5f";
  const catFurDark = player.shieldTimer > 0 ? "#4f46e5" : "#7c624b";

  ctx.fillStyle = catFur;
  ctx.beginPath();
  ctx.ellipse(player.x + 22, drawY + drawH * 0.58, 18, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = catFurDark;
  ctx.beginPath();
  ctx.ellipse(player.x + 20, drawY + drawH * 0.6, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Oxygen tank on the cat's back
  ctx.fillStyle = "#475569";
  ctx.fillRect(player.x + 7, drawY + 17, 11, 20);
  ctx.fillStyle = "#64748b";
  ctx.fillRect(player.x + 8, drawY + 18, 9, 5);
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(player.x + 8, drawY + 30, 9, 3);
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(player.x + 7.5, drawY + 17.5, 10, 19);

  ctx.fillStyle = catFur;
  ctx.beginPath();
  ctx.ellipse(player.x + 36, drawY + 12, 10, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = catFurDark;
  ctx.beginPath();
  ctx.moveTo(player.x + 29, drawY + 6);
  ctx.lineTo(player.x + 32, drawY - 2);
  ctx.lineTo(player.x + 35, drawY + 6);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = catFurDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(player.x + 4, drawY + 20);
  ctx.quadraticCurveTo(
    player.x - 8,
    drawY + 14 + wiggle * 0.4,
    player.x + 2,
    drawY + 8 + wiggle * 0.55,
  );
  ctx.stroke();

  ctx.fillStyle = catFurDark;
  ctx.fillRect(player.x + 10, drawY + drawH - 10, 5, 8 + Math.max(0, wiggle * 0.2));
  ctx.fillRect(player.x + 22, drawY + drawH - 10, 5, 8 - Math.max(0, wiggle * 0.2));

  const maskCx = player.x + 39;
  const maskCy = drawY + 14;

  // Hose from tank to mask
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(player.x + 16, drawY + 22);
  ctx.quadraticCurveTo(player.x + 24, drawY + 18, maskCx - 2, maskCy + 2);
  ctx.stroke();

  // Mask straps
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(maskCx - 6, maskCy - 2);
  ctx.quadraticCurveTo(player.x + 28, drawY + 5, player.x + 30, drawY + 3);
  ctx.moveTo(maskCx - 6, maskCy + 4);
  ctx.quadraticCurveTo(player.x + 24, drawY + 20, player.x + 14, drawY + 22);
  ctx.stroke();

  // Mask facepiece
  ctx.fillStyle = "rgba(8, 145, 178, 0.42)";
  ctx.strokeStyle = "#0e7490";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(maskCx, maskCy, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Lens reflection
  ctx.fillStyle = "rgba(224, 242, 254, 0.6)";
  ctx.beginPath();
  ctx.ellipse(maskCx - 3, maskCy - 2, 4.5, 3.5, -0.35, 0, Math.PI * 2);
  ctx.fill();

  // Regulator / mouthpiece
  ctx.fillStyle = "#0369a1";
  ctx.fillRect(maskCx + 4, maskCy + 1, 6, 5);
  ctx.fillStyle = "#0ea5e9";
  ctx.fillRect(maskCx + 5, maskCy + 2, 4, 2);

  // Small bubbles from the mask
  const bubblePhase = frame * 0.22;
  ctx.fillStyle = "rgba(186, 230, 253, 0.7)";
  for (let i = 0; i < 3; i += 1) {
    const bx = maskCx + 6 + i * 3;
    const by = maskCy - 6 - ((bubblePhase + i * 8) % 18);
    const br = 1.2 + (i % 2) * 0.6;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFlyingObstacle(obs) {
  const wingFlap = Math.sin(frame * 0.35 + obs.phase) * 6;
  const cx = obs.x + obs.w * 0.5;
  const cy = obs.y + obs.h * 0.5;

  ctx.fillStyle = "rgba(15, 23, 42, 0.16)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + obs.h * 0.45, obs.w * 0.42, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  if (obs.type === "fly_drone") {
    ctx.fillStyle = "#475569";
    ctx.fillRect(obs.x + 4, obs.y + 8, obs.w - 8, obs.h - 14);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(obs.x + obs.w * 0.5 - 3, obs.y + 2, 6, 6);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obs.x + 6, obs.y + 10);
    ctx.lineTo(obs.x - 4, obs.y + 4 + wingFlap * 0.2);
    ctx.moveTo(obs.x + obs.w - 6, obs.y + 10);
    ctx.lineTo(obs.x + obs.w + 4, obs.y + 4 - wingFlap * 0.2);
    ctx.stroke();
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(obs.x + 8, obs.y + obs.h - 8, 4, 4);
    ctx.fillRect(obs.x + obs.w - 12, obs.y + obs.h - 8, 4, 4);
    return;
  }

  if (obs.type === "fly_serpent" || (obs.type === "fly_boss" && save.currentStage >= STAGES_PER_WORLD * 4)) {
    ctx.strokeStyle = obs.type === "fly_boss" ? "#818cf8" : "#6366f1";
    ctx.lineWidth = obs.type === "fly_boss" ? 8 : 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(obs.x, cy);
    for (let i = 0; i <= 4; i += 1) {
      const px = obs.x + (obs.w / 4) * i;
      const wave = Math.sin(frame * 0.12 + obs.phase + i * 0.9) * (obs.type === "fly_boss" ? 10 : 7);
      ctx.lineTo(px, cy + wave);
    }
    ctx.stroke();
    ctx.fillStyle = "#c7d2fe";
    ctx.beginPath();
    ctx.arc(obs.x + obs.w - 4, cy + Math.sin(frame * 0.12 + obs.phase + 3.6) * 7, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111827";
    ctx.fillRect(obs.x + obs.w - 6, cy + Math.sin(frame * 0.12 + obs.phase + 3.6) * 7 - 2, 2, 2);
    return;
  }

  const bodyColor = obs.type === "fly_boss" ? "#92400e" : obs.type === "fly_hawk" ? "#78350f" : "#374151";
  const wingColor = obs.type === "fly_boss" ? "#b45309" : obs.type === "fly_hawk" ? "#a16207" : "#1f2937";

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy, obs.w * 0.22, obs.h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = wingColor;
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy);
  ctx.quadraticCurveTo(obs.x - 8, cy - 10 - wingFlap, obs.x + 4, cy + 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 4, cy);
  ctx.quadraticCurveTo(obs.x + obs.w + 8, cy - 8 + wingFlap, obs.x + obs.w - 4, cy + 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.fillRect(obs.x + obs.w - 10, cy - 2, 3, 3);

  if (obs.type === "fly_boss") {
    ctx.strokeStyle = "#fcd34d";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obs.x + obs.w - 6, cy - 1);
    ctx.lineTo(obs.x + obs.w + 2, cy - 5);
    ctx.stroke();
  }
}

function drawAquaticObstacle(obs) {
  const cx = obs.x + obs.w * 0.5;
  const cy = obs.y + obs.h * 0.5;

  if (obs.type === "swim_leviathan" || obs.type === "swim_boss") {
    ctx.strokeStyle = obs.type === "swim_leviathan" ? "#38bdf8" : "#0ea5e9";
    ctx.lineWidth = obs.type === "swim_leviathan" ? 9 : 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(obs.x, cy);
    for (let i = 0; i <= 4; i += 1) {
      const px = obs.x + (obs.w / 4) * i;
      const wave = Math.sin(frame * 0.11 + obs.phase + i * 0.85) * (obs.type === "swim_leviathan" ? 9 : 7);
      ctx.lineTo(px, cy + wave);
    }
    ctx.stroke();
    ctx.fillStyle = "#bae6fd";
    ctx.beginPath();
    ctx.arc(obs.x + obs.w - 5, cy + Math.sin(frame * 0.11 + obs.phase + 3.4) * 7, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111827";
    ctx.fillRect(obs.x + obs.w - 7, cy + Math.sin(frame * 0.11 + obs.phase + 3.4) * 7 - 2, 2, 2);
    return;
  }

  if (obs.type === "swim_jelly") {
    const pulse = Math.sin(frame * 0.18 + obs.phase) * 3;
    ctx.fillStyle = "rgba(244, 114, 182, 0.55)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, obs.w * 0.42, obs.h * 0.34 + pulse * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(251, 207, 232, 0.85)";
    ctx.lineWidth = 2;
    for (let t = 0; t < 4; t += 1) {
      const tx = obs.x + 6 + t * 7;
      ctx.beginPath();
      ctx.moveTo(tx, obs.y + obs.h - 4);
      ctx.lineTo(tx + Math.sin(frame * 0.2 + obs.phase + t) * 2, obs.y + obs.h + 10);
      ctx.stroke();
    }
    return;
  }

  if (obs.type === "swim_kelp") {
    ctx.strokeStyle = "#15803d";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    for (let k = 0; k < 3; k += 1) {
      const kx = obs.x + 6 + k * 7;
      ctx.beginPath();
      ctx.moveTo(kx, obs.y + obs.h);
      for (let s = 1; s <= 4; s += 1) {
        const ky = obs.y + obs.h - (obs.h / 4) * s;
        ctx.lineTo(kx + Math.sin(frame * 0.06 + obs.x * 0.01 + s + k) * 6, ky);
      }
      ctx.stroke();
    }
    return;
  }

  if (obs.type === "swim_coral") {
    const grad = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.w, obs.y + obs.h);
    grad.addColorStop(0, "#fb7185");
    grad.addColorStop(0.5, "#f97316");
    grad.addColorStop(1, "#db2777");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(obs.x + 4, obs.y + obs.h);
    ctx.lineTo(obs.x + obs.w * 0.5, obs.y + 8);
    ctx.lineTo(obs.x + obs.w - 4, obs.y + obs.h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(254, 215, 170, 0.55)";
    ctx.beginPath();
    ctx.arc(obs.x + obs.w * 0.35, obs.y + obs.h * 0.55, 5, 0, Math.PI * 2);
    ctx.arc(obs.x + obs.w * 0.68, obs.y + obs.h * 0.42, 4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.ellipse(cx, cy, obs.w * 0.48, obs.h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(obs.x + 5, obs.y + 8);
  ctx.lineTo(obs.x + obs.w - 6, obs.y + obs.h - 8);
  ctx.stroke();
}

function drawIceObstacleShadow(obs) {
  ctx.fillStyle = "rgba(15, 23, 42, 0.48)";
  ctx.beginPath();
  ctx.ellipse(obs.x + obs.w * 0.5, groundY + 4, obs.w * 0.74, 7, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFrostObstacle(obs) {
  const isTall = obs.type === "wall" || obs.type === "boss" || obs.type === "frost_titan";
  const isBoss = obs.type === "boss" || obs.type === "frost_titan";
  const isTitan = obs.type === "frost_titan";

  drawIceObstacleShadow(obs);

  if (obs.type === "high") {
    ctx.fillStyle = "rgba(30, 58, 95, 0.72)";
    ctx.beginPath();
    ctx.moveTo(obs.x + 2, obs.y + 4);
    ctx.lineTo(obs.x + obs.w - 2, obs.y + 4);
    ctx.lineTo(obs.x + obs.w * 0.5, obs.y + obs.h + 8);
    ctx.closePath();
    ctx.fill();

    const icicleCount = 3;
    for (let i = 0; i < icicleCount; i += 1) {
      const ix = obs.x + 4 + i * (obs.w / icicleCount);
      const iw = Math.max(6, obs.w / icicleCount - 3);
      const ih = obs.h + (i === 1 ? 6 : 0);
      const grad = ctx.createLinearGradient(ix, obs.y, ix, obs.y + ih);
      grad.addColorStop(0, "#e0f2fe");
      grad.addColorStop(0.35, "#38bdf8");
      grad.addColorStop(0.75, "#0284c7");
      grad.addColorStop(1, "#075985");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ix, obs.y);
      ctx.lineTo(ix + iw, obs.y);
      ctx.lineTo(ix + iw * 0.5, obs.y + ih);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#0c4a6e";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = "rgba(224, 242, 254, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ix + 2, obs.y + 2);
      ctx.lineTo(ix + 2, obs.y + ih * 0.55);
      ctx.stroke();
    }
    return;
  }

  ctx.fillStyle = "rgba(30, 58, 95, 0.55)";
  if (isTall) {
    ctx.beginPath();
    ctx.ellipse(obs.x + obs.w * 0.5, obs.y + obs.h * 0.56, obs.w * 0.56, obs.h * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(obs.x - 1, obs.y + 1, obs.w + 2, obs.h + 2);
  }

  const bodyGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.h);
  if (isBoss) {
    bodyGrad.addColorStop(0, "#bae6fd");
    bodyGrad.addColorStop(0.45, "#38bdf8");
    bodyGrad.addColorStop(1, "#475569");
  } else if (isTall) {
    bodyGrad.addColorStop(0, "#e2e8f0");
    bodyGrad.addColorStop(0.4, "#64748b");
    bodyGrad.addColorStop(1, "#334155");
  } else {
    bodyGrad.addColorStop(0, "#cbd5e1");
    bodyGrad.addColorStop(0.55, "#64748b");
    bodyGrad.addColorStop(1, "#334155");
  }
  ctx.fillStyle = bodyGrad;
  if (isTall) {
    ctx.beginPath();
    ctx.ellipse(obs.x + obs.w * 0.5, obs.y + obs.h * 0.55, obs.w * 0.52, obs.h * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else {
    ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(obs.x + 0.5, obs.y + 0.5, obs.w - 1, obs.h - 1);
  }

  ctx.strokeStyle = "rgba(224, 242, 254, 0.7)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(obs.x + 4, obs.y + 4);
  ctx.lineTo(obs.x + obs.w * 0.55, obs.y + obs.h * 0.35);
  ctx.lineTo(obs.x + obs.w - 5, obs.y + obs.h - 4);
  ctx.stroke();

  if (isBoss) {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(obs.x + obs.w * 0.35, obs.y + 14, 5, 5);
    ctx.fillRect(obs.x + obs.w * 0.6, obs.y + 14, 5, 5);
    ctx.fillStyle = "#bae6fd";
    ctx.fillRect(obs.x + obs.w * 0.28, obs.y + 28, obs.w * 0.44, 8);
    if (isTitan) {
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.w * 0.22, obs.y + 6);
      ctx.lineTo(obs.x + obs.w * 0.3, obs.y - 14);
      ctx.lineTo(obs.x + obs.w * 0.38, obs.y + 4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.w * 0.62, obs.y + 4);
      ctx.lineTo(obs.x + obs.w * 0.7, obs.y - 16);
      ctx.lineTo(obs.x + obs.w * 0.78, obs.y + 6);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawThawObstacle(obs) {
  const isTall = obs.type === "wall" || obs.type === "thaw_pillar" || obs.type === "boss" || obs.type === "frost_titan";
  const isBoss = obs.type === "boss" || obs.type === "frost_titan";

  if (obs.type === "high") {
    drawFrostObstacle(obs);
    ctx.fillStyle = "rgba(234, 88, 12, 0.65)";
    ctx.fillRect(obs.x + 1, obs.y + obs.h - 5, obs.w - 2, 5);
    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(obs.x + 0.5, obs.y + obs.h - 5.5, obs.w - 1, 5);
    return;
  }

  drawIceObstacleShadow(obs);

  ctx.fillStyle = "rgba(30, 41, 59, 0.6)";
  if (isTall) {
    ctx.beginPath();
    ctx.ellipse(obs.x + obs.w * 0.5, obs.y + obs.h * 0.56, obs.w * 0.56, obs.h * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(obs.x - 1, obs.y + 1, obs.w + 2, obs.h + 2);
  }

  const bodyGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.h);
  bodyGrad.addColorStop(0, "#e2e8f0");
  bodyGrad.addColorStop(0.3, "#94a3b8");
  bodyGrad.addColorStop(0.65, "#57534e");
  bodyGrad.addColorStop(1, "#292524");
  ctx.fillStyle = bodyGrad;
  if (isTall) {
    ctx.beginPath();
    ctx.ellipse(obs.x + obs.w * 0.5, obs.y + obs.h * 0.55, obs.w * 0.52, obs.h * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else {
    ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(obs.x + 0.5, obs.y + 0.5, obs.w - 1, obs.h - 1);
  }

  ctx.strokeStyle = "rgba(251, 146, 60, 0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(obs.x + 5, obs.y + 8);
  ctx.lineTo(obs.x + obs.w * 0.45, obs.y + obs.h * 0.42);
  ctx.lineTo(obs.x + obs.w - 6, obs.y + obs.h - 6);
  ctx.stroke();

  ctx.fillStyle = "rgba(234, 88, 12, 0.75)";
  ctx.fillRect(obs.x + 3, obs.y + obs.h - 7, obs.w - 6, 6);
  ctx.strokeStyle = "#7c2d12";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(obs.x + 3.5, obs.y + obs.h - 7.5, obs.w - 7, 6);

  if (isBoss) {
    ctx.fillStyle = "#292524";
    ctx.fillRect(obs.x + obs.w * 0.34, obs.y + 16, 6, 6);
    ctx.fillRect(obs.x + obs.w * 0.58, obs.y + 16, 6, 6);
    ctx.fillStyle = "rgba(249, 115, 22, 0.75)";
    ctx.fillRect(obs.x + obs.w * 0.26, obs.y + 30, obs.w * 0.48, 10);
  }
}

function drawVolcanicObstacle(obs) {
  const cx = obs.x + obs.w * 0.5;
  const cy = obs.y + obs.h * 0.5;

  if (obs.type === "fire_phoenix" || obs.type === "fire_boss") {
    const wingFlap = Math.sin(frame * 0.32 + obs.phase) * 8;
    ctx.fillStyle = obs.type === "fire_phoenix" ? "#f97316" : "#ea580c";
    ctx.beginPath();
    ctx.ellipse(cx, cy, obs.w * 0.2, obs.h * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy);
    ctx.quadraticCurveTo(obs.x - 12, cy - 14 - wingFlap, obs.x + 2, cy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy);
    ctx.quadraticCurveTo(obs.x + obs.w + 12, cy - 12 + wingFlap, obs.x + obs.w - 2, cy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx + 5, cy - 22 - Math.abs(wingFlap) * 0.2);
    ctx.lineTo(cx + 10, cy - 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#111827";
    ctx.fillRect(obs.x + obs.w - 12, cy - 2, 3, 3);
    return;
  }

  if (obs.type === "fire_geyser") {
    const geyserGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.h);
    geyserGrad.addColorStop(0, "#fef08a");
    geyserGrad.addColorStop(0.35, "#fb923c");
    geyserGrad.addColorStop(1, "#7c2d12");
    ctx.fillStyle = geyserGrad;
    ctx.fillRect(obs.x + 4, obs.y, obs.w - 8, obs.h);
    ctx.fillStyle = "rgba(254, 240, 138, 0.65)";
    for (let g = 0; g < 3; g += 1) {
      const gy = obs.y + 8 + g * 14 + Math.sin(frame * 0.25 + obs.x + g) * 3;
      ctx.beginPath();
      ctx.arc(obs.x + obs.w * 0.5, gy, 4 - g * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (obs.type === "fire_ember") {
    ctx.fillStyle = "rgba(251, 146, 60, 0.85)";
    ctx.beginPath();
    ctx.arc(cx, cy, obs.w * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(254, 240, 138, 0.9)";
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 3, obs.w * 0.14, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (obs.type === "fire_pillar") {
    const pillarGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.w, obs.y);
    pillarGrad.addColorStop(0, "#44403c");
    pillarGrad.addColorStop(0.5, "#78716c");
    pillarGrad.addColorStop(1, "#292524");
    ctx.fillStyle = pillarGrad;
    ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
    ctx.strokeStyle = "#fb923c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obs.x + 6, obs.y + 8);
    ctx.lineTo(obs.x + obs.w - 6, obs.y + obs.h - 8);
    ctx.stroke();
    return;
  }

  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(cx, cy, obs.w * 0.46, obs.h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fb923c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(obs.x + 4, obs.y + 6);
  ctx.lineTo(obs.x + obs.w - 4, obs.y + obs.h - 6);
  ctx.stroke();
}

function drawObstacles() {
  const frost = isPureFrostStage();
  const thaw = isThawStage();
  obstacles.forEach((obs) => {
    if (obs.type?.startsWith("fire_") || obs.volcanic) {
      drawVolcanicObstacle(obs);
      return;
    }
    if (obs.aquatic) {
      drawAquaticObstacle(obs);
      return;
    }
    if (obs.flying) {
      drawFlyingObstacle(obs);
      return;
    }

    if (thaw) {
      drawThawObstacle(obs);
      return;
    }

    if (frost) {
      drawFrostObstacle(obs);
      return;
    }

    const isTall = obs.type === "wall" || obs.type === "boss";
    const isBoss = obs.type === "boss";

    ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
    ctx.beginPath();
    ctx.ellipse(obs.x + obs.w * 0.5, groundY + 2, obs.w * 0.62, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.w, obs.y);
    grad.addColorStop(0, isBoss ? "#052e16" : "#14532d");
    grad.addColorStop(0.55, isBoss ? "#166534" : "#15803d");
    grad.addColorStop(1, isBoss ? "#052e16" : "#14532d");
    ctx.fillStyle = grad;
    ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

    const armHeight = Math.max(12, Math.floor(obs.h * 0.36));
    const armY = obs.y + Math.max(4, Math.floor(obs.h * 0.25));
    ctx.fillRect(obs.x - 7, armY + (isTall ? 2 : 0), 7, armHeight);
    ctx.fillRect(obs.x + obs.w, armY + (isTall ? 5 : 0), 7, armHeight - 1);

    ctx.strokeStyle = "rgba(187, 247, 208, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(obs.x + 6, obs.y + 3);
    ctx.lineTo(obs.x + 6, obs.y + obs.h - 2);
    ctx.moveTo(obs.x + obs.w - 6, obs.y + 3);
    ctx.lineTo(obs.x + obs.w - 6, obs.y + obs.h - 2);
    ctx.stroke();

    ctx.strokeStyle = "#dcfce7";
    for (let s = 0; s < 5; s += 1) {
      const sy = obs.y + 7 + s * Math.max(8, obs.h / 6);
      ctx.beginPath();
      ctx.moveTo(obs.x + 2, sy);
      ctx.lineTo(obs.x - 2, sy - 2);
      ctx.moveTo(obs.x + obs.w - 2, sy + 1);
      ctx.lineTo(obs.x + obs.w + 2, sy - 1);
      ctx.stroke();
    }
  });
}

function drawCoins() {
  coins.forEach((coin) => {
    const grad = ctx.createRadialGradient(coin.x - 2, coin.y - 2, 1, coin.x, coin.y, coin.r + 1);
    grad.addColorStop(0, "#fde68a");
    grad.addColorStop(1, "#f59e0b");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function drawPowerups() {
  powerups.forEach((p) => {
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(p.x + 8, p.y + 5, 6, 12);
  });
}

function drawDustParticles() {
  dustParticles.forEach((p) => {
    const alpha = Math.max(0, p.life / 30);
    if (p.snow) {
      ctx.fillStyle = `rgba(224, 242, 254, ${alpha * 0.75})`;
    } else if (p.ember) {
      ctx.fillStyle = `rgba(251, 146, 60, ${alpha * 0.85})`;
    } else if (p.bubble) {
      ctx.strokeStyle = `rgba(224, 242, 254, ${alpha * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(186, 230, 253, ${alpha * 0.35})`;
      ctx.fill();
    } else {
      ctx.fillStyle = `rgba(120, 97, 67, ${alpha * 0.45})`;
    }
    if (!p.bubble) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawOverlay() {
  if (state === "playing") {
    return;
  }
  ctx.fillStyle = "rgba(15, 23, 42, 0.58)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  if (state === "worldintro") {
    ctx.font = `14px ${FONT_TITLE}`;
    if (activeWorldIntro === 5) {
      ctx.fillStyle = "#fb923c";
      ctx.fillText("World 5", canvas.width / 2, canvas.height / 2 - 72);
      ctx.font = `24px ${FONT_TITLE}`;
      ctx.fillStyle = "#f8fafc";
      ctx.fillText("Fire Lands", canvas.width / 2, canvas.height / 2 - 36);
      ctx.font = `16px ${FONT_UI}`;
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText("Lava surges — jump or slide to survive.", canvas.width / 2, canvas.height / 2 + 4);
      ctx.fillText("Watch for the glow at your feet.", canvas.width / 2, canvas.height / 2 + 30);
      ctx.fillStyle = "#f97316";
    } else if (activeWorldIntro === 4) {
      ctx.fillStyle = "#c4b5fd";
      ctx.fillText("World 4", canvas.width / 2, canvas.height / 2 - 72);
      ctx.font = `24px ${FONT_TITLE}`;
      ctx.fillStyle = "#f8fafc";
      ctx.fillText("Sky Realm", canvas.width / 2, canvas.height / 2 - 36);
      ctx.font = `16px ${FONT_UI}`;
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText("You're in the air — bats, hawks, and drones ahead.", canvas.width / 2, canvas.height / 2 + 4);
      ctx.fillText("Jump and slide to dodge aerial obstacles.", canvas.width / 2, canvas.height / 2 + 30);
      ctx.fillStyle = "#a78bfa";
    } else if (activeWorldIntro === 3) {
      ctx.fillStyle = "#bae6fd";
      ctx.fillText("World 3", canvas.width / 2, canvas.height / 2 - 72);
      ctx.font = `24px ${FONT_TITLE}`;
      ctx.fillStyle = "#f8fafc";
      ctx.fillText("Frozen Frontier", canvas.width / 2, canvas.height / 2 - 36);
      ctx.font = `16px ${FONT_UI}`;
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText("Hard landings send you sliding on ice.", canvas.width / 2, canvas.height / 2 + 4);
      ctx.fillText("Later stages thaw — less grip, more steam.", canvas.width / 2, canvas.height / 2 + 30);
      ctx.fillStyle = "#7dd3fc";
    } else if (activeWorldIntro === 2) {
      ctx.fillStyle = "#7dd3fc";
      ctx.fillText("World 2", canvas.width / 2, canvas.height / 2 - 72);
      ctx.font = `24px ${FONT_TITLE}`;
      ctx.fillStyle = "#f8fafc";
      ctx.fillText("Ocean Depths", canvas.width / 2, canvas.height / 2 - 36);
      ctx.font = `16px ${FONT_UI}`;
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText("Tap top to swim up, bottom to dive.", canvas.width / 2, canvas.height / 2 + 4);
      ctx.fillText("Dodge coral, kelp, and sea creatures.", canvas.width / 2, canvas.height / 2 + 30);
      ctx.fillStyle = "#38bdf8";
    }
    drawOverlayContinueButton();
  } else if (state === "menu") {
    ctx.font = `24px ${FONT_TITLE}`;
    ctx.fillText("Runner Rush", canvas.width / 2, canvas.height / 2 - 36);
    ctx.font = `18px ${FONT_UI}`;
    ctx.fillText(`Stage ${save.currentStage}/${STAGES.length} unlocked`, canvas.width / 2, canvas.height / 2 - 4);
    if (save.endlessUnlocked) {
      ctx.fillText("Endless Mode unlocked", canvas.width / 2, canvas.height / 2 + 24);
      ctx.fillText("Tap to play · Space to start", canvas.width / 2, canvas.height / 2 + 54);
    } else {
      ctx.fillText("Tap to play · Space to start", canvas.width / 2, canvas.height / 2 + 24);
    }
  } else if (state === "stageclear") {
    const finishedAllStages = save.endlessUnlocked && save.currentStage >= STAGES.length;
    ctx.font = `22px ${FONT_TITLE}`;
    ctx.fillText(finishedAllStages ? "Campaign Complete!" : "Stage Cleared!", canvas.width / 2, canvas.height / 2 - 24);
    ctx.font = `18px ${FONT_UI}`;
    if (finishedAllStages) {
      ctx.fillText(`All ${STAGES.length} stages beaten!`, canvas.width / 2, canvas.height / 2 + 10);
      ctx.fillText("Endless mode unlocked", canvas.width / 2, canvas.height / 2 + 36);
    } else {
      const clearedStage = STAGES[save.currentStage - 2];
      ctx.fillText(clearedStage ? `${clearedStage.name} complete` : "Nice run!", canvas.width / 2, canvas.height / 2 + 6);
      ctx.fillText(`Next: ${currentStageConfig().name}`, canvas.width / 2, canvas.height / 2 + 32);
    }
    drawOverlayContinueButton();
  } else {
    ctx.font = `26px ${FONT_TITLE}`;
    ctx.fillText(endlessMode ? "Endless Over" : "Game Over", canvas.width / 2, canvas.height / 2 - 12);
    ctx.font = `18px ${FONT_UI}`;
    if (endlessMode) {
      ctx.fillText(`Run score: ${endlessRunScore()} · Best: ${save.endlessBest}`, canvas.width / 2, canvas.height / 2 + 24);
    } else {
      ctx.fillText("Retry the current stage", canvas.width / 2, canvas.height / 2 + 24);
    }
    drawOverlayContinueButton();
  }
}

function loop() {
  update();
  drawBackground();
  drawFrostEffects();
  drawThawEffects();
  drawWaterEffects();
  drawFireEffects();
  drawObstacles();
  drawCoins();
  drawPowerups();
  drawDustParticles();
  drawIceSkidTrail();
  drawPlayer();
  drawOverlay();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Escape" && gameMenu?.classList.contains("open")) {
    event.preventDefault();
    closeGameMenu();
    return;
  }
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    if (state === "worldintro" || state === "gameover" || state === "stageclear") {
      return;
    }
    jump();
  }
  if (event.code === "ArrowDown") {
    event.preventDefault();
    slide();
  }
  if (event.code === "ArrowRight") {
    event.preventDefault();
    sprinting = true;
  }
  if (event.code === "Enter") {
    if (
      (state === "gameover" || state === "worldintro" || state === "stageclear") &&
      overlayContinueReady()
    ) {
      event.preventDefault();
      if (state === "worldintro") {
        dismissWorldIntro();
      } else {
        restart();
      }
      return;
    }
  }
  if (event.code === "KeyR") {
    if (state === "gameover" || state === "stageclear") {
      if (overlayContinueReady()) {
        restart();
      }
      return;
    }
    restart();
  }
  if (event.code === "KeyE" && state === "menu" && save.endlessUnlocked) {
    startEndlessRun();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowRight") {
    sprinting = false;
  }
});

function handleCanvasPointer(offsetX, offsetY) {
  unlockMusicFromGesture();
  if (tryOverlayContinue(offsetX, offsetY)) {
    return;
  }
  if (state === "menu") {
    endlessMode = false;
    startRun();
    return;
  }
  if (offsetY < canvas.offsetHeight / 2) {
    jump();
  } else {
    slide();
  }
}

const SPRINT_LONG_PRESS_MS = 350;

let pointerStartOffsetY = null;
let pointerStartOffsetX = null;
let activePointerId = null;
let sprintLongPressTimer = null;
let sprintHoldActive = false;

function isCanvasRightSide(offsetX) {
  return offsetX >= canvas.offsetWidth / 2;
}

function usesTouchSprintControls(event) {
  return event.pointerType === "touch" || isSmallScreen();
}

function clearSprintLongPressTimer() {
  if (sprintLongPressTimer !== null) {
    window.clearTimeout(sprintLongPressTimer);
    sprintLongPressTimer = null;
  }
}

function endSprintHold() {
  clearSprintLongPressTimer();
  if (sprintHoldActive) {
    sprintHoldActive = false;
    sprinting = false;
  }
}

function resetCanvasPointerState() {
  pointerStartOffsetY = null;
  pointerStartOffsetX = null;
  activePointerId = null;
  endSprintHold();
}

function startSprintLongPress(event) {
  if (!usesTouchSprintControls(event) || state !== "playing" || !isCanvasRightSide(event.offsetX)) {
    return;
  }
  clearSprintLongPressTimer();
  try {
    canvas.setPointerCapture(event.pointerId);
  } catch {
    // Ignore capture failures on unsupported browsers.
  }
  sprintLongPressTimer = window.setTimeout(() => {
    sprintLongPressTimer = null;
    sprintHoldActive = true;
    sprinting = true;
  }, SPRINT_LONG_PRESS_MS);
}

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});
canvas.addEventListener("selectstart", (event) => {
  event.preventDefault();
});

canvas.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch") {
    event.preventDefault();
  }
  pointerOverlayEpoch = overlayEpoch;
  pointerStartOffsetY = event.offsetY;
  pointerStartOffsetX = event.offsetX;
  activePointerId = event.pointerId;
  startSprintLongPress(event);
}, { passive: false });

canvas.addEventListener("pointerup", (event) => {
  if (activePointerId !== null && event.pointerId !== activePointerId) {
    return;
  }

  const offsetY = pointerStartOffsetY ?? event.offsetY;
  const offsetX = pointerStartOffsetX ?? event.offsetX;
  const wasSprintHold = sprintHoldActive;
  endSprintHold();
  pointerStartOffsetY = null;
  pointerStartOffsetX = null;
  activePointerId = null;

  if (wasSprintHold) {
    return;
  }

  handleCanvasPointer(offsetX, offsetY);
});

canvas.addEventListener("pointercancel", (event) => {
  if (activePointerId === null || event.pointerId === activePointerId) {
    resetCanvasPointerState();
  }
});

function preventDoubleTapZoom() {
  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false },
  );
  document.addEventListener("dblclick", (event) => {
    event.preventDefault();
  });
  document.addEventListener("gesturestart", (event) => {
    event.preventDefault();
  });
}

preventDoubleTapZoom();

if (endlessBtn) {
  endlessBtn.addEventListener("click", () => {
    closeGameMenu();
    startEndlessRun();
  });
}
campaignBtn?.addEventListener("click", exitEndlessMode);
restartBtn.addEventListener("click", () => {
  closeGameMenu();
  restart();
});
restartStageZeroBtn.addEventListener("click", () => {
  closeGameMenu();
  restartFromStageZero();
});
resetEverythingBtn.addEventListener("click", () => {
  closeGameMenu();
  resetEverything();
});
exitAppBtn?.addEventListener("click", exitApp);
exitAppDismissBtn?.addEventListener("click", hideExitAppOverlay);
reviveBtn.addEventListener("click", () => {
  closeGameMenu();
  revive();
});
upgradeJumpBtn.addEventListener("click", tryBuyJumpUpgrade);
upgradeMagnetBtn.addEventListener("click", tryBuyMagnetUpgrade);
musicToggleBtn.addEventListener("click", toggleMusic);
menuToggleBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  toggleGameMenu();
});
menuToggleBtn?.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
});
menuCloseBtn?.addEventListener("click", closeGameMenu);
menuBackdrop?.addEventListener("click", closeGameMenu);
if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFullscreen();
  });
}
document.addEventListener("fullscreenchange", handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
window.addEventListener("orientationchange", handleOrientationChange);
window.addEventListener("resize", () => {
  updateExitAppButton();
  handleOrientationChange();
});
window.visualViewport?.addEventListener("resize", handleOrientationChange);
window.visualViewport?.addEventListener("scroll", handleOrientationChange);

if (gameShell && typeof ResizeObserver !== "undefined") {
  new ResizeObserver(() => {
    layoutCanvasStage();
  }).observe(gameShell);
  if (canvasWrap) {
    new ResizeObserver(() => {
      if (gameShell.classList.contains("is-fullscreen")) {
        layoutCanvasStage();
      }
    }).observe(canvasWrap);
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseMusic();
  } else {
    ensureMusicPlayback();
  }
  sprinting = false;
});

applyMusicSettings();
updateMusicButton();
updateFullscreenButton();
updateExitAppButton();
registerMusicGestureUnlock();
if (!bootWorldIntroPreviewFromUrl()) {
  setState("menu");
}
updateHud();
if (GAME_CONFIG.startInEndlessMode && save.endlessUnlocked) {
  startEndlessRun();
}
document.fonts.ready.then(() => {
  requestAnimationFrame(loop);
});
