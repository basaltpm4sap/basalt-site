/*
 * Modal de download do Playbook SAP Activate.
 *
 * APPS_SCRIPT_URL: cole aqui a URL /exec publicada pelo fundador.
 * Vazia: em localhost e no preview da Vercel o envio é simulado e nada
 * é gravado. Fora desses ambientes, sem URL, o download não abre.
 *
 * O POST usa text/plain e mode "no-cors" para não disparar o preflight
 * que o Apps Script não responde. A resposta é opaca: o site não lê o JSON.
 * Se o fetch falhar (rede ou o redirecionamento do Apps Script), o download
 * é liberado mesmo assim. O motivo está em apps-script/PASSO-A-PASSO.md.
 *
 * Não há envio do link por e-mail.
 */
(function () {
  var APPS_SCRIPT_URL = "";
  var CONSENT_VERSION = "lgpd-v1-2026-11-02";
  var PRODUCTION_HOSTS = [];

  var MESSAGES = {
    emailEmpty: "Informe seu e-mail para receber o playbook.",
    emailInvalid: "Confira o e-mail: parece que falta algo no endereço.",
    unconfigured: "O cadastro ainda não está ativo neste ambiente.",
    preview: "Prévia: o envio foi simulado e nenhum dado foi armazenado.",
    network: "Não deu para confirmar o envio. O download está liberado mesmo assim.",
    sending: "Enviando…"
  };

  var DOWNLOAD_LABELS = [
    { key: "claro", label: "Versão clara (impressão)" },
    { key: "escuro", label: "Versão escura (tela)" }
  ];

  var modal = document.getElementById("playbook-modal");
  var dialog = modal ? modal.querySelector("[role='dialog']") : null;
  var form = modal ? modal.querySelector("[data-lead-form]") : null;
  if (!modal || !dialog || !form || !document.currentScript) return;

  var emailInput = document.getElementById("email");
  var consentInput = document.getElementById("consent");
  var hpInput = document.getElementById("hp_field");
  var errorEl = document.getElementById("email-erro");
  var statusEl = form.querySelector("[data-form-status]");
  var successEl = modal.querySelector("[data-success]");
  var downloadsEl = modal.querySelector("[data-downloads]");
  var previewNote = modal.querySelector("[data-preview-note]");
  var networkNote = modal.querySelector("[data-network-note]");
  var submitButton = form.querySelector("[type='submit']");
  var successTitle = document.getElementById("sucesso-titulo");
  var downloadsScript = new URL("playbook-downloads.js", document.currentScript.src).href;
  var triggers = document.querySelectorAll("[data-open-playbook]");
  var lastTrigger = null;
  var busy = false;
  var unlocked = false;
  var withDownloads = false;
  var previewMode = false;
  var networkMode = false;

  function hostIs(value, suffix) {
    if (value.length < suffix.length) return false;
    return value.indexOf(suffix, value.length - suffix.length) !== -1;
  }

  function isPreviewEnvironment() {
    var host = String(location.hostname || "").toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "[::1]"
    ) {
      return true;
    }
    if (PRODUCTION_HOSTS.indexOf(host) !== -1) return false;
    if (hostIs(host, ".vercel.app")) {
      if (host.indexOf("-git-") !== -1) return true;
      var sub = host.slice(0, -".vercel.app".length);
      return sub.split("-").length > 2;
    }
    return false;
  }

  function isEmail(value) {
    if (!value || value.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function showError(message) {
    if (errorEl) errorEl.textContent = message;
    if (emailInput) {
      emailInput.setAttribute("aria-invalid", "true");
      emailInput.focus();
    }
  }

  function clearError() {
    if (errorEl) errorEl.textContent = "";
    if (emailInput) emailInput.setAttribute("aria-invalid", "false");
    if (statusEl) statusEl.textContent = "";
  }

  function setBusy(next) {
    busy = next;
    if (!submitButton) return;
    submitButton.disabled = next;
    if (next) submitButton.setAttribute("aria-disabled", "true");
    else submitButton.removeAttribute("aria-disabled");
    if (next) form.setAttribute("aria-busy", "true");
    else form.removeAttribute("aria-busy");
  }

  function setInert(on) {
    Array.prototype.forEach.call(document.body.children, function (child) {
      if (child === modal) return;
      if (on) child.setAttribute("inert", "");
      else child.removeAttribute("inert");
    });
  }

  function focusable() {
    return Array.prototype.filter.call(
      dialog.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])"),
      function (el) {
        if (el.tabIndex < 0) return false;
        var node = el;
        while (node && node !== dialog) {
          if (node.hasAttribute("hidden")) return false;
          node = node.parentElement;
        }
        return true;
      }
    );
  }

  function onKey(event) {
    if (modal.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    var nodes = focusable();
    if (!nodes.length) return;
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function showFormView() {
    form.hidden = false;
    if (successEl) successEl.hidden = true;
    dialog.setAttribute("aria-labelledby", "playbook-modal-title");
  }

  function showSuccessView() {
    form.hidden = true;
    if (successEl) successEl.hidden = false;
    dialog.setAttribute("aria-labelledby", "sucesso-titulo");
    if (previewNote) {
      previewNote.hidden = !previewMode;
      previewNote.textContent = previewMode ? MESSAGES.preview : "";
    }
    if (networkNote) {
      networkNote.hidden = !networkMode;
      networkNote.textContent = networkMode ? MESSAGES.network : "";
    }
    if (successTitle) successTitle.focus();
  }

  function openModal(trigger) {
    lastTrigger = trigger || null;
    if (trigger) trigger.setAttribute("aria-expanded", "true");
    modal.hidden = false;
    document.documentElement.style.overflow = "hidden";
    setInert(true);
    document.addEventListener("keydown", onKey);
    if (unlocked) showSuccessView();
    else {
      showFormView();
      clearError();
      if (emailInput) emailInput.focus();
    }
  }

  function closeModal() {
    modal.hidden = true;
    document.documentElement.style.overflow = "";
    setInert(false);
    document.removeEventListener("keydown", onKey);
    if (lastTrigger) {
      lastTrigger.setAttribute("aria-expanded", "false");
      lastTrigger.focus();
    }
  }

  function loadDownloads() {
    return new Promise(function (resolve, reject) {
      if (window.BASALT_PLAYBOOK_DOWNLOADS) {
        resolve(window.BASALT_PLAYBOOK_DOWNLOADS);
        return;
      }
      var script = document.createElement("script");
      script.src = downloadsScript;
      script.onload = function () {
        if (window.BASALT_PLAYBOOK_DOWNLOADS) resolve(window.BASALT_PLAYBOOK_DOWNLOADS);
        else reject(new Error("missing"));
      };
      script.onerror = function () {
        reject(new Error("load"));
      };
      document.head.appendChild(script);
    });
  }

  function mountDownloads(files) {
    if (!downloadsEl) return false;
    downloadsEl.textContent = "";
    var mounted = 0;
    DOWNLOAD_LABELS.forEach(function (item) {
      var file = files[item.key];
      if (!file || !file.href) return;
      var link = document.createElement("a");
      link.className = "btn btn-download";
      link.href = file.href;
      link.setAttribute("download", file.file || "");
      link.textContent = item.label;
      downloadsEl.appendChild(link);
      mounted += 1;
    });
    return mounted === DOWNLOAD_LABELS.length;
  }

  function finish(options) {
    unlocked = true;
    withDownloads = !!options.downloads;
    previewMode = !!options.preview;
    networkMode = !!options.network;
    form.reset();
    setBusy(false);
    if (!withDownloads) {
      if (downloadsEl) downloadsEl.textContent = "";
      showSuccessView();
      return;
    }
    loadDownloads().then(
      function (files) {
        if (!mountDownloads(files)) {
          unlocked = false;
          withDownloads = false;
          setBusy(false);
          if (statusEl) statusEl.textContent = MESSAGES.unconfigured;
          showFormView();
          return;
        }
        showSuccessView();
      },
      function () {
        unlocked = false;
        setBusy(false);
        if (statusEl) statusEl.textContent = MESSAGES.unconfigured;
        showFormView();
      }
    );
  }

  function sendLead(lead) {
    if (!APPS_SCRIPT_URL) {
      if (isPreviewEnvironment()) {
        finish({ downloads: true, preview: true, network: false });
        return;
      }
      setBusy(false);
      if (statusEl) statusEl.textContent = MESSAGES.unconfigured;
      return;
    }
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        email: lead.email,
        name: "",
        consent: lead.consent === true,
        consentVersion: CONSENT_VERSION,
        hp_field: ""
      }),
      credentials: "omit"
    }).then(
      function () {
        finish({ downloads: true, preview: false, network: false });
      },
      function () {
        finish({ downloads: true, preview: false, network: true });
      }
    );
  }

  Array.prototype.forEach.call(triggers, function (trigger) {
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "playbook-modal");
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      openModal(trigger);
    });
  });

  modal.addEventListener("click", function (event) {
    var node = event.target;
    while (node && node !== modal) {
      if (node.hasAttribute && node.hasAttribute("data-close-modal")) {
        event.preventDefault();
        closeModal();
        return;
      }
      node = node.parentElement;
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (busy || unlocked) return;
    clearError();
    var email = emailInput ? emailInput.value.trim().toLowerCase() : "";
    var consent = !!(consentInput && consentInput.checked);
    if (!email) {
      showError(MESSAGES.emailEmpty);
      return;
    }
    if (!isEmail(email)) {
      showError(MESSAGES.emailInvalid);
      return;
    }
    if (hpInput && hpInput.value.trim() !== "") {
      finish({ downloads: false, preview: false, network: false });
      return;
    }
    setBusy(true);
    if (statusEl) statusEl.textContent = MESSAGES.sending;
    sendLead({ email: email, consent: consent });
  });
})();
