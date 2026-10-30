
/* ==========================================
   STEREOVISION STUDIO 3D
   Gestión y validación multimedia
   ========================================== */

const IMAGE_FORMATS = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"]
]);

export function validateFile(file, module) {
  if (!file) {
    throw new Error("No se seleccionó un archivo.");
  }

  if (file.size === 0) {
    throw new Error("El archivo está vacío.");
  }

  const name = file.name.toLowerCase();

  const extension = "." + (
    name.split(".").pop() || ""
  );

  if (module === "sbs-video") {
    if (extension !== ".mp4") {
      throw new Error(
        "Para Video SBS debes seleccionar " +
        "un archivo MP4."
      );
    }

    if (
      file.type &&
      file.type !== "video/mp4"
    ) {
      throw new Error(
        "El tipo de archivo no corresponde a MP4."
      );
    }

    return true;
  }

  const expectedType = IMAGE_FORMATS.get(extension);

  if (!expectedType) {
    throw new Error(
      "Formato no admitido. Utiliza JPG, PNG o WebP."
    );
  }

  if (
    file.type &&
    file.type !== expectedType
  ) {
    throw new Error(
      "La extensión no coincide " +
      "con el tipo de imagen."
    );
  }

  return true;
}

/* ==========================================
   DECODIFICACIÓN DE IMAGEN
   ========================================== */

export async function decodeImage(file) {
  const url = URL.createObjectURL(file);
  const image = new Image();

  try {
    image.src = url;

    await image.decode();

    if (
      image.naturalWidth <= 0 ||
      image.naturalHeight <= 0
    ) {
      throw new Error("Dimensiones inválidas.");
    }

    return {
      image,
      url,
      width: image.naturalWidth,
      height: image.naturalHeight
    };

  } catch {
    URL.revokeObjectURL(url);

    throw new Error(
      "No se pudo abrir la imagen. " +
      "Puede estar dañada o ser incompatible."
    );
  }
}

/* ==========================================
   CARGA Y DECODIFICACIÓN DE VIDEO
   ========================================== */

export async function decodeVideo(
  file,
  video,
  signal
) {
  if (!video.canPlayType("video/mp4")) {
    throw new Error(
      "Este navegador no admite " +
      "reproducción MP4."
    );
  }

  const url = URL.createObjectURL(file);

  try {
    const result = await new Promise(
      (resolve, reject) => {
        let completed = false;

        const cleanup = () => {
          video.removeEventListener(
            "loadeddata", onReady
          );
          video.removeEventListener(
            "error", onError
          );
          signal?.removeEventListener(
            "abort", onAbort
          );
          clearTimeout(timeout);
        };

        const finish = (error = null) => {
          if (completed) return;

          completed = true;
          cleanup();

          if (error) {
            reject(error);
          } else {
            resolve({
              video,
              url,
              width: video.videoWidth,
              height: video.videoHeight
            });
          }
        };

        const onReady = () => {
          if (
            video.videoWidth < 2 ||
            video.videoHeight <= 0
          ) {
            finish(new Error(
              "El video no tiene dimensiones válidas."
            ));
            return;
          }

          finish();
        };

        const onError = () => {
          finish(new Error(
            "No se pudo decodificar el video. " +
            "Comprueba que el MP4 utilice " +
            "un códec compatible con el navegador."
          ));
        };

        const onAbort = () => {
          finish(new DOMException(
            "Carga cancelada",
            "AbortError"
          ));
        };

        const timeout = setTimeout(() => {
          finish(new Error(
            "El video tardó demasiado en cargar. " +
            "Comprueba su compatibilidad."
          ));
        }, 30000);

        video.addEventListener(
          "loadeddata", onReady
        );

        video.addEventListener(
          "error", onError
        );

        signal?.addEventListener(
          "abort", onAbort, { once: true }
        );

        if (signal?.aborted) {
          onAbort();
          return;
        }

        video.preload = "auto";
        video.playsInline = true;
        video.src = url;
        video.load();
      }
    );

    return result;

  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

/* ==========================================
   UTILIDADES
   ========================================== */

export function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return (
    `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  );
}

export function getFileFormat(file) {
  return (
    file.name.split(".").pop() || "Desconocido"
  ).toUpperCase();
}
