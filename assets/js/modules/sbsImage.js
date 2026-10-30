
/* ==========================================
   STEREOVISION STUDIO 3D
   Renderizado de imágenes Side-by-Side
   ========================================== */

function drawEye(
  canvas,
  image,
  sourceEye,
  settings,
  displayEye
) {
  if (!canvas || !image) return;

  const rect = canvas.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    return;
  }

  // Límite de resolución para evitar
  // superficies gráficas excesivamente grandes.
  const dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  const outputWidth = Math.max(
    1,
    Math.round(rect.width * dpr)
  );

  const outputHeight = Math.max(
    1,
    Math.round(rect.height * dpr)
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

  const sourceWidth = image.naturalWidth / 2;
  const sourceHeight = image.naturalHeight;

  const sourceX = sourceEye === "left"
    ? 0
    : sourceWidth;

  // Ajuste tipo contain: conserva la proporción.
  const fit = Math.min(
    outputWidth / sourceWidth,
    outputHeight / sourceHeight
  );

  const scale = settings.scale / 100;

  const drawWidth = sourceWidth * fit * scale;
  const drawHeight = sourceHeight * fit * scale;

  // Ajustes relativos opuestos por ojo.
  const sign = displayEye === "left" ? -1 : 1;

  const offsetX =
    (settings.horizontal * dpr * sign) / 2;

  const offsetY =
    (settings.vertical * dpr * sign) / 2;

  const x =
    (outputWidth - drawWidth) / 2 + offsetX;

  const y =
    (outputHeight - drawHeight) / 2 + offsetY;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    sourceX,
    0,
    sourceWidth,
    sourceHeight,
    x,
    y,
    drawWidth,
    drawHeight
  );
}

export function renderSBSImage(image, settings) {
  if (!image) return;

  const leftCanvas =
    document.getElementById("leftEyeCanvas");

  const rightCanvas =
    document.getElementById("rightEyeCanvas");

  const leftSource = settings.swapEyes
    ? "right"
    : "left";

  const rightSource = settings.swapEyes
    ? "left"
    : "right";

  drawEye(
    leftCanvas,
    image,
    leftSource,
    settings,
    "left"
  );

  drawEye(
    rightCanvas,
    image,
    rightSource,
    settings,
    "right"
  );
}
