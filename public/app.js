(function () {
  const badge = document.getElementById("conn-badge");
  const origin = document.getElementById("detail-origin");
  const health = document.getElementById("detail-health");
  const screenEl = document.getElementById("detail-screen");
  const ua = document.getElementById("detail-ua");

  origin.textContent = window.location.origin;
  screenEl.textContent =
    window.innerWidth + " × " + window.innerHeight + " @" + (window.devicePixelRatio || 1) + "x";
  ua.textContent = navigator.userAgent;

  function setBadge(state, label) {
    badge.className = "badge badge-" + state;
    badge.textContent = label;
  }

  async function checkHealth() {
    try {
      const res = await fetch("/health", { cache: "no-store" });
      const data = await res.json();
      setBadge("ok", "connected");
      health.textContent = data.status + " · " + new Date(data.time).toLocaleTimeString();
    } catch (err) {
      setBadge("fail", "offline");
      health.textContent = "unreachable";
    }
  }

  checkHealth();
  setInterval(checkHealth, 10000);

  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (t) {
        t.classList.remove("active");
      });
      tab.classList.add("active");
    });
  });
})();
