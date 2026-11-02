/* Carregado só depois do envio válido do formulário. Não referenciar no HTML. */
(function () {
  var base = document.currentScript && document.currentScript.src;
  if (!base) return;
  window.BASALT_PLAYBOOK_DOWNLOADS = {
    claro: {
      href: new URL("../downloads/playbook-sap-activate-v1-claro.pdf", base).href,
      file: "playbook-sap-activate-v1-claro.pdf"
    },
    escuro: {
      href: new URL("../downloads/playbook-sap-activate-v1-escuro.pdf", base).href,
      file: "playbook-sap-activate-v1-escuro.pdf"
    }
  };
})();
