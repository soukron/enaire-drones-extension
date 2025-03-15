import { processCoordinates } from './coordinates.js';
import { processNotamContent } from './notams.js';
import { processAlertContent } from './alerts.js';
import { toggleDescription } from './ui/tooltips.js';

async function processElements() {
  await processCoordinates();
  
  // Procesar NOTAMs
  const notamElements = document.querySelectorAll("div.mensajeDrones.NOTAM");
  notamElements.forEach((element) => {
    if (!element.classList.contains("detected")) {
      element.classList.add("detected");
      element.innerHTML = processNotamContent(element.innerHTML);
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
      element.innerHTML = await processAlertContent(element.innerHTML);
    }
  });
}

export { processElements }; 