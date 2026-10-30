
/* ==========================================
   STEREOVISION STUDIO 3D
   Estado central de la aplicación
   ========================================== */

export const DEFAULT_SETTINGS = Object.freeze({
  scale: 100,
  brightness: 100,
  contrast: 100,
  horizontal: 0,
  vertical: 0,
  swapEyes: false
});

export const state = {
  module: "anaglyph",
  status: "empty",
  file: null,
  image: null,
  video: null,
  objectURL: null,
  loadController: null,
  settings: { ...DEFAULT_SETTINGS },
  requestId: 0
};

export function resetSettings() {
  state.settings = { ...DEFAULT_SETTINGS };
}

export function hasContent() {
  return Boolean(
    state.file && (state.image || state.video)
  );
}

export function releaseContent() {
  // Cancela cargas anteriores.
  state.requestId++;

  if (state.loadController) {
    state.loadController.abort();
    state.loadController = null;
  }

  const video =
    document.getElementById("sourceVideo");

  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }

  const imageElement =
    document.getElementById("anaglyphImage");

  if (imageElement) {
    imageElement.removeAttribute("src");
    imageElement.style.transform = "";
    imageElement.style.filter = "";
  }

  // Limpieza de los cuatro canvas.
  for (const id of [
    "leftEyeCanvas",
    "rightEyeCanvas",
    "videoLeftCanvas",
    "videoRightCanvas"
  ]) {
    const canvas = document.getElementById(id);

    if (!canvas) continue;

    canvas.width = 0;
    canvas.height = 0;
  }

  if (state.objectURL) {
    URL.revokeObjectURL(state.objectURL);
  }

  state.file = null;
  state.image = null;
  state.video = null;
  state.objectURL = null;
  state.status = "empty";

  resetSettings();
}

export function changeModule(module) {
  const allowed = [
    "anaglyph",
    "sbs-image",
    "sbs-video"
  ];

  if (!allowed.includes(module)) {
    return false;
  }

  releaseContent();
  state.module = module;

  return true;
}
