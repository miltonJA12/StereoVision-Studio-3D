# StereoVision Studio 3D

### Examen Práctico 2.4 - Tema 2: Estereoscopía

Aplicación web interactiva para importar, visualizar,
editar y calibrar contenido estereoscópico mediante
imágenes anaglifo rojo-cian, imágenes Side-by-Side
(SBS) y videos SBS 3D.

El proyecto integra una interfaz tipo Studio,
procesamiento multimedia local, calibración visual,
controles táctiles y un modo VR compatible con la
visualización mediante Google Cardboard.

---

## 1. Descripción del proyecto

StereoVision Studio 3D es una aplicación web
desarrollada con HTML, CSS y JavaScript modular.

Su finalidad es facilitar la visualización y
calibración de contenido previamente preparado
para estereoscopía.

La aplicación permite trabajar con tres
modalidades:

1. Imágenes anaglifo rojo-cian.
2. Imágenes estereoscópicas Side-by-Side.
3. Videos estereoscópicos Side-by-Side.

Cada modalidad dispone de herramientas de edición
y visualización adaptadas a sus características.

El procesamiento se realiza desde el navegador,
sin utilizar una base de datos, cuentas de usuario
ni un servidor backend.

---

## 2. Objetivo general

Desarrollar una aplicación web profesional,
responsiva y modular que permita importar,
visualizar y calibrar archivos estereoscópicos,
conservando su relación de aspecto y contenido
original.

La aplicación integra herramientas de edición
visual, controles de reproducción y un modo
VR orientado a dispositivos móviles.

---

## 3. Problema que resuelve

El contenido estereoscópico requiere técnicas
específicas para representar correctamente
las perspectivas correspondientes a cada ojo.

Las imágenes anaglifo utilizan canales de color
para separar la información binocular.

Por su parte, las imágenes y videos SBS presentan
dos perspectivas colocadas horizontalmente.

StereoVision Studio 3D integra estas modalidades
en una misma interfaz, evitando la necesidad de
utilizar diferentes visualizadores para realizar
ajustes básicos de presentación.

La aplicación permite calibrar el contenido
sin modificar permanentemente los archivos.

---

## 4. Fundamento conceptual

### 4.1 Estereoscopía

La estereoscopía es una técnica de visualización
que utiliza dos perspectivas ligeramente distintas
de una misma escena.

Cada ojo recibe una imagen diferente.

El cerebro interpreta estas diferencias,
denominadas disparidad binocular, para generar
una percepción de profundidad.

### 4.2 Anaglifo rojo-cian

Una imagen anaglifo combina información
estereoscópica mediante canales de color.

Para observar correctamente su efecto se
utilizan lentes con filtros rojo y cian.

La aplicación permite modificar su presentación
visual sin separar ni reconstruir las
perspectivas originales.

### 4.3 Side-by-Side (SBS)

El formato Side-by-Side presenta dos perspectivas
dentro de una misma imagen o fotograma.

La distribución convencional es:

- Región izquierda: perspectiva del ojo izquierdo.
- Región derecha: perspectiva del ojo derecho.

StereoVision permite intercambiar estas
perspectivas cuando sea necesario.

### 4.4 Calibración estereoscópica

La calibración modifica la representación visual
para facilitar la observación binocular.

Se utilizan parámetros como:

- Escala.
- Desplazamiento horizontal relativo.
- Alineación vertical.
- Intercambio de perspectivas.

Estos ajustes no generan profundidad nueva.

La distancia interpupilar física del usuario,
la disparidad estereoscópica original y el
desplazamiento digital son conceptos distintos.

---

## 5. Funcionalidades principales

### 5.1 Módulo Anaglifo

Permite importar y visualizar imágenes
anaglifo rojo-cian.

Formatos compatibles:

- JPG/JPEG.
- PNG.
- WebP.

Herramientas disponibles:

- Escala del 50 % al 200 %.
- Ajuste de brillo.
- Ajuste de contraste.
- Restablecimiento de valores.
- Visualización en pantalla completa.
- Controles táctiles de edición.
- Carga de imagen de ejemplo.

La visualización anaglifo está diseñada
para utilizar lentes rojo-cian.

No requiere el modo VR binocular.

### 5.2 Módulo Imagen SBS

Permite importar imágenes Side-by-Side con
dos perspectivas estereoscópicas.

Herramientas disponibles:

- Separación de perspectivas izquierda y derecha.
- Ajuste de escala.
- Desplazamiento horizontal relativo.
- Alineación vertical.
- Intercambio de ojos.
- Restablecimiento de parámetros.
- Carga de imagen de ejemplo.
- Visualización en modo VR.
- Controles táctiles de calibración.

El renderizado conserva la proporción del
contenido y utiliza márgenes cuando es necesario.

### 5.3 Módulo Video SBS

Permite importar y reproducir videos MP4
compatibles con el navegador.

Funciones de reproducción:

- Reproducir.
- Pausar.
- Adelantar cinco segundos.
- Retroceder cinco segundos.
- Barra de progreso.
- Búsqueda temporal.
- Control de volumen.
- Visualización del tiempo transcurrido.
- Visualización de la duración.

Herramientas de calibración:

- Ajuste de escala.
- Desplazamiento horizontal relativo.
- Intercambio de ojos.
- Restablecimiento.
- Controles táctiles.
- Visualización VR.

El sistema utiliza una sola fuente de video
para obtener las perspectivas de ambos ojos.

Esto permite mantener el mismo tiempo de
reproducción y estado multimedia.

---

## 6. Pantalla completa y modo VR

### 6.1 Pantalla completa de Anaglifo

El módulo Anaglifo incorpora una función
independiente de pantalla completa.

Permite:

- Ampliar la imagen sin deformarla.
- Conservar brillo, contraste y escala.
- Utilizar controles táctiles.
- Salir de pantalla completa.
- Regresar al Studio sin perder el archivo.

Cuando la Fullscreen API no está disponible,
la aplicación puede utilizar una presentación
alternativa dentro de la página.

### 6.2 Modo VR para contenido SBS

Los módulos Imagen SBS y Video SBS permiten
activar el modo VR.

Características:

- Dos regiones horizontales de visualización.
- Una perspectiva para cada ojo.
- Compatibilidad visual con Google Cardboard.
- Conservación de la calibración.
- Presentación horizontal.
- Advertencia de orientación vertical.
- Botón táctil para salir.
- Conservación del archivo al regresar.
- Controles táctiles desplegables.

La pantalla completa y el bloqueo de orientación
dependen de los permisos y capacidades
del navegador utilizado.

### 6.3 Uso con Google Cardboard

Procedimiento recomendado:

1. Abrir StereoVision Studio 3D en el teléfono.
2. Seleccionar Imagen SBS o Video SBS.
3. Importar contenido estereoscópico auténtico.
4. Ajustar la presentación visual.
5. Activar el modo VR.
6. Colocar el teléfono horizontalmente.
7. Introducir el dispositivo en Google Cardboard.
8. Observar las perspectivas de manera cómoda.
9. Salir del modo VR al finalizar.

Ante fatiga ocular, mareo o visión doble
persistente, debe detenerse la visualización.

---

## 7. Controles táctiles

La aplicación incorpora controles táctiles
para manipular el contenido desde teléfonos
y dispositivos compatibles.

### Anaglifo

- Aumentar y disminuir escala.
- Aumentar y disminuir brillo.
- Aumentar y disminuir contraste.

### Imagen SBS

- Aumentar y disminuir escala.
- Modificar desplazamiento horizontal.
- Modificar alineación vertical.
- Intercambiar perspectivas.

### Video SBS

- Aumentar y disminuir escala.
- Modificar desplazamiento horizontal.
- Intercambiar perspectivas.
- Reproducir y pausar.
- Adelantar cinco segundos.
- Retroceder cinco segundos.

Los controles aparecen mediante un panel
desplegable para evitar obstruir constantemente
el contenido visualizado.

---

## 8. Importación y gestión multimedia

StereoVision Studio 3D permite importar
archivos desde el almacenamiento del usuario.

### Formatos admitidos

| Contenido  | Formatos             |
| ---------- | -------------------- |
| Anaglifo   | JPG, JPEG, PNG, WebP |
| Imagen SBS | JPG, JPEG, PNG, WebP |
| Video SBS  | MP4 compatible       |

La aplicación comprueba que el archivo tenga
un formato admitido y pueda decodificarse.

Cuando se detecta un archivo incompatible,
se muestra un mensaje comprensible.

El usuario puede continuar utilizando
la aplicación después de un error.

### Sustitución de archivos

Solo existe un archivo multimedia activo
a la vez.

Al importar un nuevo contenido:

1. Se libera el contenido anterior.
2. Se detiene el video anterior si corresponde.
3. Se actualizan los datos del archivo.
4. Se restablece la calibración.
5. Se presenta el nuevo contenido.

Los archivos originales no se sobrescriben.

---

## 9. Ejemplos multimedia

El proyecto incorpora tres archivos locales
de demostración:

- ejemplo-anaglifo.jpg
- ejemplo-imagen-sbs.jpg
- ejemplo-video-sbs.mp4

Se encuentran dentro de:

assets/media/

Cada módulo dispone de una opción para cargar
su ejemplo correspondiente.

### Funcionamiento

1. Seleccionar un módulo.
2. Presionar Cargar ejemplo.
3. Esperar la preparación del archivo.
4. Utilizar las herramientas disponibles.

Los ejemplos se obtienen mediante rutas
relativas al proyecto.

No se cargan automáticamente todos los archivos
al iniciar la aplicación.

Los usuarios también pueden importar
sus propios contenidos.

---

## 10. Tecnologías utilizadas

### HTML5

Define la estructura de la aplicación,
los paneles, botones, controles y elementos
multimedia.

### CSS3

Implementa la apariencia visual, la distribución
del Studio y el diseño responsivo.

### JavaScript ES Modules

Permite separar el código en componentes
independientes mediante import y export.

### Canvas API

Se utiliza para dibujar y separar las
perspectivas de imágenes y videos SBS.

### HTMLMediaElement

Gestiona la reproducción, pausa, volumen,
duración y búsqueda temporal del video.

### Fullscreen API

Permite presentar el contenido en pantalla
completa cuando el navegador lo admite.

### Screen Orientation API

Se utiliza para solicitar orientación
horizontal cuando está disponible.

### ResizeObserver

Detecta cambios de dimensiones y permite
actualizar el contenido renderizado.

### Git y GitHub

Permiten administrar versiones y publicar
el código fuente.

### GitHub Pages

Permite alojar la aplicación mediante HTTPS
sin requerir un backend.

---

## 11. Arquitectura del proyecto

```text
StereoVision-Studio-3D/
|
|-- index.html
|-- README.md
|
|-- assets/
    |
    |-- css/
    |   |-- style.css
    |   |-- touch-controls.css
    |
    |-- img/
    |   |-- favicon.svg
    |
    |-- media/
    |   |-- ejemplo-anaglifo.jpg
    |   |-- ejemplo-imagen-sbs.jpg
    |   |-- ejemplo-video-sbs.mp4
    |
    |-- js/
        |-- main.js
        |
        |-- modules/
            |-- anaglyph.js
            |-- appState.js
            |-- calibration.js
            |-- examples.js
            |-- fileManager.js
            |-- sbsImage.js
            |-- sbsVideo.js
            |-- touchControls.js
            |-- uiController.js
            |-- vrMode.js
```

---

## 12. Responsabilidades de los módulos

### main.js

Inicializa la aplicación y coordina sus módulos.

Registra eventos, administra la importación
y conecta los visualizadores con la interfaz.

### appState.js

Gestiona el estado general, archivo activo,
módulo seleccionado y parámetros iniciales.

### fileManager.js

Valida formatos y controla la decodificación
de archivos multimedia.

### anaglyph.js

Aplica los ajustes visuales a las imágenes
anaglifo rojo-cian.

### sbsImage.js

Realiza el recorte de imágenes SBS y presenta
las perspectivas correspondientes a cada ojo.

### sbsVideo.js

Renderiza las dos perspectivas de video
utilizando una fuente multimedia compartida.

### calibration.js

Valida y administra los parámetros
de calibración de cada modalidad.

### uiController.js

Actualiza la interfaz, los indicadores,
las herramientas disponibles y los estados
visuales del sistema.

### vrMode.js

Administra la visualización binocular VR,
la pantalla completa opcional y la salida
del visor.

### examples.js

Localiza y permite cargar las muestras
multimedia correspondientes a cada módulo.

### touchControls.js

Gestiona los controles táctiles desplegables
para edición y reproducción.

---

## 13. Estados del sistema

La aplicación contempla los siguientes estados:

- Sin archivo.
- Cargando.
- Listo.
- Reproduciendo.
- Pausado.
- Error.
- Modo VR.

Los controles dependientes del archivo
permanecen deshabilitados cuando no existe
contenido activo.

Los mensajes informan sobre carga,
reproducción y posibles problemas.

---

## 14. Instalación y ejecución local

### Requisitos

- Navegador web moderno.
- Visual Studio Code o editor equivalente.
- Servidor HTTP local para desarrollo.

### Procedimiento

1. Descargar o clonar el repositorio.
2. Abrir la carpeta StereoVision-Studio-3D.
3. Iniciar un servidor local.
4. Abrir index.html mediante HTTP.
5. Seleccionar un módulo.
6. Importar un archivo o cargar un ejemplo.
7. Utilizar las herramientas de visualización.

Ejemplo de dirección local:

http://127.0.0.1:5500/index.html

No se recomienda utilizar file:// debido
a las restricciones de seguridad asociadas
a los módulos JavaScript.

---

## 15. Matriz de pruebas funcionales

Las pruebas deberán verificarse en el entorno
de evaluación y registrar su resultado real.

| ID   | Prueba                          | Estado                       |
| ---- | ------------------------------- | ---------------------------- |
| P-01 | Inicio sin contenido            | Comprobado en PC             |
| P-02 | Carga y edición anaglifo       | Comprobado en PC             |
| P-03 | Carga y calibración SBS imagen | Comprobado en PC             |
| P-04 | Reproducción de video SBS      | Comprobado en PC             |
| P-05 | Edición dinámica de video SBS | Pendiente de evidencia final |
| P-06 | Sustitución multimedia         | Pendiente de evidencia final |
| P-07 | Archivo incompatible            | Pendiente de evidencia final |
| P-08 | Modo VR móvil                  | Pendiente de prueba móvil   |
| P-09 | GitHub Pages HTTPS              | Pendiente de publicación    |

---

## 16. Registro de calibración

Se deben registrar los siguientes datos
para cada contenido probado:

- Archivo multimedia.
- Módulo seleccionado.
- Dispositivo utilizado.
- Escala.
- Brillo y contraste, si corresponde.
- Desplazamiento horizontal.
- Alineación vertical, si corresponde.
- Intercambio de ojos.
- Resultado visual.

Los valores registrados deben corresponder
a pruebas realmente realizadas.

---

## 17. Incidencias encontradas

### Incidencia 1: módulos JavaScript desde file://

**Problema:**

La interfaz se mostraba, pero los controles
no respondían al abrir index.html directamente.

**Causa:**

Las restricciones del navegador impedían
cargar correctamente los módulos ES desde
un origen file://.

**Solución:**

Se ejecutó el proyecto mediante Live Server
utilizando HTTP local.

**Resultado:**

Los módulos JavaScript se cargaron y los
controles comenzaron a responder.

### Incidencia 2: archivo 2D en visualizador SBS

**Problema:**

Al utilizar un archivo convencional en el
módulo SBS, cada región mostraba una mitad
diferente de la imagen original.

**Causa:**

El contenido no estaba preparado como
un par estereoscópico auténtico.

**Solución:**

Se identificó la necesidad de utilizar
contenido SBS con dos perspectivas completas
y diferentes de la misma escena.

**Resultado:**

Se utilizaron muestras adecuadas para
comprobar la distribución binocular.

---

## 18. Seguridad y privacidad

StereoVision Studio 3D no utiliza:

- Registro de usuarios.
- Inicio de sesión.
- Base de datos.
- Backend.
- Almacenamiento remoto de archivos del usuario.

Los archivos importados se procesan
localmente dentro del navegador.

Las muestras incorporadas al proyecto
son recursos públicos de la aplicación
cuando se publica el repositorio.

---

## 19. Limitaciones

La aplicación no convierte automáticamente
imágenes planas en contenido 3D.

Tampoco genera nuevas perspectivas
estereoscópicas ni modifica permanentemente
la disparidad original.

No incluye exportación ni transcodificación
de archivos multimedia.

La compatibilidad de los videos MP4 depende
de los códecs admitidos por el navegador.

El funcionamiento del modo VR puede variar
según el dispositivo, navegador y gafas.

Los controles táctiles pueden requerir
retirar temporalmente el teléfono del visor
para realizar ciertos ajustes.

---

## 20. Publicación

### Repositorio público

Pendiente de agregar la URL del repositorio.

### Aplicación GitHub Pages

Pendiente de agregar la URL HTTPS pública.

La publicación permitirá comprobar el
funcionamiento en computadora y teléfono
sin necesidad de instalar software adicional.

---

## 21. Conclusión del desarrollo

StereoVision Studio 3D integra las principales
modalidades de visualización estereoscópica
dentro de una aplicación web modular.

El proyecto demuestra la importancia de
procesar correctamente las perspectivas,
conservar la proporción del contenido y
permitir ajustes visuales en tiempo real.

La implementación de controles táctiles,
pantalla completa, ejemplos multimedia
y modo VR amplía las posibilidades de uso
en diferentes dispositivos.

La separación de responsabilidades entre
módulos facilita el mantenimiento del código,
la identificación de errores y la ampliación
futura de funcionalidades.

La aplicación permite realizar calibraciones
sin modificar los archivos multimedia
originales.

---


## 22. Información académica

**Actividad:** 2.4 Examen Tema 2 - Estereoscopía

**Proyecto:** StereoVision Studio 3D

**Asignatura:** Ambientes Virtuales

**Estudiante:** Milton Juarez Austria

**Número de control:** 22200783

**Carrera:** Tecnologías de la Información y Comunicaciones

**Institución:** Instituto Tecnológico Nacional de Mexico Campus Pachuca

**Año:** 2026

---

StereoVision Studio 3D
Proyecto académico de visualización estereoscópica.

---

StereoVision Studio 3D
Proyecto académico de visualización estereoscópica.
