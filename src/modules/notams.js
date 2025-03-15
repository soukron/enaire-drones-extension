import { parseAndConvertDates } from './dates.js';
import { parseAndConvertHeights } from './utils/heights.js';
import { addRestrictionNotice, insertNoScheduleLine, addCoordinationData } from './utils/text.js';
import { handleDescriptionToggle } from './ui/tooltips.js';

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

export { processNotamContent }; 