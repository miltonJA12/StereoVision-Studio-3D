
/* ==============================================
   STEREOVISION STUDIO 3D
   VR MODE - CALIBRACIÓN CARDBOARD
   ============================================== */

let vrActive = false;
let leaving = false;

let vrSource = null;
let vrSettings = null;

let leftCanvas = null;
let rightCanvas = null;

let animationId = null;
let resizeObserver = null;

let calibrationPanel = null;
let calibrationButton = null;

let previousOverflow = "";

const $ = id => document.getElementById(id);

/* ==============================================
   AJUSTES ESPECÍFICOS DEL VISOR
   ============================================== */

const DEFAULT_VR = Object.freeze({
  lensCenter: 0,
  imageSize: 85,
  imageHeight: 0,
  showGuides: false
});

let vrCalibration = {
  ...DEFAULT_VR
};

/* ==============================================
   ESTILOS DEL VISOR
   ============================================== */

function installVRStyles() {
  if ($("stereoVRCalibrationStyles")) return;

  const style = document.createElement("style");

  style.id = "stereoVRCalibrationStyles";

  style.textContent = `
    #vrScreen {
      display: flex;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }

    #vrScreen .vr-eye {
      position: relative;
      flex: 0 0 50%;
      width: 50%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }

    #vrScreen .vr-eye canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    #vrScreen .vr-guide {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 24px;
      height: 24px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 5;
    }

    #vrScreen .vr-guide::before,
    #vrScreen .vr-guide::after {
      content: "";
      position: absolute;
      background: #38d9ee;
      box-shadow: 0 0 3px #000;
    }

    #vrScreen .vr-guide::before {
      width: 2px;
      height: 24px;
      left: 11px;
      top: 0;
    }

    #vrScreen .vr-guide::after {
      width: 24px;
      height: 2px;
      left: 0;
      top: 11px;
    }

    .vr-calibration-button {
      position: absolute;
      z-index: 35;
      top: max(12px, env(safe-area-inset-top));
      left: max(12px, env(safe-area-inset-left));
      min-height: 44px;
      border: 1px solid rgba(255,255,255,.3);
      border-radius: 9px;
      padding: 10px 13px;
      background: rgba(10,16,30,.9);
      color: white;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .vr-calibration-panel {
      position: absolute;
      z-index: 34;
      top: calc(
        max(12px, env(safe-area-inset-top)) + 52px
      );
      left: max(12px, env(safe-area-inset-left));
      width: min(310px, 85vw);
      max-height: 62dvh;
      overflow-y: auto;
      background: rgba(10,16,30,.96);
      border: 1px solid #385070;
      border-radius: 12px;
      padding: 15px;
      color: white;
      font-family: system-ui, sans-serif;
      box-shadow: 0 10px 35px rgba(0,0,0,.5);
    }

    .vr-calibration-panel[hidden],
    .vr-calibration-button[hidden] {
      display: none !important;
    }

    .vr-calibration-panel h3 {
      margin: 0 0 8px;
      font-size: 14px;
      color: #eef4ff;
    }

    .vr-calibration-panel p {
      color: #a7b7cf;
      font-size: 11px;
      line-height: 1.6;
      margin: 0 0 12px;
    }

    .vr-calibration-control {
      margin: 0 0 14px;
    }

    .vr-calibration-label {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 12px;
      margin-bottom: 9px;
    }

    .vr-calibration-label output {
      color: #38d9ee;
      font-weight: 700;
    }

    .vr-calibration-control input[type="range"] {
      width: 100%;
      min-height: 24px;
      accent-color: #377dff;
      touch-action: pan-y;
    }

    .vr-calibration-check {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      margin-bottom: 15px;
      min-height: 35px;
    }

    .vr-calibration-check input {
      width: 18px;
      height: 18px;
      accent-color: #377dff;
    }

    .vr-calibration-reset {
      width: 100%;
      min-height: 44px;
      background: #1c2940;
      border: 1px solid #385070;
      border-radius: 9px;
      color: white;
      font-size: 12px;
      font-weight: 700;
    }

    @media (
      orientation: landscape
    ) and (max-height: 500px) {
      .vr-calibration-panel {
        max-height: 62dvh;
      }
    }
  `;

  document.head.appendChild(style);
}

/* ==============================================
   CREACIÓN DE LAS VISTAS
   ============================================== */

function createEye(label) {
  const wrapper = document.createElement("div");
  wrapper.className = "vr-eye";

  const canvas = document.createElement("canvas");

  canvas.setAttribute(
    "aria-label",
    `Vista VR del ojo ${label}`
  );

  const guide = document.createElement("div");
  guide.className = "vr-guide";

  guide.hidden = !vrCalibration.showGuides;

  wrapper.append(canvas, guide);

  return {
    wrapper,
    canvas,
    guide
  };
}

/* ==============================================
   DIMENSIONES DE LA FUENTE
   ============================================== */

function getSourceDimensions() {
  if (!vrSource) return null;

  const isVideo =
    vrSource instanceof HTMLVideoElement;

  if (
    isVideo &&
    vrSource.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    return null;
  }

  const width = isVideo
    ? vrSource.videoWidth
    : vrSource.naturalWidth;

  const height = isVideo
    ? vrSource.videoHeight
    : vrSource.naturalHeight;

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < 2 ||
    height <= 0
  ) {
    return null;
  }

  return {
    width,
    height,
    eyeWidth: width / 2
  };
}

/* ==============================================
   RENDERIZADO POR OJO
   ============================================== */

function drawEye(
  canvas,
  sourceEye,
  displayEye
) {
  if (
    !canvas ||
    !vrSource ||
    !vrSettings
  ) {
    return;
  }

  const dimensions = getSourceDimensions();

  if (!dimensions) return;

  const rect = canvas.getBoundingClientRect();

  if (
    rect.width <= 0 ||
    rect.height <= 0
  ) {
    return;
  }

  const dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );

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

  const {
    eyeWidth,
    height: sourceHeight
  } = dimensions;

  const sourceX = sourceEye === "left"
    ? 0
    : eyeWidth;

  // Preservar relación de aspecto.
  const fit = Math.min(
    outputWidth / eyeWidth,
    outputHeight / sourceHeight
  );

  // Escala general + tamaño específico VR.
  const scale =
    (vrSettings.scale / 100) *
    (vrCalibration.imageSize / 100);

  const drawWidth =
    eyeWidth * fit * scale;

  const drawHeight =
    sourceHeight * fit * scale;

  // La perspectiva izquierda se mueve
  // hacia la izquierda con valor positivo
  // de centrado de lentes.
  const sign = displayEye === "left"
    ? -1
    : 1;

  const pixelRatio = dpr * factor;

  // Calibración estándar del Studio.
  const normalHorizontal =
    vrSettings.horizontal * sign / 2;

  // Ajuste óptico adicional de Cardboard.
  const opticalCenter =
    vrCalibration.lensCenter * sign;

  const horizontal =
    (normalHorizontal + opticalCenter) *
    pixelRatio;

  const vertical =
    (
      vrSettings.vertical * sign / 2 +
      vrCalibration.imageHeight
    ) * pixelRatio;

  const x =
    (outputWidth - drawWidth) / 2 +
    horizontal;

  const y =
    (outputHeight - drawHeight) / 2 +
    vertical;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  try {
    ctx.drawImage(
      vrSource,
      sourceX,
      0,
      eyeWidth,
      sourceHeight,
      x,
      y,
      drawWidth,
      drawHeight
    );
  } catch (error) {
    // Algunos navegadores todavía no tienen
    // disponible el siguiente fotograma.
    if (error.name !== "InvalidStateError") {
      console.debug(
        "Fotograma VR no disponible:",
        error
      );
    }
  }
}

/* ==============================================
   RENDERIZADO PRINCIPAL
   ============================================== */

export function renderVR() {
  if (
    !vrActive ||
    !vrSource ||
    !vrSettings
  ) {
    return;
  }

  const leftSource = vrSettings.swapEyes
    ? "right"
    : "left";

  const rightSource = vrSettings.swapEyes
    ? "left"
    : "right";

  drawEye(
    leftCanvas,
    leftSource,
    "left"
  );

  drawEye(
    rightCanvas,
    rightSource,
    "right"
  );
}

/* ==============================================
   BUCLE DE VIDEO
   ============================================== */

function frameLoop() {
  animationId = null;

  if (!vrActive) return;

  renderVR();

  if (
    vrSource instanceof HTMLVideoElement &&
    !vrSource.paused &&
    !vrSource.ended
  ) {
    animationId =
      requestAnimationFrame(frameLoop);
  }
}

function stopAnimation() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
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
    animationId =
      requestAnimationFrame(frameLoop);
  }
}

export function pauseVRRendering() {
  stopAnimation();
  renderVR();
}

/* ==============================================
   PANEL DE CALIBRACIÓN CARDBOARD
   ============================================== */

function createRange(
  label,
  key,
  min,
  max,
  suffix
) {
  const group = document.createElement("div");
  group.className = "vr-calibration-control";

  const row = document.createElement("div");
  row.className = "vr-calibration-label";

  const name = document.createElement("label");
  name.textContent = label;

  const output = document.createElement("output");

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = String(min);
  slider.max = String(max);
  slider.step = "1";
  slider.value = String(vrCalibration[key]);

  const id = `vrSetting-${key}`;
  slider.id = id;
  name.htmlFor = id;

  function updateOutput() {
    const value = vrCalibration[key];

    output.textContent =
      `${value > 0 ? "+" : ""}${value}${suffix}`;
  }

  slider.addEventListener("input", () => {
    vrCalibration[key] = Number(slider.value);

    updateOutput();
    renderVR();
  });

  updateOutput();

  row.append(name, output);
  group.append(row, slider);

  return group;
}

function buildCalibrationPanel(overlay) {
  calibrationButton =
    document.createElement("button");

  calibrationButton.type = "button";
  calibrationButton.className =
    "vr-calibration-button";

  calibrationButton.textContent =
    "Calibrar Cardboard";

  calibrationButton.setAttribute(
    "aria-expanded",
    "false"
  );

  calibrationPanel =
    document.createElement("div");

  calibrationPanel.className =
    "vr-calibration-panel";

  calibrationPanel.hidden = true;

  const title = document.createElement("h3");
  title.textContent = "Ajuste de lentes";

  const description =
    document.createElement("p");

  description.textContent =
    "Ajusta con el teléfono fuera de las gafas. " +
    "Usa pequeños cambios y comprueba " +
    "la comodidad visual.";

  calibrationPanel.append(title, description);

  calibrationPanel.appendChild(
    createRange(
      "Centrado de lentes",
      "lensCenter",
      -60,
      60,
      " px"
    )
  );

  calibrationPanel.appendChild(
    createRange(
      "Tamaño de imagen VR",
      "imageSize",
      60,
      115,
      "%"
    )
  );

  calibrationPanel.appendChild(
    createRange(
      "Altura de imagen",
      "imageHeight",
      -40,
      40,
      " px"
    )
  );

  const guideLabel =
    document.createElement("label");

  guideLabel.className = "vr-calibration-check";

  const guideCheckbox =
    document.createElement("input");

  guideCheckbox.type = "checkbox";
  guideCheckbox.checked =
    vrCalibration.showGuides;

  const guideText =
    document.createElement("span");

  guideText.textContent =
    "Mostrar centros de referencia";

  guideCheckbox.addEventListener(
    "change",
    () => {
      vrCalibration.showGuides =
        guideCheckbox.checked;

      document.querySelectorAll(
        "#vrScreen .vr-guide"
      ).forEach(guide => {
        guide.hidden =
          !vrCalibration.showGuides;
      });
    }
  );

  guideLabel.append(
    guideCheckbox,
    guideText
  );

  calibrationPanel.appendChild(guideLabel);

  const resetButton =
    document.createElement("button");

  resetButton.type = "button";
  resetButton.className =
    "vr-calibration-reset";

  resetButton.textContent =
    "Restablecer ajuste Cardboard";

  resetButton.addEventListener(
    "click",
    () => {
      vrCalibration = {
        ...DEFAULT_VR
      };

      calibrationPanel.querySelectorAll(
        'input[type="range"]'
      ).forEach(input => {
        const key =
          input.id.replace("vrSetting-", "");

        input.value = vrCalibration[key];

        const group = input.closest(
          ".vr-calibration-control"
        );

        const output =
          group.querySelector("output");

        const suffix =
          key === "imageSize" ? "%" : " px";

        const value = vrCalibration[key];

        output.textContent =
          `${value > 0 ? "+" : ""}${value}${suffix}`;
      });

      guideCheckbox.checked = false;

      document.querySelectorAll(
        "#vrScreen .vr-guide"
      ).forEach(guide => {
        guide.hidden = true;
      });

      renderVR();
    }
  );

  calibrationPanel.appendChild(resetButton);

  calibrationButton.addEventListener(
    "click",
    () => {
      calibrationPanel.hidden =
        !calibrationPanel.hidden;

      calibrationButton.setAttribute(
        "aria-expanded",
        String(!calibrationPanel.hidden)
      );
    }
  );

  overlay.append(
    calibrationButton,
    calibrationPanel
  );
}

/* ==============================================
   CAMBIO DE TAMAÑO Y FULLSCREEN
   ============================================== */

function handleResize() {
  if (vrActive) renderVR();
}

function handleFullscreenChange() {
  if (
    vrActive &&
    !document.fullscreenElement
  ) {
    exitVR();
  }
}

export function isVRActive() {
  return vrActive;
}

/* ==============================================
   ACTIVAR VR
   ============================================== */

export async function enterVR(
  source,
  settings
) {
  if (vrActive) return true;

  if (!source || !settings) {
    return false;
  }

  installVRStyles();

  const overlay = $("vrOverlay");
  const vrScreen = $("vrScreen");

  if (!overlay || !vrScreen) {
    throw new Error(
      "No se encontró la estructura VR."
    );
  }

  vrSource = source;
  vrSettings = settings;

  vrActive = true;
  leaving = false;

  previousOverflow =
    document.body.style.overflow;

  vrScreen.replaceChildren();

  const leftEye = createEye("izquierdo");
  const rightEye = createEye("derecho");

  leftCanvas = leftEye.canvas;
  rightCanvas = rightEye.canvas;

  vrScreen.append(
    leftEye.wrapper,
    rightEye.wrapper
  );

  overlay.classList.remove("hidden");

  document.body.style.overflow = "hidden";

  $("app").setAttribute("inert", "");

  buildCalibrationPanel(overlay);

  resizeObserver = new ResizeObserver(
    handleResize
  );

  resizeObserver.observe(vrScreen);

  window.addEventListener(
    "resize",
    handleResize
  );

  document.addEventListener(
    "fullscreenchange",
    handleFullscreenChange
  );

  renderVR();
  startVRRendering();

  // Pantalla completa opcional.
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
      "El navegador utiliza el visor VR " +
      "sin pantalla completa."
    );
  }

  // Corregimos el acceso a screen.orientation.
  // Es una función opcional en móviles.
  try {
    if (
      vrActive &&
      window.screen.orientation &&
      typeof window.screen.orientation.lock ===
        "function"
    ) {
      await window.screen.orientation.lock(
        "landscape"
      );
    }
  } catch {
    console.info(
      "Orientación horizontal manual necesaria."
    );
  }

  if (vrActive) {
    renderVR();
  }

  return vrActive;
}

/* ==============================================
   SALIR DE VR
   ============================================== */

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
      window.screen.orientation &&
      typeof window.screen.orientation.unlock ===
        "function"
    ) {
      window.screen.orientation.unlock();
    }
  } catch {
    // No todos los navegadores permiten unlock.
  }

  if (calibrationButton) {
    calibrationButton.remove();
    calibrationButton = null;
  }

  if (calibrationPanel) {
    calibrationPanel.remove();
    calibrationPanel = null;
  }

  $("vrOverlay").classList.add("hidden");
  $("vrScreen").replaceChildren();

  $("app").removeAttribute("inert");

  document.body.style.overflow =
    previousOverflow;

  leftCanvas = null;
  rightCanvas = null;

  vrSource = null;
  vrSettings = null;

  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  } catch {
    // Fullscreen pudo cerrarse anteriormente.
  }

  leaving = false;

  document.dispatchEvent(
    new CustomEvent("stereovision:vrexit")
  );
}
