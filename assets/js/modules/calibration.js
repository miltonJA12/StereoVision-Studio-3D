
/* ==========================================
   STEREOVISION STUDIO 3D
   Módulo de calibración estereoscópica
   ========================================== */

import {
  state,
  resetSettings,
  hasContent
} from "./appState.js";

/* ==========================================
   LÍMITES DE CALIBRACIÓN
   ========================================== */

export const CALIBRATION_LIMITS = Object.freeze({
  scale: {
    min: 50,
    max: 200,
    default: 100
  },

  brightness: {
    min: 0,
    max: 200,
    default: 100
  },

  contrast: {
    min: 0,
    max: 200,
    default: 100
  },

  horizontal: {
    min: -40,
    max: 40,
    default: 0
  },

  vertical: {
    min: -40,
    max: 40,
    default: 0
  }
});

/* ==========================================
   VALIDACIÓN DE PARÁMETROS
   ========================================== */

export function validateCalibration(key, value) {
  const limits = CALIBRATION_LIMITS[key];

  if (!limits) {
    return false;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return false;
  }

  return (
    value >= limits.min &&
    value <= limits.max
  );
}

/* ==========================================
   ACTUALIZAR CALIBRACIÓN
   ========================================== */

export function setCalibration(key, value) {
  if (!hasContent()) {
    return false;
  }

  if (key === "swapEyes") {
    if (
      typeof value !== "boolean" ||
      state.module === "anaglyph"
    ) {
      return false;
    }

    state.settings.swapEyes = value;
    return true;
  }

  if (!validateCalibration(key, value)) {
    return false;
  }

  const isAnaglyph =
    state.module === "anaglyph";

  const isSBS =
    state.module === "sbs-image" ||
    state.module === "sbs-video";

  if (
    ["brightness", "contrast"].includes(key) &&
    !isAnaglyph
  ) {
    return false;
  }

  if (
    key === "horizontal" &&
    !isSBS
  ) {
    return false;
  }

  if (
    key === "vertical" &&
    state.module !== "sbs-image"
  ) {
    return false;
  }

  state.settings[key] = value;

  return true;
}

/* ==========================================
   RESTABLECER CALIBRACIÓN
   ========================================== */

export function restoreCalibration() {
  if (!hasContent()) {
    return false;
  }

  resetSettings();

  return true;
}

/* ==========================================
   OBTENER VALORES ACTUALES
   ========================================== */

export function getCalibration() {
  return {
    ...state.settings
  };
}

/* ==========================================
   OBTENER VALOR ESPECÍFICO
   ========================================== */

export function getCalibrationValue(key) {
  return state.settings[key];
}
