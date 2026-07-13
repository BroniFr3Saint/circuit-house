/* =========================================================
   walkthrough.js — CircuitHouse Gadget Simulation Engine
   Interactive phone & laptop walkthrough for e-commerce
   ========================================================= */
(function () {
  "use strict";

  let activeProduct = null;
  let currentWallpapers = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  ];
  let currentWallpaper = 0;

  /* ---- Helpers ---- */
  function parseStorage(text) {
    const m = text.match(/(\d+)\s*(GB|TB)/i);
    return m ? m[1] + m[2].toUpperCase() : "256GB";
  }

  function parseStorageNum(text) {
    const m = text.match(/(\d+)\s*(GB|TB)/i);
    if (!m) return 256;
    return m[2].toUpperCase() === "TB" ? parseInt(m[1]) * 1024 : parseInt(m[1]);
  }

  function parseRAM(text) {
    const m = text.match(/(\d+)\s*GB/);
    return m ? m[1] + "GB" : "8GB";
  }

  function now() {
    const d = new Date();
    return (
      d.getHours().toString().padStart(2, "0") +
      ":" +
      d.getMinutes().toString().padStart(2, "0")
    );
  }

  function today() {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function wallpaper() {
    return currentWallpapers[currentWallpaper % currentWallpapers.length];
  }

  let clockTimer = null;

  /* ---- Modal ---- */
  function createModal(product) {
    const old = document.querySelector(".wt-modal");
    if (old) { if (clockTimer) clearTimeout(clockTimer); old.remove(); }

    const isPhone = product.category === "Phone";
    const modal = document.createElement("div");
    modal.className = "wt-modal";
    modal.innerHTML =
      '\
      <div class="wt-backdrop"></div>\
      <div class="wt-container">\
        <button class="wt-close" aria-label="Close walkthrough">&times;</button>\
        <div class="wt-header">\
          <span class="wt-title">' +
      escHtml(product.name) +
      '</span>\
          <span class="wt-badge">' +
      (isPhone ? "&#128241; Phone" : "&#128187; Laptop") +
      '</span>\
        </div>\
        <div class="wt-device ' +
      (isPhone ? "wt-phone" : "wt-laptop") +
      '">\
          <div class="wt-screen" id="wtScreen"></div>\
          ' +
      (isPhone
        ? '<button class="wt-home-btn" id="wtHomeBtn" aria-label="Home">&#9679;</button>'
        : "") +
      '\
        </div>\
        <p class="wt-hint" id="wtHint">' +
      (isPhone ? "Tap the screen to unlock" : "Click icons to explore") +
      "</p>\
      </div>";

    document.body.appendChild(modal);
    requestAnimationFrame(function () {
      modal.classList.add("active");
    });

    /* Close */
    modal.querySelector(".wt-close").addEventListener("click", function () {
      closeModal(modal);
    });
    modal.querySelector(".wt-backdrop").addEventListener("click", function () {
      closeModal(modal);
    });

    /* Home button */
    const homeBtn = modal.querySelector("#wtHomeBtn");
    if (homeBtn) {
      homeBtn.addEventListener("click", function () {
        goHome();
      });
    }

    /* Init */
    activeProduct = product;
    if (isPhone) {
      renderLockScreen();
    } else {
      renderDesktop();
    }
  }

  function closeModal(modal) {
    if (clockTimer) { clearTimeout(clockTimer); clockTimer = null; }
    modal.classList.remove("active");
    setTimeout(function () {
      modal.remove();
      activeProduct = null;
    }, 300);
  }

  function goHome() {
    if (!activeProduct) return;
    if (activeProduct.category === "Phone") {
      renderHomeScreen();
    } else {
      renderDesktop();
    }
    setHint(
      activeProduct.category === "Phone"
        ? "Tap an app to explore"
        : "Click an icon to explore"
    );
  }

  function setHint(text) {
    const el = document.getElementById("wtHint");
    if (el) el.textContent = text;
  }

  function escHtml(s) {
    const d = document.createElement("div");
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

  /* ============ PHONE SIMULATION ============ */

  function renderLockScreen() {
    const screen = document.getElementById("wtScreen");
    if (!screen) return;
    screen.innerHTML =
      '\
      <div class="wt-lock" style="background:' +
      wallpaper() +
      '">\
        <div class="wt-status-bar">\
          <span class="wt-time" id="wtTime">' +
      now() +
      '</span>\
          <span class="wt-icons">&#128246; &#128267;</span>\
        </div>\
        <div class="wt-lock-content">\
          <div class="wt-lock-time">' +
      now() +
      '</div>\
          <div class="wt-lock-date">' +
      today() +
      '</div>\
          <div class="wt-lock-hint">Tap to unlock</div>\
          <div class="wt-lock-arrow">&#128070;</div>\
        </div>\
      </div>';

    screen.querySelector(".wt-lock").addEventListener("click", function () {
      renderHomeScreen();
      setHint("Tap an app to explore");
    });
  }

  function renderHomeScreen() {
    const screen = document.getElementById("wtScreen");
    if (!screen) return;
    const apps = [
      { id: "settings", icon: "&#9881;&#65039;", name: "Settings" },
      { id: "battery", icon: "&#128267;", name: "Battery" },
      { id: "storage", icon: "&#128190;", name: "Storage" },
      { id: "wallpaper", icon: "&#127912;", name: "Wallpaper" },
      { id: "about", icon: "&#8505;&#65039;", name: "About" },
      { id: "files", icon: "&#128193;", name: "Files" },
      { id: "camera", icon: "&#128247;", name: "Camera" },
      { id: "photos", icon: "&#128444;&#65039;", name: "Photos" },
    ];

    screen.innerHTML =
      '\
      <div class="wt-home" style="background:' +
      wallpaper() +
      '">\
        <div class="wt-status-bar">\
          <span>' +
      now() +
      '</span>\
          <span>&#128246; &#128267; 78%</span>\
        </div>\
        <div class="wt-app-grid">' +
      apps
        .map(
          function (a) {
            return (
              '<div class="wt-app-icon" data-app="' +
              a.id +
              '"><span class="wt-icon-bg">' +
              a.icon +
              '</span><span class="wt-app-name">' +
              a.name +
              "</span></div>"
            );
          }
        )
        .join("") +
      '</div>\
        <div class="wt-dock">\
          <div class="wt-app-icon" data-app="phone"><span class="wt-icon-bg">&#128222;</span></div>\
          <div class="wt-app-icon" data-app="settings"><span class="wt-icon-bg">&#9881;&#65039;</span></div>\
          <div class="wt-app-icon" data-app="browser"><span class="wt-icon-bg">&#127760;</span></div>\
          <div class="wt-app-icon" data-app="messages"><span class="wt-icon-bg">&#128172;</span></div>\
        </div>\
      </div>';

    /* App clicks via delegation */
    screen.querySelectorAll(".wt-app-icon").forEach(function (el) {
      el.addEventListener("click", function () {
        openPhoneApp(el.dataset.app);
      });
    });
  }

  function openPhoneApp(appId) {
    if (!activeProduct) return;
    const screen = document.getElementById("wtScreen");
    if (!screen) return;
    const p = activeProduct;
    const st = parseStorage(p.name + " " + p.description);
    const stNum = parseStorageNum(p.name + " " + p.description);
    const ram = parseRAM(p.name + " " + p.description);
    let content = "";

    switch (appId) {
      case "settings":
        content = settingsPhoneView(p, st);
        break;
      case "battery":
        content = batteryPhoneView();
        break;
      case "storage":
        content = storagePhoneView(st, stNum);
        break;
      case "wallpaper":
        content = wallpaperPhoneView();
        break;
      case "about":
        content = aboutPhoneView(p, st, ram);
        break;
      case "files":
        content = filesView();
        break;
      case "camera":
        content = cameraView();
        break;
      case "photos":
        content = photosView();
        break;
      default:
        content =
          '\
          <div class="wt-app-view" style="background:#f2f2f7">\
            <div class="wt-app-header" style="background:' +
          wallpaper() +
          '"><span class="wt-back" data-action="back">&#8592;</span> ' +
          appId.charAt(0).toUpperCase() +
          appId.slice(1) +
          '</div>\
            <div class="wt-app-body" style="justify-content:center;align-items:center;color:#8e8e93">\
              <p>' +
          appId +
          " simulation ready</p>\
            </div>\
          </div>";
    }

    screen.innerHTML = content;
    setHint("Viewing " + appId);
    bindBackButtons();
    bindWallpaper();
  }

  function settingsPhoneView(p, st) {
    return '\
    <div class="wt-app-view" style="background:#f2f2f7">\
      <div class="wt-app-header" style="background:' +
      wallpaper() +
      '"><span class="wt-back" data-action="back">&#8592;</span> Settings</div>\
      <div class="wt-app-body">\
        <div class="wt-set-item" data-action="about"><span class="wt-set-icon">&#8505;&#65039;</span><div><strong>About Phone</strong><small>' +
      escHtml(p.name) +
      '</small></div><span class="wt-set-arrow">&#8250;</span></div>\
        <div class="wt-set-item" data-action="storage"><span class="wt-set-icon">&#128190;</span><div><strong>Storage</strong><small>' +
      st +
      ' total</small></div><span class="wt-set-arrow">&#8250;</span></div>\
        <div class="wt-set-item" data-action="battery"><span class="wt-set-icon">&#128267;</span><div><strong>Battery</strong><small>Tap for details</small></div><span class="wt-set-arrow">&#8250;</span></div>\
        <div class="wt-set-item" data-action="wallpaper"><span class="wt-set-icon">&#127912;</span><div><strong>Wallpaper</strong><small>Change look</small></div><span class="wt-set-arrow">&#8250;</span></div>\
        <div class="wt-set-item"><span class="wt-set-icon">&#128246;</span><div><strong>Wi-Fi</strong><small>Connected</small></div><span class="wt-set-arrow">&#8250;</span></div>\
        <div class="wt-set-item"><span class="wt-set-icon">&#128260;</span><div><strong>Software Update</strong><small>Up to date</small></div><span class="wt-set-arrow">&#8250;</span></div>\
      </div>\
    </div>';
  }

  function batteryPhoneView() {
    const lvl = rand(55, 90);
    return '\
    <div class="wt-app-view" style="background:#f2f2f7">\
      <div class="wt-app-header" style="background:' +
      wallpaper() +
      '"><span class="wt-back" data-action="back">&#8592;</span> Battery</div>\
      <div class="wt-app-body">\
        <div class="wt-bat-card">\
          <div class="wt-bat-visual">\
            <div style="display:flex;align-items:center;gap:14px">\
              <div class="wt-bat-icon"><div class="wt-bat-fill" style="width:' +
      lvl +
      "%;background:" +
      (lvl > 20 ? "#34c759" : "#ff3b30") +
      '"></div></div>\
              <span class="wt-bat-pct">' +
      lvl +
      '%</span>\
            </div>\
          </div>\
          <div class="wt-bat-stats">\
            <div><span>Health</span><strong>' +
      rand(75, 95) +
      '%</strong></div>\
            <div><span>Max Capacity</span><strong>' +
      lvl +
      '%</strong></div>\
            <div><span>Cycle Count</span><strong>' +
      rand(30, 200) +
      '</strong></div>\
            <div><span>Status</span><strong>Not Charging</strong></div>\
          </div>\
        </div>\
        <div class="wt-sec-title">Usage (24h)</div>\
        <div class="wt-usage-list">\
          <div><span>&#128242; Screen</span><span class="wt-usage-pct">' +
      rand(25, 40) +
      '%</span></div>\
          <div><span>&#128246; Wi-Fi</span><span class="wt-usage-pct">' +
      rand(10, 20) +
      '%</span></div>\
          <div><span>&#128164; Standby</span><span class="wt-usage-pct">' +
      rand(15, 30) +
      '%</span></div>\
          <div><span>&#9881;&#65039; System</span><span class="wt-usage-pct">' +
      rand(10, 18) +
      '%</span></div>\
          <div><span>&#128241; Apps</span><span class="wt-usage-pct">' +
      rand(5, 15) +
      '%</span></div>\
        </div>\
      </div>\
    </div>';
  }

  function storagePhoneView(st, stNum) {
    const used = Math.floor(stNum * 0.62);
    const free = stNum - used;
    const pct = Math.round((used / stNum) * 100);
    return '\
    <div class="wt-app-view" style="background:#f2f2f7">\
      <div class="wt-app-header" style="background:' +
      wallpaper() +
      '"><span class="wt-back" data-action="back">&#8592;</span> Storage</div>\
      <div class="wt-app-body">\
        <div class="wt-sto-card">\
          <div class="wt-sto-bar"><div class="wt-sto-fill" style="width:' +
      pct +
      '%"></div></div>\
          <div class="wt-sto-info"><span>' +
      used +
      "GB used</span><span>" +
      free +
      "GB free</span></div>\
        </div>\
        <div class=\"wt-sec-title\">Breakdown</div>\
        <div class=\"wt-usage-list\">\
          <div><span>&#128247; Photos & Videos</span><span>" +
      Math.floor(used * 0.32) +
      "GB</span></div>\
          <div><span>&#128241; Apps</span><span>" +
      Math.floor(used * 0.22) +
      "GB</span></div>\
          <div><span>&#127925; Music</span><span>" +
      Math.floor(used * 0.18) +
      "GB</span></div>\
          <div><span>&#128196; Documents</span><span>" +
      Math.floor(used * 0.12) +
      "GB</span></div>\
          <div><span>&#9881;&#65039; System</span><span>" +
      Math.floor(used * 0.16) +
      "GB</span></div>\
        </div>\
      </div>\
    </div>";
  }

  function wallpaperPhoneView() {
    return '\
    <div class="wt-app-view" style="background:#f2f2f7">\
      <div class="wt-app-header" style="background:' +
      wallpaper() +
      '"><span class="wt-back" data-action="back">&#8592;</span> Wallpaper</div>\
      <div class="wt-app-body">\
        <div class="wt-sec-title">Choose a wallpaper</div>\
        <div class="wt-wp-grid">' +
      currentWallpapers
        .map(function (wp, i) {
          return (
            '<div class="wt-wp-opt" data-wp="' +
            i +
            '" style="background:' +
            wp +
            '">' +
            (i === currentWallpaper ? "&#10003;" : "") +
            "</div>"
          );
        })
        .join("") +
      '</div>\
        <p style="color:#8e8e93;font-size:0.78rem;text-align:center;margin-top:12px">Tap to apply</p>\
      </div>\
    </div>';
  }

  function aboutPhoneView(p, st, ram) {
    return '\
    <div class="wt-app-view" style="background:#f2f2f7">\
      <div class="wt-app-header" style="background:' +
      wallpaper() +
      '"><span class="wt-back" data-action="back">&#8592;</span> About Phone</div>\
      <div class="wt-app-body">\
        <div class="wt-about-list">\
          <div><span>Device Name</span><strong>' +
      escHtml(p.name.split(" ").slice(0, 2).join(" ")) +
      '</strong></div>\
          <div><span>Model</span><strong>' +
      escHtml(p.name) +
      '</strong></div>\
          <div><span>OS</span><strong>Android 14 / iOS 18</strong></div>\
          <div><span>Storage</span><strong>' +
      st +
      '</strong></div>\
          <div><span>RAM</span><strong>' +
      ram +
      '</strong></div>\
          <div><span>Processor</span><strong>Octa-core 2.8GHz</strong></div>\
          <div><span>Display</span><strong>6.5-inch AMOLED</strong></div>\
          <div><span>Resolution</span><strong>2400 &times; 1080</strong></div>\
          <div><span>Serial</span><strong>CH-' +
      String(rand(1000, 9999)) +
      '</strong></div>\
        </div>\
      </div>\
    </div>';
  }

  function filesView() {
    return '\
    <div class="wt-app-view" style="background:#f2f2f7">\
      <div class="wt-app-header" style="background:' +
      wallpaper() +
      '"><span class="wt-back" data-action="back">&#8592;</span> Files</div>\
      <div class="wt-app-body">\
        <div class="wt-sec-title">Browse</div>\
        <div class="wt-usage-list">' +
      ["Documents", "Downloads", "Pictures", "Music", "Videos", "Backups"]
        .map(function (f) {
          return (
            "<div><span>&#128193; " +
            f +
            '</span><span class="wt-usage-pct">' +
            rand(1, 8) +
            "GB</span></div>"
          );
        })
        .join("") +
      "</div>\
      </div>\
    </div>";
  }

  function cameraView() {
    return '\
    <div class="wt-app-view wt-cam-app" style="background:#000">\
      <div class="wt-cam-ui">\
        <div class="wt-cam-top">&#128247; &bull; Live</div>\
        <div class="wt-cam-vf"><span style="font-size:4rem;opacity:0.5">&#128247;</span><span style="font-size:0.85rem;opacity:0.3;display:block">Camera preview</span></div>\
        <div class="wt-cam-bottom"><span>&#128248;</span><span class="wt-capture-btn">&#11093;</span><span>&#127918;&#65039;</span></div>\
      </div>\
      <button class="wt-back-overlay" data-action="back">&#8592; Back</button>\
    </div>';
  }

  function photosView() {
    return '\
    <div class="wt-app-view" style="background:#f2f2f7">\
      <div class="wt-app-header" style="background:' +
      wallpaper() +
      '"><span class="wt-back" data-action="back">&#8592;</span> Photos</div>\
      <div class="wt-app-body">\
        <div class="wt-photo-grid">' +
      ["&#127748;","&#127958;&#65039;","&#127747;","&#127802;","&#127874;","&#128021;","&#128662;","&#127968;","&#127829;","&#127918;","&#128218;","&#127803;"]
        .map(function (e) {
          return '<div class="wt-photo-thumb">' + e + "</div>";
        })
        .join("") +
      "</div>\
      </div>\
    </div>";
  }

  /* ============ LAPTOP SIMULATION ============ */

  function renderDesktop() {
    const screen = document.getElementById("wtScreen");
    if (!screen) return;
    screen.innerHTML =
      '\
      <div class="wt-desktop" style="background:' +
      wallpaper() +
      '">\
        <div class="wt-desktop-icons">' +
      [
        { id: "laptop-settings", icon: "&#9881;&#65039;", name: "Settings" },
        { id: "laptop-storage", icon: "&#128190;", name: "Storage" },
        { id: "laptop-battery", icon: "&#128267;", name: "Battery" },
        { id: "laptop-about", icon: "&#8505;&#65039;", name: "About" },
        { id: "laptop-wallpaper", icon: "&#127912;", name: "Personalize" },
        { id: "laptop-files", icon: "&#128193;", name: "Files" },
      ]
        .map(function (a) {
          return (
            '<div class="wt-desktop-icon" data-action="' +
            a.id +
            '"><span class="wt-di-icon">' +
            a.icon +
            '</span><span class="wt-di-label">' +
            a.name +
            "</span></div>"
          );
        })
        .join("") +
      '\
        </div>\
        <div class="wt-taskbar">\
          <span class="wt-start" data-action="laptop-start">&#128187; Start</span>\
          <span class="wt-taskbar-icons">\
            <span class="wt-tb-icon" data-action="laptop-settings">&#9881;&#65039;</span>\
            <span class="wt-tb-icon" data-action="laptop-files">&#128193;</span>\
          </span>\
          <span class="wt-taskbar-right">&#128267; ' +
      rand(55, 90) +
      '% <span class="wt-tb-time">' +
      now() +
      "</span></span>\
        </div>\
      </div>";

    bindDesktopClicks();
  }

  function openLaptopApp(appId) {
    if (!activeProduct) return;
    const screen = document.getElementById("wtScreen");
    if (!screen) return;
    const p = activeProduct;
    const st = parseStorage(p.name + " " + p.description);
    const stNum = parseStorageNum(p.name + " " + p.description);
    const ram = parseRAM(p.name + " " + p.description);
    let content = "";

    switch (appId) {
      case "laptop-settings":
        content = laptopSettingsView(p, st);
        break;
      case "laptop-storage":
        content = laptopStorageView(stNum);
        break;
      case "laptop-battery":
        content = laptopBatteryView();
        break;
      case "laptop-about":
        content = laptopAboutView(p, st, ram);
        break;
      case "laptop-wallpaper":
        content = laptopWallpaperView();
        break;
      case "laptop-files":
        content = laptopFilesView();
        break;
      default:
        content =
          '\
          <div class="wt-window" style="width:70%;height:65%">\
            <div class="wt-win-hdr"><span>App</span><button class="wt-win-close" data-action="desktop">&times;</button></div>\
            <div class="wt-win-body" style="justify-content:center;align-items:center;color:#8e8e93">App ready</div>\
          </div>';
    }

    screen.innerHTML =
      '\
      <div class="wt-desktop" style="background:' +
      wallpaper() +
      '">\
        <div style="display:flex;align-items:center;justify-content:center;width:100%;height:calc(100% - 44px);padding:12px">' +
      content +
      '</div>\
        <div class="wt-taskbar">\
          <span class="wt-start" data-action="desktop">&#128187; Start</span>\
          <span class="wt-taskbar-icons">\
            <span class="wt-tb-icon" data-action="laptop-settings">&#9881;&#65039;</span>\
            <span class="wt-tb-icon" data-action="laptop-files">&#128193;</span>\
          </span>\
          <span class="wt-taskbar-right">&#128267; ' +
      rand(55, 90) +
      '% <span class="wt-tb-time">' +
      now() +
      "</span></span>\
        </div>\
      </div>";

    /* Bind close/back inside windows */
    screen.querySelectorAll(".wt-win-close").forEach(function (el) {
      el.addEventListener("click", function () {
        renderDesktop();
      });
    });
    bindDesktopActions();
    bindWallpaper();
    setHint("Viewing " + appId.replace("laptop-", ""));
  }

  function laptopSettingsView(p, st) {
    return '\
    <div class="wt-window" style="width:85%;height:85%">\
      <div class="wt-win-hdr"><span>&#9881;&#65039; Settings</span><button class="wt-win-close" data-action="desktop">&times;</button></div>\
      <div class="wt-win-body">\
        <div class="wt-set-item" data-action="laptop-about"><span class="wt-set-icon">&#8505;&#65039;</span><div><strong>About</strong><small>' +
      escHtml(p.name) +
      '</small></div><span class="wt-set-arrow">&#8250;</span></div>\
        <div class="wt-set-item" data-action="laptop-storage"><span class="wt-set-icon">&#128190;</span><div><strong>Storage</strong><small>' +
      st +
      ' total</small></div><span class="wt-set-arrow">&#8250;</span></div>\
        <div class="wt-set-item" data-action="laptop-battery"><span class="wt-set-icon">&#128267;</span><div><strong>Battery</strong><small>Power settings</small></div><span class="wt-set-arrow">&#8250;</span></div>\
        <div class="wt-set-item" data-action="laptop-wallpaper"><span class="wt-set-icon">&#127912;</span><div><strong>Personalization</strong><small>Wallpaper & theme</small></div><span class="wt-set-arrow">&#8250;</span></div>\
        <div class="wt-set-item"><span class="wt-set-icon">&#128424;</span><div><strong>Display</strong><small>1920 &times; 1080</small></div><span class="wt-set-arrow">&#8250;</span></div>\
        <div class="wt-set-item"><span class="wt-set-icon">&#128266;&#65039;</span><div><strong>Sound</strong><small>Speakers ready</small></div><span class="wt-set-arrow">&#8250;</span></div>\
      </div>\
    </div>';
  }

  function laptopStorageView(stNum) {
    const used = Math.floor(stNum * 0.55);
    const free = stNum - used;
    const pct = Math.round((used / stNum) * 100);
    return '\
    <div class="wt-window" style="width:78%;height:75%">\
      <div class="wt-win-hdr"><span>&#128190; Storage</span><button class="wt-win-close" data-action="desktop">&times;</button></div>\
      <div class="wt-win-body">\
        <div class="wt-sto-card">\
          <div class="wt-sto-bar"><div class="wt-sto-fill" style="width:' +
      pct +
      '%"></div></div>\
          <div class="wt-sto-info"><span>Local Disk (C:)</span><span>' +
      used +
      "GB used / " +
      free +
      "GB free</span></div>\
        </div>\
        <div class=\"wt-sec-title\">Drive C: Usage</div>\
        <div class=\"wt-usage-list\">\
          <div><span>&#128193; System Files</span><span>" +
      Math.floor(stNum * 0.18) +
      "GB</span></div>\
          <div><span>&#128193; Applications</span><span>" +
      Math.floor(stNum * 0.14) +
      "GB</span></div>\
          <div><span>&#128193; Users</span><span>" +
      Math.floor(stNum * 0.12) +
      "GB</span></div>\
          <div><span>&#128193; Temp Files</span><span>" +
      Math.floor(stNum * 0.06) +
      "GB</span></div>\
          <div><span>&#128193; Other</span><span>" +
      Math.floor(stNum * 0.05) +
      "GB</span></div>\
        </div>\
      </div>\
    </div>';
  }

  function laptopBatteryView() {
    const lvl = rand(60, 95);
    return '\
    <div class="wt-window" style="width:65%;height:65%">\
      <div class="wt-win-hdr"><span>&#128267; Battery</span><button class="wt-win-close" data-action="desktop">&times;</button></div>\
      <div class="wt-win-body">\
        <div class="wt-bat-card">\
          <div class="wt-bat-visual">\
            <div style="display:flex;align-items:center;gap:14px">\
              <div class="wt-bat-icon"><div class="wt-bat-fill" style="width:' +
      lvl +
      "%;background:" +
      (lvl > 20 ? "#34c759" : "#ff3b30") +
      '"></div></div>\
              <span style="font-size:1.5rem;font-weight:800">' +
      lvl +
      '%</span>\
            </div>\
          </div>\
          <div class="wt-bat-stats">\
            <div><span>Status</span><strong>Plugged In</strong></div>\
            <div><span>Health</span><strong>' +
      rand(78, 92) +
      '%</strong></div>\
            <div><span>Est. Time</span><strong>' +
      rand(2, 8) +
      "h " +
      rand(10, 50) +
      'm left</strong></div>\
            <div><span>Cycle Count</span><strong>' +
      rand(30, 180) +
      "</strong></div>\
          </div>\
        </div>\
      </div>\
    </div>";
  }

  function laptopAboutView(p, st, ram) {
    return '\
    <div class="wt-window" style="width:72%;height:78%">\
      <div class="wt-win-hdr"><span>&#8505;&#65039; About This PC</span><button class="wt-win-close" data-action="desktop">&times;</button></div>\
      <div class="wt-win-body">\
        <div class="wt-about-list">\
          <div><span>Device Name</span><strong>' +
      escHtml(p.name.split(" ").slice(0, 2).join(" ")) +
      '</strong></div>\
          <div><span>Model</span><strong>' +
      escHtml(p.name) +
      '</strong></div>\
          <div><span>OS</span><strong>Windows 11 / macOS</strong></div>\
          <div><span>Processor</span><strong>Intel Core i5 / Apple Silicon</strong></div>\
          <div><span>RAM</span><strong>' +
      ram +
      '</strong></div>\
          <div><span>Storage</span><strong>' +
      st +
      " SSD</strong></div>\
          <div><span>Display</span><strong>15.6-inch / 13.3-inch</strong></div>\
          <div><span>Resolution</span><strong>1920 &times; 1080</strong></div>\
          <div><span>Serial</span><strong>CH-LT-" +
      String(rand(1000, 9999)) +
      "</strong></div>\
        </div>\
      </div>\
    </div>";
  }

  function laptopWallpaperView() {
    return '\
    <div class="wt-window" style="width:72%;height:78%">\
      <div class="wt-win-hdr"><span>&#127912; Personalization</span><button class="wt-win-close" data-action="desktop">&times;</button></div>\
      <div class="wt-win-body">\
        <div class="wt-sec-title">Choose Wallpaper</div>\
        <div class="wt-wp-grid">' +
      currentWallpapers
        .map(function (wp, i) {
          return (
            '<div class="wt-wp-opt" data-wp="' +
            i +
            '" style="background:' +
            wp +
            ';width:80px;height:60px">' +
            (i === currentWallpaper ? "&#10003;" : "") +
            "</div>"
          );
        })
        .join("") +
      '</div>\
        <p style="color:#8e8e93;font-size:0.78rem;text-align:center;margin-top:12px">Tap to apply</p>\
      </div>\
    </div>';
  }

  function laptopFilesView() {
    return '\
    <div class="wt-window" style="width:82%;height:82%">\
      <div class="wt-win-hdr"><span>&#128193; File Explorer</span><button class="wt-win-close" data-action="desktop">&times;</button></div>\
      <div class="wt-win-body" style="padding:0">\
        <div class="wt-files-sidebar">\
          <div>&#128451; This PC</div>\
          <div>&#128190; Local Disk (C:)</div>\
          <div>&#128190; Data (D:)</div>\
          <div>&#128259; DVD Drive (E:)</div>\
          <div>&#128193; Documents</div>\
          <div>&#128193; Downloads</div>\
          <div>&#128193; Desktop</div>\
        </div>\
        <div class="wt-files-main">\
          <div class="wt-file-row">&#128193; Windows</div>\
          <div class="wt-file-row">&#128193; Program Files</div>\
          <div class="wt-file-row">&#128193; Users</div>\
          <div class="wt-file-row">&#128193; CircuitHouse</div>\
          <div class="wt-file-row">&#128196; README.txt</div>\
          <div class="wt-file-row">&#128444; wallpaper.jpg</div>\
          <div class="wt-file-row">&#127911; song.mp3</div>\
          <div class="wt-file-row">&#127916; video.mp4</div>\
        </div>\
      </div>\
    </div>';
  }

  /* ---- Bindings ---- */
  function bindBackButtons() {
    const screen = document.getElementById("wtScreen");
    if (!screen) return;
    screen.querySelectorAll('[data-action="back"]').forEach(function (el) {
      el.addEventListener("click", function () {
        if (activeProduct && activeProduct.category === "Phone") {
          renderHomeScreen();
          setHint("Tap an app to explore");
        } else {
          renderDesktop();
          setHint("Click icons to explore");
        }
      });
    });
    /* Settings items that navigate */
    screen.querySelectorAll(".wt-set-item[data-action]").forEach(function (el) {
      el.addEventListener("click", function () {
        const action = el.dataset.action;
        if (activeProduct && activeProduct.category === "Phone") {
          openPhoneApp(action);
        } else {
          openLaptopApp(action);
        }
      });
    });
  }

  function bindDesktopClicks() {
    const screen = document.getElementById("wtScreen");
    if (!screen) return;
    screen.querySelectorAll(".wt-desktop-icon").forEach(function (el) {
      el.addEventListener("click", function () {
        openLaptopApp(el.dataset.action);
      });
    });
    screen.querySelectorAll(".wt-start").forEach(function (el) {
      el.addEventListener("click", function () {
        if (el.dataset.action === "desktop") {
          renderDesktop();
        } else {
          openLaptopApp("laptop-settings");
        }
      });
    });
    screen.querySelectorAll(".wt-tb-icon").forEach(function (el) {
      el.addEventListener("click", function () {
        openLaptopApp(el.dataset.action);
      });
    });
  }

  function bindDesktopActions() {
    const screen = document.getElementById("wtScreen");
    if (!screen) return;
    screen.querySelectorAll(".wt-start[data-action='desktop']").forEach(function (el) {
      el.addEventListener("click", function () {
        renderDesktop();
      });
    });
    screen.querySelectorAll(".wt-tb-icon, .wt-desktop-icon").forEach(function (el) {
      el.addEventListener("click", function () {
        openLaptopApp(el.dataset.action);
      });
    });
    /* Settings items in laptop */
    screen.querySelectorAll(".wt-set-item[data-action]").forEach(function (el) {
      el.addEventListener("click", function () {
        openLaptopApp(el.dataset.action);
      });
    });
  }

  function bindWallpaper() {
    const screen = document.getElementById("wtScreen");
    if (!screen) return;
    screen.querySelectorAll(".wt-wp-opt").forEach(function (el) {
      el.addEventListener("click", function () {
        const i = parseInt(el.dataset.wp);
        if (!isNaN(i) && currentWallpapers[i]) {
          currentWallpaper = i;
          setHint("Wallpaper applied!");
          setTimeout(function () {
            setHint(
              activeProduct && activeProduct.category === "Phone"
                ? "Tap an app to explore"
                : "Click icons to explore"
            );
          }, 1500);
          if (activeProduct && activeProduct.category === "Phone") {
            renderHomeScreen();
          } else {
            renderDesktop();
          }
        }
      });
    });
  }

  /* ---- Delegation for .experience-btn ---- */
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".experience-btn");
    if (!btn) return;
    e.preventDefault();

    // Use data attributes for reliable product lookup
    const productName = btn.getAttribute("data-product-name");
    const category = btn.getAttribute("data-category");

    if (!productName) {
      // Fallback: try h3 text
      const card = btn.closest(".product-card");
      if (!card) return;
      const nameEl = card.querySelector("h3");
      if (!nameEl) return;
      const name = nameEl.textContent.trim();
      if (typeof PRODUCTS !== "undefined") {
        const product = PRODUCTS.find(function (p) {
          return p.name === name;
        });
        if (product && (product.category === "Laptop" || product.category === "Phone")) {
          createModal(product);
        }
      }
      return;
    }

    if (typeof PRODUCTS !== "undefined") {
      const product = PRODUCTS.find(function (p) {
        return p.name === productName;
      });
      if (product) {
        createModal(product);
      } else if (category === "Laptop" || category === "Phone") {
        // Product not found in array - show a basic simulation with available info
        createModal({
          name: productName,
          category: category,
          description: "Experience this device in an interactive simulation",
          price: 0,
        });
      }
    }
  });

  /* Export */
  window.Walkthrough = {
    open: function (product) {
      if (product && product.name) createModal(product);
    },
  };
})();
