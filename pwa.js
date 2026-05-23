const installBanner = document.getElementById("install-banner");
const installBtn = document.getElementById("install-app-btn");
const installHelpBtn = document.getElementById("install-help-btn");
const installDismiss = document.getElementById("install-dismiss-btn");
const installText = document.getElementById("install-banner-text");
const installSteps = document.getElementById("install-steps");

let deferredInstallPrompt = null;

function isStandaloneApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

function installDismissed() {
  return localStorage.getItem("runner_rush_install_dismissed") === "1";
}

function hideInstallBanner() {
  installBanner?.classList.add("hidden");
}

function showInstallBanner(message) {
  if (!installBanner || isStandaloneApp() || installDismissed()) {
    return;
  }
  if (installText && message) {
    installText.textContent = message;
  }
  installBanner.classList.remove("hidden");
}

function getInstallSteps() {
  if (isIOS()) {
    return [
      "Open this exact page in Safari (not Chrome or an in-app browser).",
      "Tap the Share button at the bottom of Safari (square with an arrow pointing up).",
      "Scroll the share sheet and tap Add to Home Screen.",
      "Tap Add in the top-right corner.",
      "Open Runner Rush from the new icon on your home screen.",
    ];
  }
  if (isAndroid()) {
    return [
      "Open this page in Chrome.",
      "Tap the three-dot menu in the top-right corner.",
      "Tap Install app or Add to Home screen.",
      "Confirm Install.",
      "Open Runner Rush from your home screen or app drawer.",
    ];
  }
  return [
    "Open this page in Chrome, Edge, or Safari.",
    "Use the browser menu to find Install app or Add to Home screen.",
    "Confirm the install.",
    "Launch the game from your home screen.",
  ];
}

function renderInstallSteps() {
  if (!installSteps) {
    return;
  }
  installSteps.innerHTML = "";
  getInstallSteps().forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    installSteps.appendChild(item);
  });
}

function toggleInstallSteps(forceOpen) {
  if (!installSteps) {
    return;
  }
  const shouldOpen = forceOpen ?? installSteps.classList.contains("hidden");
  installSteps.classList.toggle("hidden", !shouldOpen);
  if (installHelpBtn) {
    installHelpBtn.textContent = shouldOpen ? "Hide steps" : "How to install";
  }
}

function setupInstallBanner() {
  if (!installBanner || isStandaloneApp() || installDismissed()) {
    return;
  }

  renderInstallSteps();

  if (isIOS()) {
    showInstallBanner("Install Runner Rush on your iPhone using Safari:");
    installBtn?.classList.add("hidden");
    toggleInstallSteps(true);
  } else if (isAndroid()) {
    showInstallBanner("Install Runner Rush on your phone:");
    installBtn?.classList.add("hidden");
  } else {
    showInstallBanner("Install Runner Rush on your device:");
    installBtn?.classList.add("hidden");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installBtn?.classList.remove("hidden");
    if (installText) {
      installText.textContent = "Chrome is ready — tap Install App, or use the steps below.";
    }
  });

  installHelpBtn?.addEventListener("click", () => {
    toggleInstallSteps();
  });

  installBtn?.addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      hideInstallBanner();
      return;
    }
    if (installText) {
      installText.textContent = "Install wasn't available from this browser. Follow the steps below:";
    }
    toggleInstallSteps(true);
  });

  installDismiss?.addEventListener("click", () => {
    localStorage.setItem("runner_rush_install_dismissed", "1");
    hideInstallBanner();
  });

  window.setTimeout(() => {
    if (deferredInstallPrompt || isStandaloneApp() || installDismissed()) {
      return;
    }
    if (isAndroid() && installText) {
      installText.textContent =
        "If Install App didn't appear, tap How to install for Chrome menu steps.";
    }
  }, 2500);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Service worker registration is optional for local file:// testing.
    });
    setupInstallBanner();
  });
} else {
  window.addEventListener("load", setupInstallBanner);
}
