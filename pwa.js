const installBanner = document.getElementById("install-banner");
const installBtn = document.getElementById("install-app-btn");
const installDismiss = document.getElementById("install-dismiss-btn");
const installText = document.getElementById("install-banner-text");

let deferredInstallPrompt = null;

function isStandaloneApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
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

function setupInstallBanner() {
  if (!installBanner || isStandaloneApp() || installDismissed()) {
    return;
  }

  if (isIOS()) {
    showInstallBanner(
      "iPhone: open this page in Safari, tap Share (square with arrow), then Add to Home Screen.",
    );
    installBtn?.classList.add("hidden");
    return;
  }

  if (isAndroid()) {
    showInstallBanner(
      "Android: tap Install App below, or open Chrome menu → Add to Home screen / Install app.",
    );
  } else {
    showInstallBanner(
      "Install: use your browser menu to add this page to your home screen.",
    );
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installBtn?.classList.remove("hidden");
    showInstallBanner("Android: tap Install App to add Runner Rush to your home screen.");
  });

  installBtn?.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    hideInstallBanner();
  });

  installDismiss?.addEventListener("click", () => {
    localStorage.setItem("runner_rush_install_dismissed", "1");
    hideInstallBanner();
  });
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
