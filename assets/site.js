(function () {
  var links = document.querySelectorAll("[data-target]");
  var ids = ["inicio", "activate", "templates", "para-quem", "sobre"];
  var sections = ids.map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);
  if (!links.length || !sections.length) return;

  var pin = null;
  var pinY = 0;

  function setCurrent(id) {
    links.forEach(function (link) {
      if (link.getAttribute("data-target") === id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  function fromScroll() {
    var line = 120;
    var current = sections[0].id;
    sections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= line) current = sec.id;
    });
    return current;
  }

  function update() {
    if (pin && Math.abs(window.scrollY - pinY) < 48) {
      setCurrent(pin);
      return;
    }
    pin = null;
    setCurrent(fromScroll());
  }

  links.forEach(function (link) {
    link.addEventListener("click", function () {
      pin = link.getAttribute("data-target");
      pinY = window.scrollY;
      setCurrent(pin);
    });
  });

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
})();
