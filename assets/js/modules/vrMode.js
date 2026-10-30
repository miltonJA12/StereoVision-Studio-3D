
/* ==========================================
   STEREOVISION STUDIO 3D
   Modo VR / Google Cardboard
   ========================================== */

let vrActive = false;
let vrSource = null;
let vrSettings = null;

let frameId = null;
let leftCanvas = null;
let rightCanvas = null;

let resizeObserver = null;
let leaving = false;

const $ = (id) => document.getElementById(id);

function createEyeCanvas(label) {
  const canvas = document.createElement("canvas");

  canvas.setAttribute(
    "aria-label",
    `Perspectiva del ojo ${label}`
  );

  canvas.style.width = "50%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.background = "#000";
  canvas.style.objectFit = "contain";
  canvas.style.minWidth = "0";
  canvas.style.flex = "0 0 50%";

  return canvas;
}

function sourceDimensions() {
  if (!vrSource) return null;

  const isVideo =
    vrSource instanceof HTMLVideoElement;

  const width = isVideo
    ? vrSource.videoWidth
    : vrSource.naturalWidth;

  const height = isVideo
    ? vrSource.videoHeight
    : vrSource.naturalHeight;

  if (!width || !height || width < 2) {
    return null;
  }

  if (
    isVideo &&
    vrSource.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    return null;
  }

  return {
    width,
    height,
    eyeWidth: width / 2
  };
}

function drawEye(canvas, sourceEye, displayEye) {
  if (!canvas || !vrSource || !vrSettings) return;

  const dimensions = sourceDimensions();

  if (!dimensions) return;

  const rect = canvas.getBoundingClientRect();

  if (!rect.width || !rect.height) return;

  const dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  // Evita crear texturas Canvas excesivas.
  const factor = Math.min(
    1,
    2048 / (rect.width * dpr),
    2048 / (rect.height * dpr)
  );

  const outputWidth = Math.max(
    1,
    Math.round(rect.width * dpr * factor)
  );

  const outputHeight = Math.max(
    1,
    Math.round(rect.height * dpr * factor)
  );

  if (canvas.width !== outputWidth) {
    canvas.width = outputWidth;
  }

  if (canvas.height !== outputHeight) {
    canvas.height = outputHeight;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  ctx.clearRect(
    0,
    0,
    outputWidth,
    outputHeight
  );

  const { eyeWidth, height } = dimensions;

  const sourceX = sourceEye === "left"
    ? 0
    : eyeWidth;

  // Ajuste contain para conservar la proporción.
  const fit = Math.min(
    outputWidth / eyeWidth,
    outputHeight / height
  );

  const scale = vrSettings.scale / 100;

  const drawWidth = eyeWidth * fit * scale;
  const drawHeight = height * fit * scale;

  const displayScale = dpr * factor;

  const sign = displayEye === "left" ? -1 : 1;

  const offsetX =
    vrSettings.horizontal * displayScale * sign / 2;

  const offsetY =
    vrSettings.vertical * displayScale * sign / 2;

  const x =
    (outputWidth - drawWidth) / 2 + offsetX;

  const y =
    (outputHeight - drawHeight) / 2 + offsetY;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  try {
    ctx.drawImage(
      vrSource,
      sourceX,
      0,
      eyeWidth,
      height,
      x,
      y,
      drawWidth,
      drawHeight
    );
  } catch {
    // Se reintentará en el siguiente fotograma.
  }
}

export function renderVR() {
  if (!vrActive || !vrSource || !vrSettings) {
    return;
  }

  const leftSource = vrSettings.swapEyes
    ? "right"
    : "left";

  const rightSource = vrSettings.swapEyes
    ? "left"
    : "right";

  drawEye(leftCanvas, leftSource, "left");
  drawEye(rightCanvas, rightSource, "right");
}

function animationLoop() {
  frameId = null;

  if (!vrActive) return;

  renderVR();

  if (
    vrSource instanceof HTMLVideoElement &&
    !vrSource.paused &&
    !vrSource.ended
  ) {
    frameId = requestAnimationFrame(animationLoop);
  }
}

function stopAnimation() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
}

export function startVRRendering() {
  stopAnimation();

  if (!vrActive) return;

  renderVR();

  if (
    vrSource instanceof HTMLVideoElement &&
    !vrSource.paused &&
    !vrSource.ended
  ) {
    frameId = requestAnimationFrame(animationLoop);
  }
}

export function pauseVRRendering() {
  stopAnimation();
  renderVR();
}

function handleFullscreenChange() {
  if (
    vrActive &&
    !document.fullscreenElement
  ) {
    exitVR();
  }
}

function handleResize() {
  if (vrActive) {
    renderVR();
  }
}

export function isVRActive() {
  return vrActive;
}

export async function enterVR(source, settings) {
  if (vrActive) return true;

  if (!source || !settings) {
    return false;
  }

  const overlay = $("vrOverlay");
  const screen = $("vrScreen");

  vrSource = source;
  vrSettings = settings;
  vrActive = true;
  leaving = false;

  screen.replaceChildren();

  leftCanvas = createEyeCanvas("izquierdo");
  rightCanvas = createEyeCanvas("derecho");

  screen.append(leftCanvas, rightCanvas);

  overlay.classList.remove("hidden");

  document.body.style.overflow = "hidden";

  // Impide que la navegación del teclado
  // alcance controles ocultos del editor.
  $("app").setAttribute("inert", "");

  resizeObserver = new ResizeObserver(() => {
    renderVR();
  });

  resizeObserver.observe(screen);

  window.addEventListener("resize", handleResize);

  document.addEventListener(
    "fullscreenchange",
    handleFullscreenChange
  );

  renderVR();
  startVRRendering();

  // Fullscreen es opcional.
  // Si se rechaza, el visor permanece en la página.
  try {
    if (
      overlay.requestFullscreen &&
      !document.fullscreenElement
    ) {
      await overlay.requestFullscreen({
        navigationUI: "hide"
      });
    }
  } catch {
    console.info(
      "Pantalla completa no disponible; " +
      "se utiliza el visor integrado."
    );
  }

  // El bloqueo de orientación también es opcional.
  try {
    if (
      screen.orientation &&
      typeof screen.orientation.lock === "function"
    ) {
      await screen.orientation.lock("landscape");
    }
  } catch {
    console.info(
      "El navegador no permitió bloquear " +
      "la orientación."
    );
  }

  if (vrActive) {
    renderVR();
  }

  return vrActive;
}

export async function exitVR() {
  if (!vrActive || leaving) return;

  leaving = true;
  vrActive = false;

  stopAnimation();

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  window.removeEventListener(
    "resize",
    handleResize
  );

  document.removeEventListener(
    "fullscreenchange",
    handleFullscreenChange
  );

  try {
    if (
      screen.orientation &&
      typeof screen.orientation.unlock === "function"
    ) {
      screen.orientation.unlock();
    }
  } catch {
    // Desbloqueo no disponible.
  }

  $("vrOverlay").classList.add("hidden");
  $("vrScreen").replaceChildren();

  $("app").removeAttribute("inert");
  document.body.style.overflow = "";

  leftCanvas = null;
  rightCanvas = null;

  vrSource = null;
  vrSettings = null;

  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  } catch {
    // El visor ya fue cerrado.
  }

  leaving = false;

  document.dispatchEvent(
    new CustomEvent("stereovision:vrexit")
  );
}
