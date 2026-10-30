
/* ============================================
   STEREOVISION STUDIO 3D
   MAIN.JS - Coordinador principal
   Ejemplos locales + controles táctiles
   ============================================ */

import {
  state,
  changeModule,
  releaseContent,
  hasContent
} from "./modules/appState.js";

import {
  validateFile,
  decodeImage,
  decodeVideo
} from "./modules/fileManager.js";

import {
  setCalibration,
  restoreCalibration,
  CALIBRATION_LIMITS
} from "./modules/calibration.js";

import {
  showNotification,
  updateStatus,
  showLoading,
  refreshUI,
  updateCalibrationIndicators,
  updateVideoTimeline,
  updatePlayButton,
  resetVideoControls
} from "./modules/uiController.js";

import {
  renderAnaglyph
} from "./modules/anaglyph.js";

import {
  renderSBSImage
} from "./modules/sbsImage.js";

import {
  renderSBSVideo,
  startVideoRendering,
  stopVideoRendering,
  refreshVideoRendering
} from "./modules/sbsVideo.js";

import {
  enterVR,
  exitVR,
  isVRActive,
  renderVR,
  startVRRendering,
  pauseVRRendering
} from "./modules/vrMode.js";

import {
  setupExamples,
  cancelExampleLoad,
  updateExampleButton
} from "./modules/examples.js";

import {
  initTouchControls,
  showTouchControls,
  hideTouchControls
} from "./modules/touchControls.js";

/* ============================================
   REFERENCIAS
   ============================================ */

const $ = id => document.getElementById(id);

const video = $("sourceVideo");

const sliderKeys = {
  scaleSlider: "scale",
  brightnessSlider: "brightness",
  contrastSlider: "contrast",
  horizontalSlider: "horizontal",
  verticalSlider: "vertical"
};

let anaglyphFullscreen = false;
let fullscreenFallback = false;
let previousOverflow = "";

/* ============================================
   RENDERIZADO
   ============================================ */

function render() {
  if (!hasContent() || isVRActive()) return;

  switch (state.module) {
    case "anaglyph":
      renderAnaglyph(
        state.image,
        state.settings
      );
      break;

    case "sbs-image":
      renderSBSImage(
        state.image,
        state.settings
      );
      break;

    case "sbs-video":
      refreshVideoRendering(
        state.video,
        state.settings
      );
      break;
  }
}

function refreshStudio() {
  refreshUI();
  updateExampleButton(state.module);

  requestAnimationFrame(render);
}

/* ============================================
   PANTALLA COMPLETA ANAGLIFO
   ============================================ */

function setupAnaglyphFullscreen() {
  const button = document.createElement("button");

  button.id = "anaglyphExitFullscreen";
  button.type = "button";
  button.textContent = "Salir de pantalla completa";
  button.hidden = true;

  $("viewerStage").appendChild(button);

  button.addEventListener(
    "click",
    exitAnaglyphFullscreen
  );

  document.addEventListener(
    "fullscreenchange",
    () => {
      if (
        anaglyphFullscreen &&
        !fullscreenFallback &&
        document.fullscreenElement !== $("viewerStage")
      ) {
        finishAnaglyphFullscreen();
      }
    }
  );
}

function finishAnaglyphFullscreen() {
  if (!anaglyphFullscreen) return;

  const stage = $("viewerStage");

  if (fullscreenFallback) {
    document.body.style.overflow =
      previousOverflow;
  }

  anaglyphFullscreen = false;
  fullscreenFallback = false;

  stage.classList.remove(
    "anaglyph-fullscreen",
    "fallback"
  );

  $("anaglyphExitFullscreen").hidden = true;

  hideTouchControls();

  updateStatus("Pantalla completa finalizada");

  requestAnimationFrame(render);
}

async function enterAnaglyphFullscreen() {
  if (
    !hasContent() ||
    state.module !== "anaglyph" ||
    anaglyphFullscreen ||
    isVRActive()
  ) {
    return;
  }

  const stage = $("viewerStage");

  anaglyphFullscreen = true;
  stage.classList.add("anaglyph-fullscreen");

  $("anaglyphExitFullscreen").hidden = false;

  showTouchControls("anaglyph", stage);

  try {
    if (!stage.requestFullscreen) {
      throw new Error("Fullscreen no disponible");
    }

    await stage.requestFullscreen({
      navigationUI: "hide"
    });

  } catch {
    if (!anaglyphFullscreen) return;

    fullscreenFallback = true;

    previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    stage.classList.add("fallback");
  }

  if (anaglyphFullscreen) {
    updateStatus("Anaglifo en pantalla completa");
    requestAnimationFrame(render);
  }
}

async function exitAnaglyphFullscreen() {
  if (!anaglyphFullscreen) return;

  if (
    document.fullscreenElement ===
    $("viewerStage")
  ) {
    try {
      await document.exitFullscreen();
    } catch {
      // El navegador puede haber salido ya.
    }
  }

  finishAnaglyphFullscreen();
}

/* ============================================
   CAMBIO DE MÓDULO
   ============================================ */

function selectModule(module) {
  const allowed = [
    "anaglyph",
    "sbs-image",
    "sbs-video"
  ];

  if (
    !allowed.includes(module) ||
    module === state.module ||
    isVRActive() ||
    anaglyphFullscreen
  ) {
    return;
  }

  cancelExampleLoad();
  stopVideoRendering();

  changeModule(module);

  resetVideoControls(video);
  showLoading(false);

  updateStatus("Esperando contenido");
  refreshStudio();
}

/* ============================================
   IMPORTACIÓN DE ARCHIVOS
   ============================================ */

function openFilePicker() {
  if (isVRActive() || anaglyphFullscreen) {
    return;
  }

  $("fileInput").click();
}

async function importFile(
  file,
  expectedModule = state.module
) {
  if (
    !file ||
    isVRActive() ||
    anaglyphFullscreen ||
    expectedModule !== state.module
  ) {
    return;
  }

  const selectedModule = state.module;

  // Validación antes de eliminar el anterior.
  try {
    validateFile(file, selectedModule);

  } catch (error) {
    showNotification(error.message, "error");

    if (!hasContent()) {
      updateStatus("Archivo no válido");
    }

    return;
  }

  stopVideoRendering();
  releaseContent();

  state.status = "loading";

  const requestId = state.requestId;
  const controller = new AbortController();

  state.loadController = controller;

  resetVideoControls(video);

  updateStatus("Cargando archivo...");
  refreshStudio();
  showLoading(true);

  try {
    const result =
      selectedModule === "sbs-video"
        ? await decodeVideo(
            file,
            video,
            controller.signal
          )
        : await decodeImage(file);

    if (
      requestId !== state.requestId ||
      selectedModule !== state.module
    ) {
      URL.revokeObjectURL(result.url);
      return;
    }

    state.file = file;
    state.objectURL = result.url;

    if (selectedModule === "sbs-video") {
      state.video = result.video;
    } else {
      state.image = result.image;
    }

    state.status = "ready";

    refreshStudio();

    updateStatus(
      "Archivo cargado correctamente"
    );

    if (state.video) {
      updateVideoTimeline(video);
    }

    showNotification(
      "Archivo multimedia importado correctamente.",
      "success"
    );

  } catch (error) {
    if (requestId !== state.requestId) return;

    state.status = "error";

    refreshStudio();
    updateStatus("Error al cargar archivo");

    if (error.name !== "AbortError") {
      showNotification(
        error.message,
        "error"
      );
    }

  } finally {
    if (requestId === state.requestId) {
      state.loadController = null;
      showLoading(false);
    }
  }
}

/* ============================================
   CALIBRACIÓN
   ============================================ */

function changeSetting(key, value, fromTouch = false) {
  if (
    !hasContent() ||
    (
      !fromTouch &&
      (isVRActive() || anaglyphFullscreen)
    )
  ) {
    return;
  }

  const success = setCalibration(key, value);

  if (!success) return;

  updateCalibrationIndicators();

  if (isVRActive()) {
    renderVR();
  } else {
    render();
  }
}

function adjustFromTouch(key, delta) {
  if (!hasContent()) return;

  const limits = CALIBRATION_LIMITS[key];

  if (!limits) return;

  const next = Math.min(
    limits.max,
    Math.max(
      limits.min,
      state.settings[key] + delta
    )
  );

  changeSetting(key, next, true);
}

function swapEyesFromTouch() {
  if (!hasContent()) return;

  changeSetting(
    "swapEyes",
    !state.settings.swapEyes,
    true
  );
}

function resetCalibration() {
  if (
    !hasContent() ||
    isVRActive() ||
    anaglyphFullscreen
  ) {
    return;
  }

  if (!restoreCalibration()) return;

  updateCalibrationIndicators();
  render();

  showNotification(
    "Calibración restablecida.",
    "success"
  );
}

/* ============================================
   CONTROLES DE VIDEO
   ============================================ */

async function togglePlayback(fromTouch = false) {
  if (
    !state.video ||
    (isVRActive() && !fromTouch)
  ) {
    return;
  }

  if (!video.paused) {
    video.pause();
    return;
  }

  try {
    await video.play();

  } catch (error) {
    if (error.name === "AbortError") return;

    showNotification(
      "No se pudo reproducir este video.",
      "error"
    );
  }
}

function seekVideo(seconds, fromTouch = false) {
  if (
    !state.video ||
    (isVRActive() && !fromTouch)
  ) {
    return;
  }

  const duration = video.duration;

  if (
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return;
  }

  video.currentTime = Math.max(
    0,
    Math.min(seconds, duration)
  );
}

/* ============================================
   MODO VR
   ============================================ */

async function activateVR() {
  if (
    !hasContent() ||
    state.module === "anaglyph" ||
    isVRActive() ||
    anaglyphFullscreen
  ) {
    return;
  }

  const source =
    state.module === "sbs-video"
      ? state.video
      : state.image;

  if (!source) return;

  stopVideoRendering();

  try {
    const activated = await enterVR(
      source,
      state.settings
    );

    if (activated) {
      state.status = "vr";

      showTouchControls(
        state.module === "sbs-video"
          ? "vr-video"
          : "vr-image",
        $("vrOverlay")
      );

      updateStatus("Modo VR activo");
    }

  } catch (error) {
    console.error(error);

    showNotification(
      "No se pudo iniciar el modo VR.",
      "error"
    );

    if (isVRActive()) {
      await exitVR();
    } else if (
      state.video &&
      !video.paused &&
      !video.ended
    ) {
      startVideoRendering(
        video,
        state.settings
      );
    }
  }
}

async function deactivateVR() {
  if (!isVRActive()) return;

  hideTouchControls();

  await exitVR();
}

function restoreStudioAfterVR() {
  hideTouchControls();

  if (!hasContent()) return;

  state.status = state.video
    ? (
        !video.paused && !video.ended
          ? "playing"
          : "paused"
      )
    : "ready";

  refreshStudio();

  if (state.module === "sbs-video") {
    if (!video.paused && !video.ended) {
      startVideoRendering(
        video,
        state.settings
      );
    } else {
      requestAnimationFrame(() => {
        renderSBSVideo(
          video,
          state.settings
        );
      });
    }

    updateVideoTimeline(video);
  }

  updateStatus("Modo VR finalizado");
}

function handleDisplayButton() {
  if (state.module === "anaglyph") {
    enterAnaglyphFullscreen();
  } else {
    activateVR();
  }
}

/* ============================================
   EVENTOS DE INTERFAZ
   ============================================ */

function registerModuleEvents() {
  document.querySelectorAll(".module-btn")
    .forEach(button => {
      button.addEventListener("click", () => {
        selectModule(button.dataset.module);
      });
    });
}

function registerImportEvents() {
  $("importBtn").addEventListener(
    "click",
    openFilePicker
  );

  $("emptyImportBtn").addEventListener(
    "click",
    openFilePicker
  );

  $("fileInput").addEventListener(
    "change",
    async event => {
      const file = event.target.files?.[0];

      event.target.value = "";

      if (file) {
        cancelExampleLoad();
        await importFile(file);
      }
    }
  );

  setupExamples(async (file, module) => {
    await importFile(file, module);
  });

  document.addEventListener(
    "stereovision:exampleerror",
    event => {
      showNotification(
        event.detail.message,
        "error"
      );
    }
  );
}

function registerCalibrationEvents() {
  for (const [id, key] of Object.entries(sliderKeys)) {
    $(id).addEventListener("input", event => {
      changeSetting(
        key,
        Number(event.target.value)
      );
    });
  }

  $("swapEyesToggle").addEventListener(
    "change",
    event => {
      changeSetting(
        "swapEyes",
        event.target.checked
      );
    }
  );

  $("resetModuleBtn").addEventListener(
    "click",
    resetCalibration
  );

  $("resetAllBtn").addEventListener(
    "click",
    resetCalibration
  );
}

/* ============================================
   EVENTOS DE VIDEO
   ============================================ */

function registerVideoEvents() {
  $("playPauseBtn").addEventListener(
    "click",
    () => togglePlayback()
  );

  $("backwardBtn").addEventListener(
    "click",
    () => seekVideo(video.currentTime - 5)
  );

  $("forwardBtn").addEventListener(
    "click",
    () => seekVideo(video.currentTime + 5)
  );

  $("videoSeek").addEventListener(
    "input",
    event => {
      seekVideo(Number(event.target.value));
    }
  );

  $("volumeSlider").addEventListener(
    "input",
    event => {
      if (isVRActive()) return;

      video.volume = Number(event.target.value);
    }
  );

  video.addEventListener(
    "loadedmetadata",
    () => updateVideoTimeline(video)
  );

  video.addEventListener(
    "durationchange",
    () => updateVideoTimeline(video)
  );

  video.addEventListener(
    "timeupdate",
    () => updateVideoTimeline(video)
  );

  video.addEventListener("seeked", () => {
    if (!state.video) return;

    updateVideoTimeline(video);

    if (isVRActive()) {
      pauseVRRendering();

      if (!video.paused && !video.ended) {
        startVRRendering();
      }

    } else if (video.paused) {
      renderSBSVideo(
        video,
        state.settings
      );
    }
  });

  video.addEventListener("playing", () => {
    if (!state.video) return;

    state.status = "playing";

    updatePlayButton(video);
    updateStatus("Reproduciendo video SBS");

    if (isVRActive()) {
      startVRRendering();
    } else {
      startVideoRendering(
        video,
        state.settings
      );
    }
  });

  video.addEventListener("pause", () => {
    stopVideoRendering();

    if (!state.video) return;

    state.status = "paused";

    updatePlayButton(video);
    updateStatus("Video pausado");

    if (isVRActive()) {
      pauseVRRendering();
    } else {
      renderSBSVideo(
        video,
        state.settings
      );
    }
  });

  video.addEventListener("ended", () => {
    stopVideoRendering();

    if (!state.video) return;

    state.status = "paused";

    updatePlayButton(video);
    updateStatus("Reproducción finalizada");

    if (isVRActive()) {
      pauseVRRendering();
    } else {
      renderSBSVideo(
        video,
        state.settings
      );
    }
  });

  video.addEventListener("error", () => {
    if (!state.video) return;

    stopVideoRendering();

    state.status = "error";

    updatePlayButton(video);
    updateStatus("Error de reproducción");

    showNotification(
      "Error de reproducción. " +
      "Puedes importar otro archivo.",
      "error"
    );

    if (isVRActive()) {
      deactivateVR();
    }
  });
}

/* ============================================
   EVENTOS DE PANTALLA Y VR
   ============================================ */

function registerDisplayEvents() {
  $("enterVRBtn").addEventListener(
    "click",
    handleDisplayButton
  );

  $("exitVRBtn").addEventListener(
    "click",
    deactivateVR
  );

  document.addEventListener(
    "stereovision:vrexit",
    restoreStudioAfterVR
  );

  document.addEventListener(
    "keydown",
    event => {
      if (event.key !== "Escape") return;

      if (anaglyphFullscreen) {
        exitAnaglyphFullscreen();
      } else if (isVRActive()) {
        deactivateVR();
      }
    }
  );
}

/* ============================================
   OBSERVACIÓN Y LIMPIEZA
   ============================================ */

function registerSystemEvents() {
  const observer = new ResizeObserver(() => {
    if (hasContent() && !isVRActive()) {
      requestAnimationFrame(render);
    }
  });

  observer.observe($("viewerStage"));

  window.addEventListener("pagehide", () => {
    cancelExampleLoad();
    stopVideoRendering();
    releaseContent();
  });
}

/* ============================================
   CONTROLES TÁCTILES
   ============================================ */

function registerTouchControls() {
  initTouchControls({
    onAdjust: adjustFromTouch,

    onSwap: swapEyesFromTouch,

    onPlayPause: () => {
      togglePlayback(true);
    },

    onSeek: difference => {
      seekVideo(
        video.currentTime + difference,
        true
      );
    }
  });
}

/* ============================================
   INICIALIZACIÓN
   ============================================ */

function init() {
  // Carga la hoja de estilos adicional.
  const stylesheet =
    document.createElement("link");

  stylesheet.rel = "stylesheet";
  stylesheet.href =
    "./assets/css/touch-controls.css";

  document.head.appendChild(stylesheet);

  setupAnaglyphFullscreen();

  registerModuleEvents();
  registerImportEvents();
  registerCalibrationEvents();
  registerVideoEvents();
  registerDisplayEvents();
  registerSystemEvents();
  registerTouchControls();

  resetVideoControls(video);
  refreshStudio();

  updateStatus("Sistema preparado");

  console.info(
    "StereoVision Studio 3D iniciado."
  );

  console.info(
    "Módulos activos:",
    "Anaglifo, Imagen SBS, Video SBS y VR"
  );

  console.info(
    "Ejemplos locales y controles táctiles activos."
  );
}

init();
