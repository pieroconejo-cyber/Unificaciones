"use strict";

/* =========================================================
   1. ESPACIOS PARA IMÁGENES
   Si una imagen no existe todavía en la carpeta img/,
   se muestra un recuadro que dice qué imagen poner y su nombre.
   ========================================================= */
document.querySelectorAll(".foto").forEach((figura) => {
  const img = figura.querySelector("img");
  if (!img) return;

  const hueco = document.createElement("div");
  hueco.className = "hueco";
  hueco.innerHTML = `
    <span class="hueco-icono" aria-hidden="true">🖼️</span>
    <strong>${img.dataset.hint || img.alt}</strong>
    <code>${img.getAttribute("src")}</code>`;
  img.after(hueco);

  const marcarVacia = () => figura.classList.add("vacia");
  if (img.complete && img.naturalWidth === 0) marcarVacia();
  img.addEventListener("error", marcarVacia);
  img.addEventListener("load", () => figura.classList.remove("vacia"));

  // Permite abrir la imagen también con el teclado
  img.tabIndex = 0;
});

/* =========================================================
   2. VISOR: ampliar imágenes al hacer clic (útil al exponer)
   ========================================================= */
const visor = document.getElementById("visor");
const visorImg = document.getElementById("visorImg");
const visorTxt = document.getElementById("visorTxt");

function abrirVisor(img) {
  const figura = img.closest(".foto");
  if (!figura || figura.classList.contains("vacia")) return;
  const pie = figura.querySelector("figcaption");
  visorImg.src = img.src;
  visorImg.alt = img.alt;
  visorTxt.textContent = pie ? pie.textContent : img.alt;
  visor.showModal();
}

document.addEventListener("click", (e) => {
  const img = e.target.closest(".foto img");
  if (img) abrirVisor(img);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.matches(".foto img")) abrirVisor(e.target);
});

document.getElementById("visorCerrar").addEventListener("click", () => visor.close());
visor.addEventListener("click", (e) => {
  if (e.target === visor) visor.close();
});

/* =========================================================
   3. TABLA COMPARATIVA: descubrir fila por fila
   ========================================================= */
document.querySelectorAll("[data-comparar] .fila").forEach((fila) => {
  fila.addEventListener("click", () => {
    const abierta = fila.classList.toggle("abierta");
    fila.setAttribute("aria-expanded", abierta);
  });
});

document.querySelectorAll("[data-revelar-todo]").forEach((boton) => {
  const tabla = document.getElementById(boton.dataset.revelarTodo);
  const textoOriginal = boton.textContent;

  boton.addEventListener("click", () => {
    const filas = tabla.querySelectorAll(".fila");
    const todasAbiertas = [...filas].every((f) => f.classList.contains("abierta"));
    filas.forEach((f) => {
      f.classList.toggle("abierta", !todasAbiertas);
      f.setAttribute("aria-expanded", !todasAbiertas);
    });
    boton.textContent = todasAbiertas ? textoOriginal : "Ocultar respuestas";
  });
});

/* =========================================================
   4. ¿QUIÉN GANÓ? Revelar el proyecto que se impuso
   ========================================================= */
document.querySelectorAll("[data-ganador]").forEach((bloque) => {
  const boton = bloque.querySelector("[data-revelar-ganador]");
  const textoOriginal = boton.textContent;

  boton.addEventListener("click", () => {
    const revelado = bloque.classList.toggle("revelado");
    boton.textContent = revelado ? "Ocultar respuesta" : textoOriginal;
  });
});

/* =========================================================
   5. ETAPAS: pestañas con botones Anterior / Siguiente
   ========================================================= */
document.querySelectorAll("[data-etapas]").forEach((caja) => {
  const pestanas = [...caja.querySelectorAll('[role="tab"]')];
  const paneles = [...caja.querySelectorAll('[role="tabpanel"]')];
  const btnAnterior = caja.querySelector("[data-prev]");
  const btnSiguiente = caja.querySelector("[data-next]");
  const cuenta = caja.querySelector(".etapas-cuenta");
  let actual = 0;

  function irA(indice, enfocar = false) {
    actual = Math.max(0, Math.min(indice, pestanas.length - 1));

    pestanas.forEach((p, i) => {
      const elegida = i === actual;
      p.setAttribute("aria-selected", elegida);
      p.tabIndex = elegida ? 0 : -1;
      p.classList.toggle("hecha", i < actual);
      paneles[i].hidden = !elegida;
    });

    cuenta.textContent = `${actual + 1} de ${pestanas.length}`;
    btnAnterior.disabled = actual === 0;
    btnSiguiente.disabled = actual === pestanas.length - 1;
    if (enfocar) pestanas[actual].focus();
  }

  pestanas.forEach((p, i) => {
    p.addEventListener("click", () => irA(i));
    p.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        irA(actual + 1, true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        irA(actual - 1, true);
      }
    });
  });

  btnAnterior.addEventListener("click", () => irA(actual - 1));
  btnSiguiente.addEventListener("click", () => irA(actual + 1));

  irA(0);
});

/* =========================================================
   6. LÍNEA DE TIEMPO: filtrar por país
   ========================================================= */
const botonesFiltro = document.querySelectorAll("[data-filtro]");
const eventos = document.querySelectorAll(".linea li");

botonesFiltro.forEach((boton) => {
  boton.addEventListener("click", () => {
    const filtro = boton.dataset.filtro;
    botonesFiltro.forEach((b) => b.setAttribute("aria-pressed", b === boton));
    eventos.forEach((li) => {
      const pais = li.dataset.pais;
      li.hidden = !(filtro === "todo" || pais === filtro || pais === "ambos");
    });
  });
});

/* =========================================================
   7. NAVEGACIÓN: sección activa y barra de progreso
   ========================================================= */
const secciones = [...document.querySelectorAll(".seccion")];
const enlaces = [...document.querySelectorAll(".barra-enlaces a")];
const progreso = document.getElementById("progreso");

const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      enlaces.forEach((a) =>
        a.classList.toggle("activo", a.getAttribute("href") === `#${entrada.target.id}`)
      );
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
secciones.forEach((s) => observador.observe(s));

function actualizarProgreso() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const porcentaje = total > 0 ? (window.scrollY / total) * 100 : 0;
  progreso.style.width = `${porcentaje}%`;
  if (document.body.classList.contains("expo")) actualizarCuentaExpo();
}
window.addEventListener("scroll", actualizarProgreso, { passive: true });
actualizarProgreso();

/* =========================================================
   8. MODO EXPOSICIÓN
   Secciones a pantalla completa y cambio con las flechas
   ========================================================= */
const btnExpo = document.getElementById("btnExpo");
const expoCuenta = document.getElementById("expoCuenta");
const diapositivas = [document.getElementById("inicio"), ...secciones];
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function indiceActual() {
  const limite = window.innerHeight * 0.35;
  let indice = 0;
  diapositivas.forEach((d, i) => {
    if (d.getBoundingClientRect().top <= limite) indice = i;
  });
  return indice;
}

function actualizarCuentaExpo() {
  expoCuenta.textContent = `Sección ${indiceActual() + 1} de ${diapositivas.length}`;
}

function irADiapositiva(i) {
  const destino = diapositivas[Math.max(0, Math.min(i, diapositivas.length - 1))];
  destino.scrollIntoView({ behavior: sinMovimiento ? "auto" : "smooth", block: "start" });
}

function cambiarExpo(activar) {
  document.body.classList.toggle("expo", activar);
  document.documentElement.classList.toggle("modo-expo", activar);
  btnExpo.setAttribute("aria-pressed", activar);
  btnExpo.textContent = activar ? "Salir de exposición" : "Modo exposición";
  if (activar) actualizarCuentaExpo();
  else if (document.fullscreenElement) document.exitFullscreen();
}

btnExpo.addEventListener("click", () => {
  cambiarExpo(!document.body.classList.contains("expo"));
});

document.addEventListener("keydown", (e) => {
  if (!document.body.classList.contains("expo") || visor.open) return;

  switch (e.key) {
    case "ArrowRight":
    case "ArrowDown":
    case "PageDown":
      e.preventDefault();
      irADiapositiva(indiceActual() + 1);
      break;
    case "ArrowLeft":
    case "ArrowUp":
    case "PageUp":
      e.preventDefault();
      irADiapositiva(indiceActual() - 1);
      break;
    case "f":
    case "F":
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
      break;
    case "Escape":
      cambiarExpo(false);
      break;
  }
});

/* =========================================================
   9. QUIZ DE REPASO
   ========================================================= */
const preguntas = [
  {
    texto: "¿Qué Estado impulsó la unificación italiana?",
    opciones: ["Prusia", "Piamonte-Cerdeña", "El reino de Nápoles", "Los Estados Pontificios"],
    correcta: 1,
    explicacion: "El reino de Piamonte-Cerdeña, en el norte, con Cavour como jefe de gobierno.",
  },
  {
    texto: "¿Qué proyecto de unificación se impuso en Italia?",
    opciones: [
      "La república de Mazzini y Garibaldi",
      "La confederación de Gioberti",
      "La monarquía constitucional de Cavour",
    ],
    correcta: 2,
    explicacion: "Italia se unió como monarquía constitucional alrededor del Piamonte y Víctor Manuel II.",
  },
  {
    texto: "¿Qué tuvo que ceder el Piamonte a Francia tras la guerra de 1859?",
    opciones: ["Lombardía y Venecia", "Niza y Saboya", "Alsacia y Lorena", "Roma"],
    correcta: 1,
    explicacion: "Niza y Saboya fueron el precio de la ayuda de Napoleón III contra Austria.",
  },
  {
    texto: "¿Qué era el Zollverein?",
    opciones: [
      "El parlamento de Fráncfort",
      "Una unión aduanera creada en 1834 alrededor de Prusia",
      "Un tratado de paz con Francia",
      "El ejército de Bismarck",
    ],
    correcta: 1,
    explicacion: "Unió económicamente a los estados alemanes antes de unirlos políticamente.",
  },
  {
    texto: "¿Qué significaba la «Pequeña Alemania»?",
    opciones: [
      "Una Alemania dirigida por Prusia y sin Austria",
      "Una Alemania dirigida por Austria",
      "Solo los estados católicos del sur",
      "Solo los ducados de Schleswig y Holstein",
    ],
    correcta: 0,
    explicacion: "Fue la opción que ganó, liderada por Bismarck y Guillermo I.",
  },
  {
    texto: "¿Qué batalla dejó a Austria fuera de la unificación alemana?",
    opciones: ["Sedán", "Solferino", "Sadowa", "Magenta"],
    correcta: 2,
    explicacion: "Sadowa (1866). Como consecuencia, Italia también ganó el Véneto.",
  },
  {
    texto: "¿Por qué la derrota de Francia en 1870 ayudó a Italia?",
    opciones: [
      "Francia dejó de proteger al papa y las tropas italianas ocuparon Roma",
      "Francia devolvió Niza y Saboya",
      "Garibaldi conquistó París",
      "Austria entregó Lombardía",
    ],
    correcta: 0,
    explicacion: "Sin la protección de Napoleón III, Roma pudo ser ocupada y convertida en capital.",
  },
  {
    texto: "¿Qué territorios obtuvo Alemania con el Tratado de Fráncfort (1871)?",
    opciones: ["Alsacia y Lorena", "El Véneto", "Schleswig y Holstein", "Niza y Saboya"],
    correcta: 0,
    explicacion: "Francia cedió Alsacia y Lorena al nuevo Imperio alemán.",
  },
];

const quiz = document.getElementById("quiz");
let numPregunta = 0;
let aciertos = 0;
let respondida = false;

function mostrarPregunta() {
  if (numPregunta >= preguntas.length) return mostrarResultado();

  const p = preguntas[numPregunta];
  const esUltima = numPregunta === preguntas.length - 1;
  respondida = false;

  quiz.innerHTML = `
    <p class="quiz-cuenta">Pregunta ${numPregunta + 1} de ${preguntas.length}</p>
    <div class="quiz-barra"><span style="width:${(numPregunta / preguntas.length) * 100}%"></span></div>
    <h3 class="quiz-pregunta">${p.texto}</h3>
    <div class="quiz-opciones">
      ${p.opciones.map((op, i) => `<button class="quiz-op" data-op="${i}">${op}</button>`).join("")}
    </div>
    <p class="quiz-feedback"></p>
    <div class="quiz-pie">
      <span>Aciertos: ${aciertos}</span>
      <button class="boton" data-siguiente hidden>${esUltima ? "Ver resultado" : "Siguiente pregunta"}</button>
    </div>`;
}

function responder(elegida) {
  if (respondida) return;
  respondida = true;

  const p = preguntas[numPregunta];
  const botones = quiz.querySelectorAll(".quiz-op");
  const feedback = quiz.querySelector(".quiz-feedback");
  const acierto = elegida === p.correcta;

  if (acierto) aciertos++;
  botones.forEach((b, i) => {
    b.disabled = true;
    if (i === p.correcta) b.classList.add("correcta");
    else if (i === elegida) b.classList.add("incorrecta");
  });

  feedback.innerHTML = acierto
    ? `<strong class="bien">¡Correcto!</strong> ${p.explicacion}`
    : `<strong class="mal">No es esa.</strong> ${p.explicacion}`;

  quiz.querySelector(".quiz-pie span").textContent = `Aciertos: ${aciertos}`;
  const siguiente = quiz.querySelector("[data-siguiente]");
  siguiente.hidden = false;
  siguiente.focus();
}

function mostrarResultado() {
  const total = preguntas.length;
  let mensaje = "Repasa las etapas y la línea de tiempo, y vuelve a intentarlo.";
  if (aciertos === total) mensaje = "¡Perfecto! Dominas las dos unificaciones.";
  else if (aciertos >= total * 0.75) mensaje = "¡Muy bien! Solo se te escaparon algunos detalles.";
  else if (aciertos >= total * 0.5) mensaje = "Vas bien. Revisa los cruces entre Italia y Alemania.";

  quiz.innerHTML = `
    <div class="quiz-final">
      <p class="quiz-cuenta">Resultado final</p>
      <p class="nota">${aciertos} / ${total}</p>
      <p>${mensaje}</p>
      <button class="boton" data-reiniciar>Volver a empezar</button>
    </div>`;
}

quiz.addEventListener("click", (e) => {
  const opcion = e.target.closest(".quiz-op");
  if (opcion) return responder(Number(opcion.dataset.op));

  if (e.target.closest("[data-siguiente]")) {
    numPregunta++;
    mostrarPregunta();
    quiz.querySelector(".quiz-op, [data-reiniciar]")?.focus();
  }

  if (e.target.closest("[data-reiniciar]")) {
    numPregunta = 0;
    aciertos = 0;
    mostrarPregunta();
  }
});

mostrarPregunta();
