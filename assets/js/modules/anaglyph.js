
/* ==========================================
   STEREOVISION STUDIO 3D
   Editor Anaglifo Rojo / Cian
   ========================================== */

import {
  state
} from "./appState.js";

const $ = id => document.getElementById(id);

const DEFAULTS = {
  enabled: false,
  separation: 6,
  intensity: 100
};

let editor = { ...DEFAULTS };
let sourceImage = null;
let processedURL = null;
let sourcePixels = null;
let sourceWidth = 0;
let sourceHeight = 0;
let renderFrame = null;
let initialized = false;

let controls = {};

/* ==========================================
   LIMPIEZA
   ========================================== */

function cancelProcessing() {
  if (renderFrame !== null) {
    cancelAnimationFrame(renderFrame);
    renderFrame = null;
  }
}

function releaseProcessed() {
  cancelProcessing();
  processedURL = null;
  sourcePixels = null;
  sourceWidth = 0;
  sourceHeight = 0;
}

function resetEditor() {
  editor = { ...DEFAULTS };
  releaseProcessed();
  updateEditorControls();
}

/* ==========================================
   CREAR ESTILOS
   ========================================== */

function installStyles() {
  if ($("anaglyphEditorStyles")) return;

  const style = document.createElement("style");

  style.id = "anaglyphEditorStyles";

  style.textContent = `
    .anaglyph-editor {
      margin-top: 18px;
      padding: 16px;
      border: 1px solid #4b655b;
      border-radius: 13px;
      background: #2b3639;
      color: #e0e8e4;
    }

    .anaglyph-editor[hidden] {
      display: none !important;
    }

    .anaglyph-editor h3 {
      margin: 0 0 8px;
      font-size: 13px;
      color: #e0e8e4;
    }

    .anaglyph-editor p {
      margin: 0 0 14px;
      font-size: 11px;
      line-height: 1.6;
      color: #a8b8c2;
    }

    .anaglyph-editor-field {
      margin-bottom: 16px;
    }

    .anaglyph-editor-field label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
      color: #c5d5cf;
      font-size: 12px;
    }

    .anaglyph-editor-field output {
      color: #b3d8c5;
      font-weight: 700;
    }

    .anaglyph-editor-field input[type="range"] {
      width: 100%;
      min-height: 25px;
      accent-color: #91b5a5;
    }

    .anaglyph-editor-check {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      margin-bottom: 12px;
      font-size: 12px;
      color: #e0e8e4;
    }

    .anaglyph-editor-check input {
      width: 19px;
      height: 19px;
      accent-color: #91b5a5;
    }

    .anaglyph-editor button {
      width: 100%;
      min-height: 44px;
      background: #344b45;
      border: 1px solid #527567;
      border-radius: 9px;
      color: #e0e8e4;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .anaglyph-editor button:hover {
      background: #48695e;
    }

    .anaglyph-editor-note {
      font-size: 10px;
      color: #a8b8c2;
      line-height: 1.6;
    }
  `;

  document.head.appendChild(style);
}

/* ==========================================
   INTERFAZ
   ========================================== */

function createRange(labelText, key, min, max, unit) {
  const group = document.createElement("div");
  group.className = "anaglyph-editor-field";

  const label = document.createElement("label");
  const name = document.createElement("span");
  const output = document.createElement("output");

  const slider = document.createElement("input");

  slider.type = "range";
  slider.min = String(min);
  slider.max = String(max);
  slider.step = "1";
  slider.value = String(editor[key]);

  slider.id = `anaglyph-${key}`;
  label.htmlFor = slider.id;

  name.textContent = labelText;

  label.append(name, output);
  group.append(label, slider);

  controls[key] = {
    slider,
    output,
    unit
  };

  slider.addEventListener("input", () => {
    editor[key] = Number(slider.value);
    updateEditorControls();
    scheduleProcessing();
  });

  return group;
}

function updateEditorControls() {
  if (!initialized) return;

  controls.enabled.checked = editor.enabled;

  for (const key of ["separation", "intensity"]) {
    const control = controls[key];

    control.slider.value = editor[key];

    control.output.textContent =
      `${editor[key]}${control.unit}`;

    control.slider.disabled = !editor.enabled;
  }
}

function syncVisibility() {
  const panel = $("anaglyphConversionPanel");

  if (!panel) return;

  panel.hidden = (
    state.module !== "anaglyph" ||
    !state.image
  );
}

function createEditor() {
  if (initialized) return;

  installStyles();

  const section = document.createElement("section");

  section.id = "anaglyphConversionPanel";
  section.className = "anaglyph-editor";
  section.hidden = true;

  const title = document.createElement("h3");
  title.textContent = "Conversión anaglifo 3D";

  const description = document.createElement("p");
  description.textContent =
    "Convierte una imagen normal en una " +
    "composición rojo-cian ajustable.";

  const checkLabel = document.createElement("label");
  checkLabel.className = "anaglyph-editor-check";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const checkText = document.createElement("span");
  checkText.textContent = "Activar efecto rojo-cian";

  controls.enabled = checkbox;

  checkbox.addEventListener("change", () => {
    editor.enabled = checkbox.checked;
    updateEditorControls();
    scheduleProcessing();
  });

  checkLabel.append(checkbox, checkText);

  const separation = createRange(
    "Separación de canales",
    "separation",
    0,
    24,
    " px"
  );

  const intensity = createRange(
    "Intensidad del efecto",
    "intensity",
    0,
    100,
    "%"
  );

  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "Restablecer efecto anaglifo";

  reset.addEventListener("click", () => {
    resetEditor();
    updateAnaglyphOutput();
  });

  const note = document.createElement("p");
  note.className = "anaglyph-editor-note";

  note.textContent =
    "El efecto creado a partir de una sola " +
    "fotografía es una simulación. Para obtener " +
    "profundidad real se necesitan dos perspectivas.";

  section.append(
    title,
    description,
    checkLabel,
    separation,
    intensity,
    reset,
    note
  );

  const visualTools = $("visualTools");

  if (visualTools) {
    visualTools.insertAdjacentElement(
      "afterend",
      section
    );
  } else {
    document.querySelector(".tools-panel")
      ?.appendChild(section);
  }

  initialized = true;
  updateEditorControls();

  // Ocultar el editor cuando se cambia de módulo.
  const navigation =
    document.querySelector(".module-navigation");

  if (navigation) {
    const observer = new MutationObserver(
      syncVisibility
    );

    observer.observe(navigation, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });
  }

  // Restablecer también desde los botones
  // generales del Studio.
  ["resetAllBtn", "resetModuleBtn"].forEach(id => {
    $(id)?.addEventListener("click", () => {
      if (state.module !== "anaglyph") return;

      resetEditor();
      updateAnaglyphOutput();
    });
  });
}

/* ==========================================
   PREPARACIÓN DE PÍXELES
   ========================================== */

function preparePixels() {
  if (!sourceImage) return false;

  if (sourcePixels) return true;

  const maxDimension = 1600;

  const ratio = Math.min(
    1,
    maxDimension / Math.max(
      sourceImage.naturalWidth,
      sourceImage.naturalHeight
    )
  );

  sourceWidth = Math.max(
    1,
    Math.round(sourceImage.naturalWidth * ratio)
  );

  sourceHeight = Math.max(
    1,
    Math.round(sourceImage.naturalHeight * ratio)
  );

  const canvas = document.createElement("canvas");
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });

  if (!ctx) return false;

  ctx.drawImage(
    sourceImage,
    0,
    0,
    sourceWidth,
    sourceHeight
  );

  sourcePixels = ctx.getImageData(
    0,
    0,
    sourceWidth,
    sourceHeight
  );

  return true;
}

/* ==========================================
   PROCESAMIENTO ROJO-CIAN
   ========================================== */

function generateAnaglyph() {
  if (!preparePixels()) return null;

  const width = sourceWidth;
  const height = sourceHeight;

  const original = sourcePixels.data;
  const output = new ImageData(width, height);
  const result = output.data;

  const shift = Math.round(
    editor.separation *
    (width / Math.max(
      1,
      sourceImage.naturalWidth
    ))
  );

  const strength = editor.intensity / 100;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {

      const current = (y * width + x) * 4;

      const leftX = Math.max(
        0,
        Math.min(width - 1, x - shift)
      );

      const rightX = Math.max(
        0,
        Math.min(width - 1, x + shift)
      );

      const left = (y * width + leftX) * 4;
      const right = (y * width + rightX) * 4;

      // Canal rojo: desplazamiento izquierdo.
      const red = original[left];

      // Canales verde y azul: desplazamiento
      // derecho para generar la composición cian.
      const green = original[right + 1];
      const blue = original[right + 2];

      result[current] =
        original[current] * (1 - strength) +
        red * strength;

      result[current + 1] =
        original[current + 1] * (1 - strength) +
        green * strength;

      result[current + 2] =
        original[current + 2] * (1 - strength) +
        blue * strength;

      result[current + 3] =
        original[current + 3];
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  ctx.putImageData(output, 0, 0);

  return canvas.toDataURL("image/png");
}

/* ==========================================
   ACTUALIZAR IMAGEN
   ========================================== */

function updateAnaglyphOutput() {
  const element = $("anaglyphImage");

  if (!element || !sourceImage) return;

  if (!editor.enabled) {
    if (element.src !== sourceImage.src) {
      element.src = sourceImage.src;
    }
    return;
  }

  try {
    processedURL = generateAnaglyph();

    if (processedURL) {
      element.src = processedURL;
    }
  } catch (error) {
    console.error(
      "Error al generar anaglifo:",
      error
    );

    editor.enabled = false;
    updateEditorControls();
    element.src = sourceImage.src;
  }
}

function scheduleProcessing() {
  cancelProcessing();

  renderFrame = requestAnimationFrame(() => {
    renderFrame = null;
    updateAnaglyphOutput();
  });
}

/* ==========================================
   RENDERIZAR ANAGLIFO
   ========================================== */

export function renderAnaglyph(image, settings) {
  createEditor();

  const element = $("anaglyphImage");

  if (!element || !image) {
    syncVisibility();
    return;
  }

  if (sourceImage !== image) {
    sourceImage = image;

    resetEditor();

    element.src = image.src;
  }

  // Conserva la escala, brillo y contraste.
  const scale = settings.scale / 100;
  const brightness = settings.brightness / 100;
  const contrast = settings.contrast / 100;

  element.style.transform =
    `scale(${scale})`;

  element.style.filter =
    `brightness(${brightness}) ` +
    `contrast(${contrast})`;

  syncVisibility();

  if (
    editor.enabled &&
    !processedURL &&
    renderFrame === null
  ) {
    scheduleProcessing();
  }
}

/* ==========================================
   LIMPIAR ANAGLIFO
   ========================================== */

export function clearAnaglyph() {
  const element = $("anaglyphImage");

  if (element) {
    element.removeAttribute("src");
    element.style.transform = "";
    element.style.filter = "";
  }

  sourceImage = null;
  resetEditor();
  syncVisibility();
}
