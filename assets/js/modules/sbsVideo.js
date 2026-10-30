
/* ==========================================
   STEREOVISION STUDIO 3D
   Renderizado de video Side-by-Side
   ========================================== */

let animationId = null;
let activeVideo = null;
let activeSettings = null;

function drawEye(
  canvas,
  video,
  sourceEye,
  displayEye,
  settings
) {
  if (
    !canvas ||
    !video ||
    video.readyState < 2
  ) {
    return;
  }

  const rect = canvas.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    return;
  }

  const dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  const width = Math.max(
    1,
    Math.round(rect.width * dpr)
  );

  const height = Math.max(
    1,
    Math.round(rect.height * dpr)
  );

  if (canvas.width !== width) {
    canvas.width = width;
  }

  if (canvas.height !== height) {
    canvas.height = height;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  const sourceWidth = video.videoWidth / 2;
  const sourceHeight = video.videoHeight;

  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return;
  }

  const sourceX = sourceEye === "left"
    ? 0
    : sourceWidth;

  const fit = Math.min(
    width / sourceWidth,
    height / sourceHeight
  );

  const scale = settings.scale / 100;

  const drawWidth = sourceWidth * fit * scale;
  const drawHeight = sourceHeight * fit * scale;

  const sign = displayEye === "left" ? -1 : 1;

  const offsetX =
    settings.horizontal * dpr * sign / 2;

  const x = (width - drawWidth) / 2 + offsetX;
  const y = (height - drawHeight) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  try {
    ctx.drawImage(
      video,
      sourceX,
      0,
      sourceWidth,
      sourceHeight,
      x,
      y,
      drawWidth,
      drawHeight
    );
  } catch {
    // Los fotogramas aún no disponibles
    // se volverán a dibujar en el siguiente ciclo.
  }
}

export function renderSBSVideo(video, settings) {
  if (!video || video.readyState < 2) return;

  const leftCanvas =
    document.getElementById("videoLeftCanvas");

  const rightCanvas =
    document.getElementById("videoRightCanvas");

  const leftSource = settings.swapEyes
    ? "right"
    : "left";

  const rightSource = settings.swapEyes
    ? "left"
    : "right";

  drawEye(
    leftCanvas,
    video,
    leftSource,
    "left",
    settings
  );

  drawEye(
    rightCanvas,
    video,
    rightSource,
    "right",
    settings
  );
}

function frameLoop() {
  animationId = null;

  if (
    !activeVideo ||
    activeVideo.paused ||
    activeVideo.ended
  ) {
    return;
  }

  renderSBSVideo(
    activeVideo,
    activeSettings
  );

  animationId =
    requestAnimationFrame(frameLoop);
}

export function startVideoRendering(
  video,
  settings
) {
  stopVideoRendering();

  activeVideo = video;
  activeSettings = settings;

  renderSBSVideo(video, settings);

  if (!video.paused && !video.ended) {
    animationId =
      requestAnimationFrame(frameLoop);
  }
}

export function stopVideoRendering() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  activeVideo = null;
  activeSettings = null;
}

export function refreshVideoRendering(
  video,
  settings
) {
  if (!video) return;

  activeSettings = settings;

  renderSBSVideo(video, settings);
}
