const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const coinsRunEl = document.getElementById("coins-run");
const bestScoreEl = document.getElementById("best-score");
const bankCoinsEl = document.getElementById("bank-coins");
const levelEl = document.getElementById("level");
const missionEl = document.getElementById("mission");

const startBtn = document.getElementById("start-btn");
const jumpBtn = document.getElementById("jump-btn");
const slideBtn = document.getElementById("slide-btn");
const restartBtn = document.getElementById("restart-btn");
const restartStageZeroBtn = document.getElementById("restart-stage-zero-btn");
const resetEverythingBtn = document.getElementById("reset-everything-btn");
const reviveBtn = document.getElementById("revive-btn");
const upgradeJumpBtn = document.getElementById("upgrade-jump-btn");
const upgradeMagnetBtn = document.getElementById("upgrade-magnet-btn");
const musicToggleBtn = document.getElementById("music-toggle-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const rotateHint = document.getElementById("rotate-hint");
const gameShell = document.querySelector(".game-shell");
const canvasWrap = document.querySelector(".canvas-wrap");
const canvasStage = document.querySelector(".canvas-stage");
const bgMusic = document.getElementById("bg-music");

const GAME_ASPECT = 16 / 9;

const groundY = canvas.height - 68;
const gravity = 0.84;
const baseJumpForce = -14.8;

const STAGES = [
  { name: "Sunny Trail", targetScore: 90, startSpeed: 3.0, accel: 0.00065, spawn: 80, boss: false },
  { name: "Dry Plains", targetScore: 120, startSpeed: 3.3, accel: 0.00075, spawn: 76, boss: false },
  { name: "Rock Dust", targetScore: 150, startSpeed: 3.6, accel: 0.00085, spawn: 72, boss: false },
  { name: "Windy Ridge", targetScore: 185, startSpeed: 3.9, accel: 0.00095, spawn: 68, boss: false },
  { name: "Boss: Thorn Lord", targetScore: 230, startSpeed: 4.0, accel: 0.00105, spawn: 64, boss: true },
  { name: "Sunset Dunes", targetScore: 275, startSpeed: 4.3, accel: 0.00115, spawn: 60, boss: false },
  { name: "Wild Barrens", targetScore: 320, startSpeed: 4.6, accel: 0.0012, spawn: 56, boss: false },
  { name: "Storm Flats", targetScore: 365, startSpeed: 4.9, accel: 0.00125, spawn: 53, boss: false },
  { name: "Night Canyons", targetScore: 420, startSpeed: 5.1, accel: 0.0013, spawn: 50, boss: false },
  { name: "Final Boss: Cactus King", targetScore: 480, startSpeed: 5.4, accel: 0.0014, spawn: 46, boss: true },
];

const saveKey = "runner_rush_save_v3";
const defaultSave = {
  bestScore: 0,
  bankCoins: 0,
  totalCoins: 0,
  jumpLevel: 1,
  magnetLevel: 0,
  unlockedStage: 1,
  currentStage: 1,
};
const save = { ...defaultSave, ...JSON.parse(localStorage.getItem(saveKey) || "{}") };
save.unlockedStage = Math.max(1, Math.min(STAGES.length, save.unlockedStage));
save.currentStage = Math.max(1, Math.min(save.unlockedStage, save.currentStage));

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
const musicPrefKey = "runner_rush_music_enabled";
let musicEnabled = localStorage.getItem(musicPrefKey) !== "false";

function updateMusicButton() {
  if (!musicToggleBtn) {
    return;
  }
  musicToggleBtn.textContent = musicEnabled ? "Music: On" : "Music: Off";
}

function isSmallScreen() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function isPortrait() {
  return window.matchMedia("(orientation: portrait)").matches;
}

function isNativeFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

let pseudoFullscreen = false;

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

function updateFullscreenButton() {
  if (!fullscreenBtn) {
    return;
  }
  const active = isFullscreenActive();
  fullscreenBtn.setAttribute("aria-label", active ? "Exit fullscreen" : "Enter fullscreen");
}

function isTouchDevice() {
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

function updateRotateHint() {
  if (!rotateHint) {
    return;
  }
  const emulated = gameShell?.classList.contains("force-landscape");
  const show = isFullscreenActive() && isSmallScreen() && isPortrait() && isTouchDevice() && !emulated;
  rotateHint.hidden = !show;
}

function applyLandscapeEmulation() {
  if (!gameShell || !isPortrait()) {
    return;
  }
  gameShell.classList.add("force-landscape");
}

function clearLandscapeEmulation() {
  gameShell?.classList.remove("force-landscape");
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

async function ensureLandscape() {
  if (!isSmallScreen() || !isFullscreenActive()) {
    return;
  }
  if (!isPortrait()) {
    clearLandscapeEmulation();
    updateRotateHint();
    return;
  }
  const locked = await lockLandscape();
  if (locked) {
    clearLandscapeEmulation();
  } else {
    applyLandscapeEmulation();
  }
  layoutCanvasStage();
  updateRotateHint();
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
    : [gameShell, document.documentElement];
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
  updateFullscreenButton();
  if (isSmallScreen()) {
    ensureLandscape();
    setTimeout(() => {
      ensureLandscape();
      layoutCanvasStage();
    }, 300);
  }
  layoutCanvasStage();
  updateRotateHint();
}

function onExitFullscreenMode() {
  gameShell?.classList.remove("is-fullscreen");
  clearLandscapeEmulation();
  unlockOrientation();
  layoutCanvasStage();
  updateFullscreenButton();
  updateRotateHint();
}

function enterPseudoFullscreen() {
  if (pseudoFullscreen) {
    return;
  }
  pseudoFullscreen = true;
  document.body.classList.add("pseudo-fullscreen-active");
  window.scrollTo(0, 0);
  onEnterFullscreenMode();
}

function exitPseudoFullscreen() {
  if (!pseudoFullscreen) {
    return;
  }
  pseudoFullscreen = false;
  document.body.classList.remove("pseudo-fullscreen-active");
  onExitFullscreenMode();
}

async function toggleFullscreen() {
  if (isFullscreenActive()) {
    if (isNativeFullscreen()) {
      await exitFullscreen();
    }
    if (pseudoFullscreen) {
      exitPseudoFullscreen();
    }
  } else {
    await enterFullscreen();
  }
}

function layoutCanvasStage() {
  if (!canvasStage) {
    return;
  }
  if (!gameShell?.classList.contains("is-fullscreen")) {
    canvasStage.style.width = "";
    canvasStage.style.height = "";
    return;
  }
  const availW = canvasWrap?.clientWidth || 0;
  const availH = canvasWrap?.clientHeight || 0;
  if (!availW || !availH) {
    return;
  }
  let width = availW;
  let height = width / GAME_ASPECT;
  if (height > availH) {
    height = availH;
    width = height * GAME_ASPECT;
  }
  canvasStage.style.width = `${Math.floor(width)}px`;
  canvasStage.style.height = `${Math.floor(height)}px`;
}

function handleFullscreenChange() {
  if (isNativeFullscreen()) {
    onEnterFullscreenMode();
  } else if (!pseudoFullscreen) {
    onExitFullscreenMode();
  }
}

function handleOrientationChange() {
  if (isFullscreenActive() && isSmallScreen()) {
    ensureLandscape();
  }
  layoutCanvasStage();
  updateRotateHint();
}

function applyMusicSettings() {
  if (!bgMusic) {
    return;
  }
  bgMusic.volume = 0.35;
  bgMusic.muted = !musicEnabled;
}

async function ensureMusicPlayback() {
  if (!bgMusic || !musicEnabled || state !== "playing" || document.hidden) {
    return;
  }
  try {
    await bgMusic.play();
  } catch (_err) {
    // Ignore autoplay restrictions until next interaction.
  }
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  localStorage.setItem(musicPrefKey, String(musicEnabled));
  applyMusicSettings();
  updateMusicButton();
  if (musicEnabled) {
    ensureMusicPlayback();
  } else if (bgMusic) {
    bgMusic.pause();
  }
}

function currentStageConfig() {
  return STAGES[save.currentStage - 1];
}

function persistSave() {
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
  const stageProgress = Math.max(0, Math.floor(score - stageStartScore));
  scoreEl.textContent = `Score: ${scoreNow}`;
  coinsRunEl.textContent = `Run Coins: ${runCoins}`;
  bestScoreEl.textContent = `Best: ${save.bestScore}`;
  bankCoinsEl.textContent = `Bank: ${save.bankCoins}`;
  levelEl.textContent = `Stage: ${save.currentStage}/${STAGES.length}`;
  missionEl.textContent = `Goal: ${stage.name} (${Math.min(stageProgress, stage.targetScore)}/${stage.targetScore})`;
  upgradeJumpBtn.textContent = `Upgrade Jump (${jumpUpgradeCost()})`;
  upgradeMagnetBtn.textContent = `Upgrade Coin Magnet (${magnetUpgradeCost()})`;
}

function setState(nextState) {
  state = nextState;
  const playing = nextState === "playing";
  startBtn.disabled = playing;
  jumpBtn.disabled = !playing;
  slideBtn.disabled = !playing;
  restartBtn.disabled = playing;
  restartStageZeroBtn.disabled = playing;
  reviveBtn.disabled = !(nextState === "gameover" && !reviveUsed && save.bankCoins >= 50);

  if (nextState === "gameover") {
    restartBtn.textContent = "Retry Stage";
  } else if (nextState === "stageclear") {
    restartBtn.textContent = save.currentStage < STAGES.length ? "Next Stage" : "Play Again";
  } else {
    restartBtn.textContent = "Restart";
  }

  if (playing) {
    ensureMusicPlayback();
  } else if (bgMusic) {
    bgMusic.pause();
  }
}

function emitDust(x, y, burst) {
  const count = burst ? 10 : 4;
  for (let i = 0; i < count; i += 1) {
    dustParticles.push({
      x: x + Math.random() * 14 - 7,
      y: y + Math.random() * 4 - 2,
      vx: (Math.random() - 0.5) * 1.8 - speed * 0.09,
      vy: -Math.random() * (burst ? 1.7 : 0.9),
      life: burst ? 30 : 18,
      size: 2 + Math.random() * (burst ? 4 : 2),
    });
  }
}

function collectRunRewards(completedStage) {
  const stageBonus = completedStage ? 60 + save.currentStage * 15 : 0;
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

function startRun() {
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
  player.y = groundY - player.h;
  player.vy = 0;
  player.grounded = true;
  player.sliding = false;
  player.slideTimer = 0;
  player.shieldTimer = 0;
  setState("playing");
  updateHud();
}

function restart() {
  if (state === "stageclear") {
    if (save.currentStage < STAGES.length) {
      save.currentStage += 1;
    } else {
      save.currentStage = 1;
    }
    persistSave();
  }
  startRun();
}

function restartFromStageZero() {
  if (state === "playing") {
    return;
  }
  save.currentStage = 1;
  save.unlockedStage = 1;
  persistSave();
  startRun();
}

function resetEverything() {
  const accepted = window.confirm("Reset all progress, coins, and upgrades? This cannot be undone.");
  if (!accepted) {
    return;
  }

  Object.assign(save, defaultSave);
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

  player.y = groundY - player.h;
  player.vy = 0;
  player.grounded = true;
  player.sliding = false;
  player.slideTimer = 0;
  player.shieldTimer = 0;

  setState("menu");
  updateHud();
}

function revive() {
  if (state !== "gameover" || reviveUsed || save.bankCoins < 50) {
    return;
  }
  save.bankCoins -= 50;
  reviveUsed = true;
  player.shieldTimer = 160;
  obstacles = obstacles.filter((obs) => obs.x > player.x + 45);
  persistSave();
  setState("playing");
  updateHud();
}

function jump() {
  if (state === "menu") {
    startRun();
    return;
  }
  if (state !== "playing" || !player.grounded) {
    return;
  }
  player.vy = currentJumpForce();
  player.grounded = false;
}

function slide() {
  if (state !== "playing" || !player.grounded || player.sliding) {
    return;
  }
  player.sliding = true;
  player.slideTimer = 30;
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

function spawnObstacle() {
  const stage = currentStageConfig();
  const roll = Math.random();

  if (stage.boss && roll < 0.2) {
    obstacles.push({
      x: canvas.width + 20,
      y: groundY - 80,
      w: 44,
      h: 80,
      type: "boss",
    });
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
  const lane = Math.random();
  const coinY = lane < 0.34 ? groundY - 102 : lane < 0.68 ? groundY - 68 : groundY - 38;
  coins.push({ x: canvas.width + 12, y: coinY, r: 9 });
}

function spawnPowerup() {
  powerups.push({ x: canvas.width + 20, y: groundY - 96, w: 22, h: 22, kind: "shield" });
}

function rectHit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function registerGameOver() {
  collectRunRewards(false);
  persistSave();
  setState("gameover");
  updateHud();
}

function registerStageClear() {
  collectRunRewards(true);
  if (save.currentStage < STAGES.length) {
    if (save.unlockedStage === save.currentStage) {
      save.unlockedStage += 1;
    }
    save.currentStage += 1;
    persistSave();
    stageStartScore = score;
    speed = Math.max(speed, currentStageConfig().startSpeed);
    updateHud();
    return;
  }

  persistSave();
  stageStartScore = score;
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
  player.vy += gravity;
  player.y += player.vy;
  if (player.y + player.h >= groundY) {
    player.y = groundY - player.h;
    player.vy = 0;
    if (!wasGrounded) {
      emitDust(player.x + player.w * 0.5, groundY, true);
    }
    player.grounded = true;
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

  const spawnThreshold = Math.max(38, stage.spawn - Math.floor(score * 0.012));
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
  score += 0.17 + currentSpeed * 0.012;
  if (player.grounded && !player.sliding && frame % 10 === 0) {
    emitDust(player.x + 6, groundY, false);
  }

  if (Math.floor(score - stageStartScore) >= stage.targetScore) {
    registerStageClear();
    return;
  }

  const hitbox = currentHitbox();
  const magnet = magnetRange();

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const obs = obstacles[i];
    obs.x -= currentSpeed;
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

function drawBackground() {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, "#8bd5ff");
  skyGradient.addColorStop(1, "#d7f1ff");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cloudOffset = (frame * 0.35) % (canvas.width + 120);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.ellipse(canvas.width - cloudOffset, 70, 44, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(canvas.width - cloudOffset + 28, 64, 30, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8bc34a";
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  const hillOffset = (frame * 0.15) % (canvas.width + 220);
  ctx.fillStyle = "#7fb069";
  ctx.beginPath();
  ctx.ellipse(canvas.width - hillOffset, groundY + 10, 140, 48, 0, 0, Math.PI * 2);
  ctx.ellipse(canvas.width - hillOffset + 190, groundY + 12, 120, 44, 0, 0, Math.PI * 2);
  ctx.fill();

  const duneOffset = (frame * 0.26) % (canvas.width + 280);
  ctx.fillStyle = "rgba(126, 90, 47, 0.22)";
  ctx.beginPath();
  ctx.ellipse(canvas.width - duneOffset, groundY + 12, 200, 26, 0, 0, Math.PI * 2);
  ctx.ellipse(canvas.width - duneOffset + 260, groundY + 14, 180, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#6b8f2a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();
}

function drawPlayer() {
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

function drawObstacles() {
  obstacles.forEach((obs) => {
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
    ctx.fillStyle = `rgba(120, 97, 67, ${alpha * 0.45})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
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
  if (state === "menu") {
    ctx.font = "bold 36px Arial";
    ctx.fillText("Runner Rush", canvas.width / 2, canvas.height / 2 - 24);
    ctx.font = "20px Arial";
    ctx.fillText(`Stage ${save.currentStage} unlocked of ${save.unlockedStage}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText("Press Start Run or Space", canvas.width / 2, canvas.height / 2 + 40);
  } else if (state === "stageclear") {
    const finishedAllStages = save.currentStage >= STAGES.length;
    ctx.font = "bold 36px Arial";
    ctx.fillText(finishedAllStages ? "Congratulations!" : "Stage Cleared!", canvas.width / 2, canvas.height / 2 - 24);
    ctx.font = "20px Arial";
    if (finishedAllStages) {
      ctx.fillText("You cleared all 10 stages!", canvas.width / 2, canvas.height / 2 + 10);
    } else {
      ctx.fillText(`Next: Stage ${save.currentStage + 1}`, canvas.width / 2, canvas.height / 2 + 10);
    }
    ctx.fillText(finishedAllStages ? "Tap Restart to play again" : "Tap Restart to continue", canvas.width / 2, canvas.height / 2 + 40);
  } else {
    ctx.font = "bold 38px Arial";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 12);
    ctx.font = "20px Arial";
    ctx.fillText("Retry the current stage", canvas.width / 2, canvas.height / 2 + 24);
  }
}

function loop() {
  update();
  drawBackground();
  drawObstacles();
  drawCoins();
  drawPowerups();
  drawDustParticles();
  drawPlayer();
  drawOverlay();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    if (state === "gameover") {
      restart();
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
  if (event.code === "KeyR") {
    restart();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowRight") {
    sprinting = false;
  }
});

let pointerStartY = null;
canvas.addEventListener("pointerdown", (event) => {
  pointerStartY = event.clientY;
});
canvas.addEventListener("pointerup", (event) => {
  const y = pointerStartY === null ? event.clientY : pointerStartY;
  const rect = canvas.getBoundingClientRect();
  if (state === "menu") {
    startRun();
  } else if (state === "gameover") {
    restart();
  } else if (y < rect.top + rect.height / 2) {
    jump();
  } else {
    slide();
  }
  pointerStartY = null;
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

startBtn.addEventListener("click", startRun);
jumpBtn.addEventListener("click", jump);
slideBtn.addEventListener("click", slide);
restartBtn.addEventListener("click", restart);
restartStageZeroBtn.addEventListener("click", restartFromStageZero);
resetEverythingBtn.addEventListener("click", resetEverything);
reviveBtn.addEventListener("click", revive);
upgradeJumpBtn.addEventListener("click", tryBuyJumpUpgrade);
upgradeMagnetBtn.addEventListener("click", tryBuyMagnetUpgrade);
musicToggleBtn.addEventListener("click", toggleMusic);
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
window.addEventListener("resize", handleOrientationChange);

document.addEventListener("visibilitychange", () => {
  if (!bgMusic) {
    return;
  }
  if (document.hidden) {
    bgMusic.pause();
  } else {
    ensureMusicPlayback();
  }
  sprinting = false;
});

applyMusicSettings();
updateMusicButton();
updateFullscreenButton();
updateRotateHint();
setState("menu");
updateHud();
requestAnimationFrame(loop);
