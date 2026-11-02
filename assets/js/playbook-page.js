(function () {
  var img = document.getElementById("preview-img");
  var open = document.getElementById("preview-open");
  var buttons = document.querySelectorAll("[data-preview]");
  if (!img || !open || !buttons.length) return;

  var previews = {
    claro: {
      src: "../assets/playbook/playbook-sap-activate-v1-claro-1600.webp",
      srcset: "../assets/playbook/playbook-sap-activate-v1-claro-1600.webp 1600w, ../assets/playbook/playbook-sap-activate-v1-claro-2400.webp 2400w",
      zoom: "../assets/playbook/playbook-sap-activate-v1-claro-3200.webp",
      width: 2400,
      height: 1350,
      alt: "Prévia do Playbook SAP Activate em versão clara, em uma página."
    },
    escuro: {
      src: "../assets/playbook/playbook-sap-activate-v1-escuro-1600.webp",
      srcset: "../assets/playbook/playbook-sap-activate-v1-escuro-1600.webp 1600w, ../assets/playbook/playbook-sap-activate-v1-escuro-2400.webp 2400w",
      zoom: "../assets/playbook/playbook-sap-activate-v1-escuro-3200.webp",
      width: 2400,
      height: 1350,
      alt: "Prévia do Playbook SAP Activate em versão escura, em uma página."
    },
    lado: {
      src: "../assets/playbook/playbook-sap-activate-comparacao-1400.webp",
      srcset: "../assets/playbook/playbook-sap-activate-comparacao-1400.webp 1400w, ../assets/playbook/playbook-sap-activate-comparacao-2200.webp 2200w",
      zoom: "../assets/playbook/playbook-sap-activate-comparacao-3200.webp",
      width: 3200,
      height: 937,
      alt: "Prévia das versões escura e clara do Playbook SAP Activate, lado a lado."
    }
  };

  function show(key) {
    var item = previews[key];
    if (!item) return;
    img.src = item.src;
    img.srcset = item.srcset;
    img.width = item.width;
    img.height = item.height;
    img.alt = item.alt;
    open.href = item.zoom;
    Array.prototype.forEach.call(buttons, function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-preview") === key ? "true" : "false");
    });
  }

  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener("click", function () {
      show(button.getAttribute("data-preview"));
    });
  });
})();
