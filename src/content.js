// Variable global para almacenar las coordenadas del último click
let lastClickedCoordinates = null;

// Variable global para almacenar la altura del ARP
let arpHeight = null;

// Variable global para almacenar los datos de aeropuertos
let airportsData = null;

// Función auxiliar para convertir coordenadas a decimal
function parseCoordToDecimal(degrees, minutes, seconds, direction) {
  let decimal = degrees + (minutes / 60) + (seconds / 3600);

  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }

  return decimal.toFixed(6);
}

// Función para obtener la elevación
async function getElevation(lat, lon) {
  const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.results && data.results[0]) {
      return data.results[0].elevation;
    } else {
      throw new Error('No elevation data in response');
    }
  } catch (error) {
    console.error('Error fetching elevation:', error);
    throw error;
  }
}

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

// Función para procesar y mostrar las coordenadas
async function processCoordinates() {
  if (!lastClickedCoordinates) {
    console.log('soukronfpv - No hay coordenadas guardadas del click');
    return;
  }

  const calcTimeDiv = document.querySelector('.calcTime');  
  if (calcTimeDiv) {
    // Solo procesar si no hay coordenadas ya mostradas
    if (!calcTimeDiv.textContent.includes('Coordenadas:')) {
      const contenido = lastClickedCoordinates;
      console.log('soukronfpv - Procesando coordenadas guardadas:', contenido);
      
      // Parsear las coordenadas en formato DD°MM′SS.SSS″N/S DDD°MM′SS.SSS″E/W
      const coordRegex = /(\d+)°(\d+)′(\d+\.\d+)″([NS])\s*(\d+)°(\d+)′(\d+\.\d+)″([EW])/;
      const match = contenido.match(coordRegex);

      if (match) {
        // Extraer componentes
        const latDeg = parseInt(match[1]);
        const latMin = parseInt(match[2]);
        const latSec = parseFloat(match[3]);
        const latDir = match[4];

        const lonDeg = parseInt(match[5]);
        const lonMin = parseInt(match[6]);
        const lonSec = parseFloat(match[7]);
        const lonDir = match[8];

        // Convertir a decimal
        const lat = parseCoordToDecimal(latDeg, latMin, latSec, latDir);
        const lon = parseCoordToDecimal(lonDeg, lonMin, lonSec, lonDir);

        console.log(`soukronfpv - Coordenadas convertidas: ${lat}, ${lon}`);

        try {
          const elevation = await getElevation(lat, lon);
          console.log(`soukronfpv - Elevación en el punto (${lat}, ${lon}): ${elevation} metros`);
          calcTimeDiv.innerHTML = `${calcTimeDiv.textContent}<br>Coordenadas: ${contenido}<br>Elevación: ${elevation} metros`;
        } catch (error) {
          console.error('soukronfpv - Error al obtener la elevación:', error);
          calcTimeDiv.innerHTML = `${calcTimeDiv.textContent}<br>Coordenadas: ${contenido}`;
        }
      } else {
        console.log('soukronfpv - No se pudieron parsear las coordenadas:', contenido);
        calcTimeDiv.innerHTML = `${calcTimeDiv.textContent}<br>Coordenadas: ${contenido}`;
      }
    } else {
      console.log('soukronfpv - El div ya contiene coordenadas, saltando procesamiento');
    }
  }
}

// Función para cargar los datos de aeropuertos
async function loadAirportsData() {
  try {
    const response = await fetch(chrome.runtime.getURL('aip.json'));
    airportsData = await response.json();
    console.log('soukronfpv - Datos de aeropuertos cargados');
  } catch (error) {
    console.error('soukronfpv - Error cargando datos de aeropuertos:', error);
  }
}

// Función para procesar el contenido de las alertas
async function processAlertContent(text) {
  // Expresión regular para capturar la altura en metros y el código del aeródromo
  const heightRegex = /Por debajo de (\d+)m medidos desde el punto de referencia del /;
  const airportRegex = /,\s*([A-Z]{4})/;
  
  // Primero limpiamos el texto de tags HTML para el log
  const cleanText = text.replace(/<[^>]*>/g, '');
  const heightMatch = text.match(heightRegex);
  const airportMatch = text.match(airportRegex);
  console.log('soukronfpv - Procesando alerta:', cleanText, heightMatch, airportMatch);

  if (heightMatch && airportMatch) {
    arpHeight = parseInt(heightMatch[1], 10);
    const airportCode = airportMatch[1];
    
    console.log('soukronfpv - Datos capturados:', {
      altura: arpHeight,
      codigo: airportCode
    });

    // Buscar datos del aeropuerto en aip.json
    if (!airportsData) {
      await loadAirportsData();
    }

    const airportData = airportsData?.find(airport => airport.icaoCode === airportCode);
    if (airportData) {
      console.log('soukronfpv - Datos del aeropuerto encontrados:', airportData);
      const arpElevation = airportData.elevation.value;
      console.log('soukronfpv - Elevación del aeropuerto:', arpElevation);
      // Si tenemos las coordenadas y su elevación, calculamos la altura máxima
      if (lastClickedCoordinates) {
        const calcTimeDiv = document.querySelector('.calcTime');
        const elevationText = calcTimeDiv?.textContent.match(/Elevación: (\d+) metros/);
        
        if (elevationText) {
          const groundElevation = parseInt(elevationText[1], 10);
          const heightAboveARP = arpElevation + arpHeight;
          let maxHeight = heightAboveARP - groundElevation;
          let heightMessage;

          if (maxHeight <= 0) {
            heightMessage = '<span style="color: #dc143c;">No está permitido el vuelo. Ver desglose.</span>';
          } else {
            if (maxHeight > 120) {
              maxHeight = 120;
            }
            heightMessage = `${maxHeight}m sobre el punto de despegue`;
          }

          return `${text}
                  <b>Altura máxima sin coordinacion:</b> ${heightMessage}<br>
                  <b>Desglose:</b><br>
                  - Elevación del punto de despegue: ${groundElevation}m<br>
                  - Elevación del ARP: ${arpElevation}m<br>
                  - Altura máxima sobre el ARP: ${arpHeight}m<br>
                  - Altura máxima sobre el nivel del mar: ${heightAboveARP}m`;
        }
      }
    } else {
      console.log('soukronfpv - No se encontraron datos para el aeropuerto:', airportCode);
    }
  }

  return text;
}

// Función que agrega la clase 'detected' a los divs de NOTAM y ALERTA
function addDetectedClass() {
  // Procesar coordenadas primero
  processCoordinates();
  
  // Procesar NOTAMs
  const notamElements = document.querySelectorAll("div.mensajeDrones.NOTAM");
  notamElements.forEach((element) => {
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

  // Procesar Alertas
  const alertElements = document.querySelectorAll("div.mensajeDrones.ALERTA");
  alertElements.forEach(async (element) => {
    if (!element.classList.contains("detected") && 
        element.textContent.includes("Por debajo de")) {
      element.classList.add("detected");

      // Obtener el texto del div
      const originalText = element.innerHTML;

      // Procesar y actualizar el texto del div
      const updatedText = await processAlertContent(originalText);

      // Actualizar el contenido del div
      element.innerHTML = updatedText;
    }
  });
}

// Función para procesar clicks en el mapa
function handleMapClick() {
  // Capturar las coordenadas inmediatamente
  const coordInfo = document.querySelector('.coordinate-info');
  if (coordInfo) {
    lastClickedCoordinates = coordInfo.textContent;
    console.log('soukronfpv - Coordenadas capturadas en click:', lastClickedCoordinates);
  }

  // Esperamos a que las llamadas AJAX terminen
  setTimeout(async () => {
    await processCoordinates();
    addDetectedClass();
  }, 1000);
}

// Función para inicializar el monitor del mapa
function initMapMonitor() {
  const map = document.querySelector('.map');
  console.log('soukronfpv - Buscando elemento mapa...', map);
  
  if (map) {
    map.addEventListener('click', handleMapClick);
    console.log('soukronfpv - Monitor de clicks en mapa iniciado');
  } else {
    console.log('soukronfpv - No se encontró el elemento mapa');
  }
}

// Intentar inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initMapMonitor);

// También intentar inicializar cuando la página esté completamente cargada
window.addEventListener('load', initMapMonitor);

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
