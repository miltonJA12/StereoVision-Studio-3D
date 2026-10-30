
/* ==========================================
   STEREOVISION STUDIO 3D
   Visualizador anaglifo rojo-cian
   ========================================== */

export function renderAnaglyph(image, settings) {
  const element =
    document.getElementById("anaglyphImage");

  if (!element || !image) return;

  if (element.src !== image.src) {
    element.src = image.src;
  }

  const scale = settings.scale / 100;
  const brightness = settings.brightness / 100;
  const contrast = settings.contrast / 100;

  element.style.transform = `scale(${scale})`;

  element.style.filter =
    `brightness(${brightness}) ` +
    `contrast(${contrast})`;
}

export function clearAnaglyph() {
  const element =
    document.getElementById("anaglyphImage");

  if (!element) return;

  element.removeAttribute("src");
  element.style.transform = "";
  element.style.filter = "";
}
