
/* ============================================
   STEREOVISION STUDIO 3D
   Controles táctiles para pantalla completa
   y modo VR
   ============================================ */

let panel = null;
let toggleButton = null;
let content = null;

let mode = null;
let callbacks = {};

function createButton(label, action) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "touch-action";
  button.textContent = label;

  button.addEventListener("click", action);

  return button;
}

function makeGroup(label, buttons) {
  const group = document.createElement("div");
  group.className = "touch-group";

  const title = document.createElement("span");
  title.className = "touch-group-title";
  title.textContent = label;

  const actions = document.createElement("div");
  actions.className = "touch-group-actions";

  for (const button of buttons) {
    actions.appendChild(button);
  }

  group.append(title, actions);

  return group;
}

function adjust(key, difference) {
  callbacks.onAdjust?.(key, difference);
}

function buildControls() {
  if (!content) return;

  content.replaceChildren();

  const scale = makeGroup("Escala", [
    createButton("−", () => adjust("scale", -5)),
    createButton("+", () => adjust("scale", 5))
  ]);

  content.appendChild(scale);

  if (mode === "anaglyph") {
    content.appendChild(
      makeGroup("Brillo", [
        createButton(
          "−",
          () => adjust("brightness", -10)
        ),
        createButton(
          "+",
          () => adjust("brightness", 10)
        )
      ])
    );

    content.appendChild(
      makeGroup("Contraste", [
        createButton(
          "−",
          () => adjust("contrast", -10)
        ),
        createButton(
          "+",
          () => adjust("contrast", 10)
        )
      ])
    );

    return;
  }

  content.appendChild(
    makeGroup("Alineación horizontal", [
      createButton(
        "←",
        () => adjust("horizontal", -2)
      ),
      createButton(
        "→",
        () => adjust("horizontal", 2)
      )
    ])
  );

  if (mode === "vr-image") {
    content.appendChild(
      makeGroup("Alineación vertical", [
        createButton(
          "↑",
          () => adjust("vertical", -2)
        ),
        createButton(
          "↓",
          () => adjust("vertical", 2)
        )
      ])
    );
  }

  content.appendChild(
    makeGroup("Perspectivas", [
      createButton(
        "Intercambiar ojos",
        () => callbacks.onSwap?.()
      )
    ])
  );

  if (mode === "vr-video") {
    content.appendChild(
      makeGroup("Reproducción", [
        createButton(
          "−5 s",
          () => callbacks.onSeek?.(-5)
        ),
        createButton(
          "▶ / ❚❚",
          () => callbacks.onPlayPause?.()
        ),
        createButton(
          "+5 s",
          () => callbacks.onSeek?.(5)
        )
      ])
    );
  }
}

export function initTouchControls(handlers) {
  callbacks = handlers;

  panel = document.createElement("div");
  panel.id = "stereoTouchPanel";
  panel.className = "stereo-touch-panel";
  panel.hidden = true;

  toggleButton = createButton(
    "Controles",
    () => {
      const expanded =
        panel.classList.toggle("expanded");

      toggleButton.textContent =
        expanded ? "Ocultar controles" : "Controles";

      toggleButton.setAttribute(
        "aria-expanded",
        String(expanded)
      );
    }
  );

  toggleButton.classList.add("touch-toggle");

  content = document.createElement("div");
  content.className = "touch-content";

  toggleButton.setAttribute(
    "aria-expanded",
    "false"
  );

  panel.append(toggleButton, content);
}

export function showTouchControls(
  requestedMode,
  container
) {
  if (!panel || !container) return;

  mode = requestedMode;

  panel.classList.remove("expanded");
  toggleButton.textContent = "Controles";
  toggleButton.setAttribute(
    "aria-expanded",
    "false"
  );

  buildControls();

  container.appendChild(panel);
  panel.hidden = false;
}

export function hideTouchControls() {
  if (!panel) return;

  panel.hidden = true;
  panel.classList.remove("expanded");

  mode = null;
}

export function touchControlsVisible() {
  return Boolean(panel && !panel.hidden);
}
