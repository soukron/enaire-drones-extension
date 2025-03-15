import { loadAirportsData } from './airports.js';
import { lastClickedCoordinates } from './coordinates.js';

let airportsData = null;

async function processAlertContent(text) {
  const heightRegex = /Por debajo de (\d+)m medidos desde el punto de referencia del /;
  const airportRegex = /,\s*([A-Z]{4})/;
  
  const cleanText = text.replace(/<[^>]*>/g, '');
  const heightMatch = text.match(heightRegex);
  const airportMatch = text.match(airportRegex);
  
  if (heightMatch && airportMatch) {
    const arpHeight = parseInt(heightMatch[1], 10);
    const airportCode = airportMatch[1];
    
    if (!airportsData) {
      airportsData = await loadAirportsData();
    }

    const airportData = airportsData?.find(airport => airport.icaoCode === airportCode);
    if (airportData && lastClickedCoordinates) {
      const arpElevation = airportData.elevation.value;
      const calcTimeDiv = document.querySelector('.calcTime');
      const elevationText = calcTimeDiv?.textContent.match(/Elevación: (\d+) metros/);
      
      if (elevationText) {
        const groundElevation = parseInt(elevationText[1], 10);
        const heightAboveARP = arpElevation + arpHeight;
        let maxHeight = heightAboveARP - groundElevation;
        let heightMessage = maxHeight <= 0 
          ? '<span style="color: #dc143c;">No está permitido el vuelo. Ver desglose.</span>'
          : `${Math.min(maxHeight, 120)}m sobre el punto de despegue`;

        return `${text}
                <b>Altura máxima sin coordinacion:</b> ${heightMessage}<br>
                <b>Desglose:</b><br>
                - Elevación del punto de despegue: ${groundElevation}m<br>
                - Elevación del ARP: ${arpElevation}m<br>
                - Altura máxima sobre el ARP: ${arpHeight}m<br>
                - Altura máxima sobre el nivel del mar: ${heightAboveARP}m`;
      }
    }
  }
  return text;
}

export { processAlertContent }; 