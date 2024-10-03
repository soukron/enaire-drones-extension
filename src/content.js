// Función para manejar la visibilidad de la descripción
function toggleDescription(element) {
  const description = element.querySelector(".description-content");
  const toggleLink = element.querySelector(".toggle-description");

  if (description.style.display === "none") {
    description.style.display = "block";
    toggleLink.textContent = "Ocultar descripción";
  } else {
    description.style.display = "none";
    toggleLink.textContent = "Ver descripción";
  }
}

// Función para reemplazar el contenido de la descripción con un enlace para mostrar/ocultar
function handleDescriptionToggle(text) {
  // Expresión regular para encontrar la descripción
  const descriptionRegex = /(<b>DESCRIPCIÓN:<\/b>)([\s\S]*?)(<br>)/i;

  // Reemplazar la descripción con el enlace de toggle y el contenido oculto
  const updatedText = text.replace(
    descriptionRegex,
    (match, p1, descriptionContent, p3) => {
      return `
      ${p1}
      <a class="toggle-description" href="#" style="color: blue; text-decoration: underline;">
        Ver descripción
      </a>
      <div class="description-content" style="display: none;">
        ${descriptionContent}
      </div>
    `;
    },
  );

  return updatedText;
}

// Función para reemplazar los datos de coordinación y agregar una línea antes de la descripción
function addCoordinationData(text) {
  // Expresión regular para identificar datos de coordinación
  const coordinationMailRegex = /COORDINATION MAIL: ([^\<\r\n]*)/i;
  const coordinationPhoneRegex =
    /COORDINATION PHONE NUMBER:\s*([\+\d\s\(\)]+)\s*(?:<br>|\s|$)/i;

  // Buscar los datos de coordinación en el texto
  const mailMatch = text.match(coordinationMailRegex);
  const phoneMatch = text.match(coordinationPhoneRegex);

  // Crear un texto de coordinación si se encuentra información
  let coordinationText = "";
  if (mailMatch) {
    coordinationText += `E-mail: ${mailMatch[1]}`;
  }
  if (phoneMatch) {
    coordinationText += ` TEL: ${phoneMatch[1]}`;
  }
  if (mailMatch || phoneMatch)
    coordinationText = "<b>COORDINACIÓN:</b> " + coordinationText + "<br>";

  // Agregar el texto de coordinación antes de la descripción
  const updatedText = text.replace(/(<b>DESCRIPCIÓN:<\/b>)/i, (match) => {
    if (coordinationText) {
      return `${coordinationText}${match}`;
    }
    return match;
  });

  return updatedText;
}

// Función para convertir los diferentes formatos de altura a metros
function convertToMeters(limit) {
  if (limit === "SFC") {
    return "el suelo";
  } else if (limit.startsWith("FL")) {
    // Convertir nivel de vuelo (FLxxx) a pies, luego a metros
    const feet = parseInt(limit.replace("FL", ""), 10) * 100;
    return `${Math.round(feet * 0.3048)}m`;
  } else if (limit.endsWith("FT")) {
    // Convertir pies a metros
    const feet = parseInt(limit.replace("FT", ""), 10);
    return `${Math.round(feet * 0.3048)}m`;
  } else if (limit.endsWith("M")) {
    // Devolver directamente los metros, quitando ceros a la izquierda
    return `${parseInt(limit.replace("M", ""), 10)}m`;
  }
}

// Función para parsear y convertir alturas, incluyendo FLxxx
function parseAndConvertHeights(notamContent) {
  // Expresión regular para capturar los diferentes formatos de altura
  const heightRegex =
    /(SFC|FL\d+|\d+FT|\d+M)\s*\/\s*(FL\d+|\d+FT|\d+M)\s*(AMSL|AGL)?/;

  // Reemplazar el texto con la conversión correcta
  const updatedContent = notamContent.replace(
    heightRegex,
    (match, lowerLimit, upperLimit, reference) => {
      const lowerLimitConverted = convertToMeters(lowerLimit);
      const upperLimitConverted = convertToMeters(upperLimit);

      // Mostrar el resultado en cursiva con un tooltip para el texto original
      return `<b>LIMITES</b>: <span  class="tooltip" data-original="${match}">
      Desde ${lowerLimitConverted} hasta ${upperLimitConverted} ${reference || ""}
      <span class="tooltiptext">${match}</span>
    </span>`;
    },
  );

  return updatedContent;
}

// Función para convertir una fecha en formato UTC a la zona horaria de España
function convertUTCToLocal(utcDateString) {
  // Transformar el formato dd/mm/yyyy hh:mm:ss a ISO 8601
  const [datePart, timePart] = utcDateString.split(" ");
  const [day, month, year] = datePart.split("/");
  const isoDateString = `${year}-${month}-${day}T${timePart}Z`;

  // Crear un objeto Date en UTC
  const utcDate = new Date(isoDateString);

  // Verificar si la fecha es válida
  if (isNaN(utcDate.getTime())) {
    console.error("soukronfpv - Fecha UTC no válida:", utcDateString);
    return utcDateString; // Devolver el valor original si la conversión falla
  }

  // Convertir a la zona horaria de España
  const localDateString = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "long",
    timeZone: "Europe/Madrid", // Asegurarse de usar la zona horaria correcta
  }).format(utcDate);

  return localDateString;
}

// Función que extrae y convierte fechas del texto del NOTAM
function parseAndConvertDates(text) {
  // Expresión regular para extraer fechas, considerando etiquetas HTML
  const regex =
    /<b>DESDE:<\/b>(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})<br><b>HASTA:<\/b>(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/;
  const match = text.match(regex);

  if (match) {
    const fromDateUTC = match[1];
    const toDateUTC = match[2];

    // Convertir las fechas a la zona horaria de España
    const fromDateLocal = convertUTCToLocal(fromDateUTC);
    const toDateLocal = convertUTCToLocal(toDateUTC);

    // Reemplazar las fechas en el texto con las versiones locales y en cursiva, y añadir tooltips
    const updatedText = text.replace(
      regex,
      `
      
      <b>DESDE:</b> 
      <span  class="tooltip" data-original="${fromDateUTC}">
        ${fromDateLocal}
        <span class="tooltiptext">${fromDateUTC} UTC</span>
      </span>
      <br>
      <b>HASTA:</b> 
      <span  class="tooltip" data-original="${toDateUTC}">
        ${toDateLocal}
        <span class="tooltiptext">${toDateUTC} UTC</span>
      </span>
    `,
    );

    return updatedText;
  } else {
    return text;
  }
}

// Función para agregar un mensaje de aviso si el texto contiene frases específicas
function addRestrictionNotice(text) {
  // Expresión regular para identificar textos de restricción
  const restrictionTextRegex =
    /(TEMPORARY RESTRICTED AREA ESTABLISHED|TEMPORARY SEGREGATED AREA)/i;

  // Agregar una línea de aviso si el texto contiene frases específicas
  const updatedText = text.replace(/(<b>DESCRIPCIÓN:<\/b>)/i, (match) => {
    if (restrictionTextRegex.test(text)) {
      return `<b>IMPORTANTE:</b> <span style="color: #dc143c;">Este NOTAM PROHIBE el vuelo sin coordinación.</span><br>${match}`;
    }
    return match;
  });

  return updatedText;
}

// Función para insertar una línea "No especificado" si no hay horario después de la cabecera
function insertNoScheduleLine(text) {
  // Expresión regular ajustada para capturar el contenido entre "HORARIO:" y el <br>
  const scheduleRegex = /(<b>HORARIO:<\/b>)(.*?)(<br>)/i;

  // Reemplazar con la línea "No especificado" si no hay contenido de horario después de la cabecera
  const updatedText = text.replace(
    scheduleRegex,
    (match, p1, scheduleContent, p3) => {
      const cleanedScheduleContent = scheduleContent.trim();

      // Si no hay un contenido significativo después de "HORARIO:", insertar "No especificado"
      if (!cleanedScheduleContent) {
        return `${p1}&nbsp;No especificado${p3}`;
      }

      // Si hay contenido, asegurarse de que haya un espacio no separable entre "HORARIO:" y el horario
      return `${p1}&nbsp;${cleanedScheduleContent} UTC${p3}`;
    },
  );

  return updatedText;
}

// Función para procesar el contenido del div
function processNotamContent(text) {
  // Primero procesar fechas y alturas
  const updatedTextWithDates = parseAndConvertDates(text);
  const updatedTextWithHeights = parseAndConvertHeights(updatedTextWithDates);
  const textWithNotice = addRestrictionNotice(updatedTextWithHeights);
  // Agregar los datos de coordinación
  const textWithCoordination = addCoordinationData(textWithNotice);
  // Manejar la visibilidad de la descripción
  const textWithDescription = handleDescriptionToggle(textWithCoordination);
  // Insertar la línea "No especificado" si no hay horario
  const finalUpdatedText = insertNoScheduleLine(textWithDescription);

  return "<b>ID:</b>&nbsp;" + finalUpdatedText;
}

// Función que agrega la clase 'detected' al div con class 'mensajeDrones NOTAM'
function addDetectedClass() {
  const elements = document.querySelectorAll("div.mensajeDrones.NOTAM");
  if (elements.length === 0) {
  }
  elements.forEach((element) => {
    if (!element.classList.contains("detected")) {
      element.classList.add("detected");

      // Obtener el texto del div
      const originalText = element.innerHTML;

      // Procesar y actualizar el texto del div
      const updatedText = processNotamContent(originalText);

      // Actualizar el contenido del div
      element.innerHTML = updatedText;

      // Agregar manejadores de eventos para los enlaces de toggle
      element.querySelectorAll(".toggle-description").forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          toggleDescription(link.parentElement);
        });
      });
    }
  });
}

// Configura un observador para monitorizar cambios en el DOM
const observer = new MutationObserver(function (mutationsList) {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList" || mutation.type === "subtree") {
      // Llama a la función cada vez que haya un cambio en el DOM
      addDetectedClass();
    }
  }
});

// Opciones para el observador (monitoriza elementos hijos y el subárbol)
const config = { childList: true, subtree: true };

// Inicia el observador en el documento completo
console.log(
  "soukronfpv - Iniciando el observador en el cuerpo del documento...",
);
observer.observe(document.body, config);

// También ejecuta la función al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  addDetectedClass();
});

// Agregar estilos para el tooltip
const style = document.createElement("style");
style.innerHTML = `
  .tooltip {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }
  .tooltip .tooltiptext {
    visibility: hidden;
    width: 200px;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 125%; /* Sitúa el tooltip arriba del texto */
    left: 50%;
    margin-left: -100px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
  }
`;
document.head.appendChild(style);
