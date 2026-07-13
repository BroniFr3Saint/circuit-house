(function () {
  'use strict';

  var banner = document.createElement('div');
  banner.id = 'connection-banner';
  document.body.prepend(banner);

  var dismissTimer = null;
  var hideTimeout = null;

  function showBanner(type, message) {
    if (hideTimeout) clearTimeout(hideTimeout);

    banner.className = 'show ' + type;
    banner.innerHTML =
      '<span class="banner-icon">' +
      (type === 'offline' ? '🔌' : '✅') +
      '</span>' +
      message +
      '<button class="dismiss-btn" onclick="this.parentElement.className=\'\'">&times;</button>';

    if (type === 'online') {
      if (dismissTimer) clearTimeout(dismissTimer);
      dismissTimer = setTimeout(function () {
        banner.className = '';
      }, 4000);
    }
  }

  function updateOnlineStatus() {
    if (navigator.onLine) {
      showBanner('online', 'You\'re back online!');
    } else {
      showBanner('offline', 'No internet connection. Some features may be unavailable.');
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  if (!navigator.onLine) {
    showBanner('offline', 'No internet connection. Some features may be unavailable.');
  }
})();
