
/* ============================================
   STEREOVISION STUDIO 3D
   Ejemplos multimedia locales
   ============================================ */

const EXAMPLES = {
  anaglyph: {
    file: "ejemplo-anaglifo.jpg",
    type: "image/jpeg",
    label: "Cargar ejemplo anaglifo"
  },

  "sbs-image": {
    file: "ejemplo-imagen-sbs.jpg",
    type: "image/jpeg",
    label: "Cargar ejemplo de imagen SBS"
  },

  "sbs-video": {
    file: "ejemplo-video-sbs.mp4",
    type: "video/mp4",
    label: "Cargar ejemplo de video SBS"
  }
};

let exampleButton = null;
let activeController = null;

export function setupExamples(onLoad) {
  const section =
    document.querySelector(".import-section");

  if (!section) {
    throw new Error(
      "No se encontró el panel de importación."
    );
  }

  exampleButton = document.createElement("button");
  exampleButton.id = "loadExampleBtn";
  exampleButton.type = "button";
  exampleButton.className =
    "btn btn-outline example-button";

  exampleButton.textContent =
    "Cargar ejemplo anaglifo";

  section.appendChild(exampleButton);

  exampleButton.addEventListener(
    "click",
    async () => {
      const module =
        exampleButton.dataset.module;

      const config = EXAMPLES[module];

      if (!config || activeController) return;

      const controller = new AbortController();
      activeController = controller;

      exampleButton.disabled = true;
      exampleButton.textContent =
        "Preparando ejemplo...";

      try {
        // URL relativa al archivo examples.js.
        // Compatible con GitHub Pages.
        const url = new URL(
          `../../media/${config.file}`,
          import.meta.url
        );

        const response = await fetch(url, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(
            `No se encontró ${config.file}. ` +
            `Código HTTP: ${response.status}`
          );
        }

        const blob = await response.blob();

        if (controller.signal.aborted) return;

        if (!blob.size) {
          throw new Error(
            "El ejemplo está vacío."
          );
        }

        const file = new File(
          [blob],
          config.file,
          { type: config.type }
        );

        await onLoad(file, module);

      } catch (error) {
        if (error.name !== "AbortError") {
          throwExampleError(error);
        }

      } finally {
        if (activeController === controller) {
          activeController = null;
          updateExampleButton(
            exampleButton.dataset.module
          );
        }
      }
    }
  );
}

function throwExampleError(error) {
  document.dispatchEvent(
    new CustomEvent("stereovision:exampleerror", {
      detail: {
        message: error.message ||
          "No se pudo cargar el ejemplo."
      }
    })
  );
}

export function cancelExampleLoad() {
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
}

export function updateExampleButton(module) {
  if (!exampleButton) return;

  const config = EXAMPLES[module];

  if (!config) {
    exampleButton.hidden = true;
    return;
  }

  exampleButton.hidden = false;
  exampleButton.dataset.module = module;
  exampleButton.textContent = config.label;
  exampleButton.disabled = Boolean(activeController);
}

export function setExampleBusy(busy) {
  if (!exampleButton) return;

  exampleButton.disabled = busy;

  if (!busy) {
    updateExampleButton(
      exampleButton.dataset.module
    );
  }
}
