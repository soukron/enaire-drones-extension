let lastClickedCoordinates = null;

function parseCoordToDecimal(degrees, minutes, seconds, direction) {
  let decimal = degrees + (minutes / 60) + (seconds / 3600);
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  return decimal.toFixed(6);
}

async function getElevation(lat, lon) {
  const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data.results && data.results[0]) return data.results[0].elevation;
    throw new Error('No elevation data in response');
  } catch (error) {
    console.error('Error fetching elevation:', error);
    throw error;
  }
}

async function processCoordinates() {
  if (!lastClickedCoordinates) {
    console.log('soukronfpv - No hay coordenadas guardadas del click');
    return;
  }

  const calcTimeDiv = document.querySelector('.calcTime');  
  if (calcTimeDiv && !calcTimeDiv.textContent.includes('Coordenadas:')) {
    const contenido = lastClickedCoordinates;
    console.log('soukronfpv - Procesando coordenadas guardadas:', contenido);
    
    const coordRegex = /(\d+)°(\d+)′(\d+\.\d+)″([NS])\s*(\d+)°(\d+)′(\d+\.\d+)″([EW])/;
    const match = contenido.match(coordRegex);

    if (match) {
      const [_, latDeg, latMin, latSec, latDir, lonDeg, lonMin, lonSec, lonDir] = match;
      const lat = parseCoordToDecimal(parseInt(latDeg), parseInt(latMin), parseFloat(latSec), latDir);
      const lon = parseCoordToDecimal(parseInt(lonDeg), parseInt(lonMin), parseFloat(lonSec), lonDir);

      try {
        const elevation = await getElevation(lat, lon);
        calcTimeDiv.innerHTML = `${calcTimeDiv.textContent}<br>Coordenadas: ${contenido}<br>Elevación: ${elevation} metros`;
      } catch (error) {
        calcTimeDiv.innerHTML = `${calcTimeDiv.textContent}<br>Coordenadas: ${contenido}`;
      }
    } else {
      calcTimeDiv.innerHTML = `${calcTimeDiv.textContent}<br>Coordenadas: ${contenido}`;
    }
  }
}

export { lastClickedCoordinates, processCoordinates }; 