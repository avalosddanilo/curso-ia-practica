// IA práctica para emprendedores — formulario de inscripción.
// La validación de verdad la hace el servidor (apps-script/Code.gs).
// Esta es solo para avisar errores al toque.

(function () {
  "use strict";

  // URL del Apps Script publicado como aplicación web (termina en /exec).
  // No es una clave: es una dirección pública que solo acepta inscripciones válidas.
  var ENDPOINT = "";

  var WHATSAPP = "5493625176543";
  // La preventa termina el sábado 03/10/2026 a las 23:59 (hora de Argentina).
  var PRESALE_END = Date.parse("2026-10-04T00:00:00-03:00");

  var startedAt = Date.now();

  // ---------- Preventa: mostrar u ocultar según la fecha ----------
  var presale = Date.now() < PRESALE_END;
  document.querySelectorAll("[data-presale]").forEach(function (el) { el.hidden = !presale; });
  document.querySelectorAll("[data-regular]").forEach(function (el) { el.hidden = presale; });

  // ---------- Botón fijo en celular: aparece cuando el hero sale de pantalla ----------
  var sticky = document.querySelector("[data-sticky]");
  var hero = document.getElementById("hero");
  var enroll = document.getElementById("inscripcion");
  if (sticky && "IntersectionObserver" in window) {
    var heroVisible = true, enrollVisible = false;
    var update = function () { sticky.hidden = heroVisible || enrollVisible; };
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (e) { enrollVisible = e[0].isIntersecting; update(); }).observe(enroll);
  }

  // ---------- Formulario ----------
  var form = document.getElementById("form");
  var done = document.getElementById("done");
  var statusEl = form.querySelector("[data-status]");
  var submitBtn = form.querySelector("[data-submit]");

  var NAME_RE = /^[\p{L}][\p{L}\p{M} .'’-]{1,79}$/u;

  function clean(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  function digits(s) { return String(s || "").replace(/\D/g, ""); }

  function validate(d) {
    var err = {};
    if (!NAME_RE.test(d.nombre)) err.nombre = "Escribí tu nombre (solo letras, mínimo 2).";
    var tel = digits(d.telefono);
    if (tel.length < 10 || tel.length > 13) err.telefono = "Revisá el número: con código de área, ej. 362 4123456.";
    if (d.rubro.length < 2 || d.rubro.length > 100) err.rubro = "Contame en pocas palabras a qué te dedicás.";
    if (d.objetivo.length > 500) err.objetivo = "Máximo 500 caracteres.";
    if (!d.consentimiento) err.consentimiento = "Necesito tu OK para guardar tus datos.";
    return err;
  }

  function showErrors(err) {
    ["nombre", "telefono", "rubro", "objetivo", "consentimiento"].forEach(function (k) {
      var input = document.getElementById(k);
      var msg = document.getElementById(k + "-err");
      msg.textContent = err[k] || "";
      if (err[k]) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    });
    var first = Object.keys(err)[0];
    if (first) document.getElementById(first).focus();
  }

  function setStatus(msg, isError) {
    statusEl.textContent = "";
    statusEl.classList.toggle("is-error", !!isError);
    if (!msg) return;
    statusEl.append(msg + " ");
    if (isError) {
      var a = document.createElement("a");
      a.href = "https://wa.me/" + WHATSAPP;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Escribime por WhatsApp";
      statusEl.append(a);
    }
  }

  function showDone(nombre) {
    var first = nombre.split(" ")[0];
    done.querySelector("[data-name]").textContent = first;
    var text = "Hola Dani, soy " + nombre + ". Me acabo de inscribir a IA práctica para emprendedores.";
    done.querySelector("[data-wa]").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(text);
    form.hidden = true;
    done.hidden = false;
    done.focus();
    done.scrollIntoView({ block: "start" });
  }

  form.addEventListener("input", function (e) {
    var t = e.target;
    if (t.getAttribute("aria-invalid") === "true") {
      t.removeAttribute("aria-invalid");
      var msg = document.getElementById(t.id + "-err");
      if (msg) msg.textContent = "";
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("");

    var d = {
      nombre: clean(form.nombre.value),
      telefono: clean(form.telefono.value),
      rubro: clean(form.rubro.value),
      objetivo: String(form.objetivo.value || "").trim(),
      consentimiento: form.consentimiento.checked,
      avisos: form.avisos.checked,
      website: form.website.value
    };

    var err = validate(d);
    showErrors(err);
    if (Object.keys(err).length) return;

    if (!ENDPOINT) {
      setStatus("La inscripción todavía no está conectada.", true);
      return;
    }

    var body = new URLSearchParams({
      nombre: d.nombre,
      telefono: d.telefono,
      rubro: d.rubro,
      objetivo: d.objetivo,
      consentimiento: "si",
      avisos: d.avisos ? "si" : "",
      website: d.website,
      t: String(startedAt)
    });

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando…";

    fetch(ENDPOINT, { method: "POST", body: body })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok) { showDone(d.nombre); return; }
        if (res && res.errors) { showErrors(res.errors); }
        setStatus((res && res.message) || "No se pudo enviar.", true);
      })
      .catch(function () {
        setStatus("No se pudo enviar (¿sin señal?). Probá de nuevo.", true);
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Quiero mi lugar";
      });
  });

  // ---------- Copiar alias ----------
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var ok = function () {
        btn.textContent = "¡Copiado!";
        setTimeout(function () { btn.textContent = "Copiar"; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(ok, function () { selectAlias(); });
      } else {
        selectAlias();
      }
    });
  });

  function selectAlias() {
    var el = document.getElementById("alias");
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
})();
