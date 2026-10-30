
/* ==============================================
   STEREOVISION STUDIO 3D
   UI CONTROLLER
   Gestión de la interfaz y controles
   ============================================== */

import {
  state,
  hasContent
} from "./appState.js";

import {
  formatFileSize,
  getFileFormat
} from "./fileManager.js";

const $ = (id) => document.getElementById(id);

const MODULES = {
  anaglyph: {
    title: "Editor Anaglifo",
    description:
      "Importa una imagen rojo-cian para comenzar.",
    badge: "ANAGLIFO",
    formats: "JPG, PNG, WebP"
  },

  "sbs-image": {
    title: "Editor de Imagen SBS",
    description:
      "Visualiza y calibra dos perspectivas estereoscópicas.",
    badge: "IMAGEN SBS",
    formats: "JPG, PNG, WebP"
  },

  "sbs-video": {
    title: "Reproductor de Video SBS",
    description:
      "Reproduce y calibra contenido estereoscópico MP4.",
    badge: "VIDEO SBS",
    formats: "MP4"
  }
};

const SLIDERS = {
  scale: {
    input: "scaleSlider",
    output: "scaleValue",
    suffix: "%"
  },
  brightness: {
    input: "brightnessSlider",
    output: "brightnessValue",
    suffix: "%"
  },
  contrast: {
    input: "contrastSlider",
    output: "contrastValue",
    suffix: "%"
  },
  horizontal: {
    input: "horizontalSlider",
    output: "horizontalValue",
    suffix: " px"
  },
  vertical: {
    input: "verticalSlider",
    output: "verticalValue",
    suffix: " px"
  }
};

/* ==============================================
   NOTIFICACIONES
   ============================================== */

export function showNotification(
  message,
  type = "success"
) {
  const container = $("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 4500);
}

/* ==============================================
   ESTADO Y CARGA
   ============================================== */

export function updateStatus(message) {
  $("systemStatus").textContent = message;
  $("footerStatus").textContent = message;
  $("viewerStatus").textContent = message;
}

export function showLoading(visible) {
  $("loadingOverlay").classList.toggle(
    "hidden",
    !visible
  );
}

/* ==============================================
   SELECCIÓN DE MÓDULO
   ============================================== */

export function updateModuleInterface() {
  const config = MODULES[state.module];
  if (!config) return;

  $("workspaceTitle").textContent = config.title;
  $("workspaceDescription").textContent =
    config.description;
  $("activeModuleBadge").textContent =
    config.badge;
  $("supportedFormats").textContent =
    config.formats;

  /*
   * No restringimos el selector mediante accept.
   *
   * Así el usuario puede seleccionar archivos
   * incorrectos y el módulo fileManager.js
   * demostrará que sabe rechazarlos.
   *
   * La validación sigue siendo obligatoria.
   */
  $("fileInput").removeAttribute("accept");

  document.querySelectorAll(".module-btn")
    .forEach((button) => {
      const selected =
        button.dataset.module === state.module;

      button.classList.toggle(
        "active",
        selected
      );

      button.setAttribute(
        "aria-pressed",
        String(selected)
      );
    });
}

/* ==============================================
   INFORMACIÓN DEL ARCHIVO
   ============================================== */

export function updateFileInformation() {
  const file = state.file;

  $("fileName").textContent =
    file ? file.name : "Sin archivo";

  $("fileFormat").textContent =
    file ? getFileFormat(file) : "—";

  $("fileSize").textContent =
    file ? formatFileSize(file.size) : "—";

  if (state.image) {
    $("fileResolution").textContent =
      `${state.image.naturalWidth} × ` +
      `${state.image.naturalHeight}`;
  } else if (state.video) {
    $("fileResolution").textContent =
      `${state.video.videoWidth} × ` +
      `${state.video.videoHeight}`;
  } else {
    $("fileResolution").textContent = "—";
  }
}

/* ==============================================
   INDICADORES DE CALIBRACIÓN
   ============================================== */

export function updateCalibrationIndicators() {
  for (const [key, config] of Object.entries(SLIDERS)) {
    $(config.input).value = state.settings[key];

    $(config.output).textContent =
      `${state.settings[key]}${config.suffix}`;
  }

  $("swapEyesToggle").checked =
    state.settings.swapEyes;

  $("zoomIndicator").textContent =
    `${state.settings.scale}%`;
}

/* ==============================================
   CONTROLES POR MÓDULO
   ============================================== */

export function updateControls() {
  const active = hasContent();
  const isAnaglyph = state.module === "anaglyph";
  const isImageSBS = state.module === "sbs-image";
  const isVideoSBS = state.module === "sbs-video";
  const isSBS = isImageSBS || isVideoSBS;

  $("visualTools").classList.remove("hidden");

  $("stereoTools").classList.toggle(
    "hidden",
    !isSBS
  );

  $("brightnessControl").classList.toggle(
    "hidden",
    !isAnaglyph
  );

  $("contrastControl").classList.toggle(
    "hidden",
    !isAnaglyph
  );

  $("verticalControl").classList.toggle(
    "hidden",
    !isImageSBS
  );

  for (const [key, config] of Object.entries(SLIDERS)) {
    let enabled = active;

    if (key === "brightness" || key === "contrast") {
      enabled = active && isAnaglyph;
    }

    if (key === "horizontal") {
      enabled = active && isSBS;
    }

    if (key === "vertical") {
      enabled = active && isImageSBS;
    }

    $(config.input).disabled = !enabled;
  }

  $("swapEyesToggle").disabled =
    !active || !isSBS;

  $("resetModuleBtn").disabled = !active;
  $("resetAllBtn").disabled = !active;

  /*
   * El botón superior cambia de función
   * según el módulo seleccionado.
   */
  const displayButton = $("enterVRBtn");

  if (isAnaglyph) {
    displayButton.textContent =
      "Ver pantalla completa";

    displayButton.title =
      "Ampliar imagen anaglifo";

    displayButton.setAttribute(
      "aria-label",
      "Ver anaglifo en pantalla completa"
    );
  } else {
    displayButton.textContent = "Modo VR";

    displayButton.title =
      "Visualizar con gafas Google Cardboard";

    displayButton.setAttribute(
      "aria-label",
      "Activar modo VR"
    );
  }

  displayButton.disabled = !active;
}

/* ==============================================
   VISUALIZADORES
   ============================================== */

export function updateViewer() {
  const active = hasContent();

  $("emptyState").classList.toggle(
    "hidden",
    active
  );

  $("anaglyphViewer").classList.add("hidden");
  $("sbsImageViewer").classList.add("hidden");
  $("sbsVideoViewer").classList.add("hidden");
  $("videoControls").classList.add("hidden");

  if (!active) return;

  switch (state.module) {
    case "anaglyph":
      $("anaglyphViewer").classList.remove("hidden");
      break;

    case "sbs-image":
      $("sbsImageViewer").classList.remove("hidden");
      break;

    case "sbs-video":
      $("sbsVideoViewer").classList.remove("hidden");
      $("videoControls").classList.remove("hidden");
      break;
  }
}

/* ==============================================
   INFORMACIÓN DE VIDEO
   ============================================== */

export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  const total = Math.floor(
    Math.max(0, seconds)
  );

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(
    (total % 3600) / 60
  );
  const secondsRemaining = total % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(secondsRemaining).padStart(2, "0");

  if (hours > 0) {
    return (
      `${String(hours).padStart(2, "0")}:` +
      `${mm}:${ss}`
    );
  }

  return `${mm}:${ss}`;
}

export function resetVideoControls(video) {
  $("videoSeek").value = 0;
  $("videoSeek").disabled = true;

  $("currentTime").textContent = "00:00";
  $("duration").textContent = "00:00";

  $("playPauseBtn").textContent = "▶";
  $("playPauseBtn").setAttribute(
    "aria-label",
    "Reproducir"
  );

  $("volumeSlider").value = 1;

  if (video) {
    video.volume = 1;
  }
}

export function updateVideoTimeline(video) {
  if (!state.video || !video) return;

  const duration = video.duration;

  $("currentTime").textContent =
    formatTime(video.currentTime);

  $("duration").textContent =
    formatTime(duration);

  if (Number.isFinite(duration) && duration > 0) {
    $("videoSeek").max = duration;
    $("videoSeek").value = Math.min(
      video.currentTime,
      duration
    );
    $("videoSeek").disabled = false;
  } else {
    $("videoSeek").value = 0;
    $("videoSeek").disabled = true;
  }
}

export function updatePlayButton(video) {
  if (!video) return;

  const playing = !video.paused && !video.ended;

  $("playPauseBtn").textContent =
    playing ? "❚❚" : "▶";

  $("playPauseBtn").setAttribute(
    "aria-label",
    playing ? "Pausar" : "Reproducir"
  );
}

/* ==============================================
   ACTUALIZACIÓN GENERAL
   ============================================== */

export function refreshUI() {
  updateModuleInterface();
  updateFileInformation();
  updateCalibrationIndicators();
  updateControls();
  updateViewer();
}
