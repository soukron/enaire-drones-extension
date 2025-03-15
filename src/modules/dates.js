function convertUTCToLocal(utcDateString) {
  const [datePart, timePart] = utcDateString.split(" ");
  const [day, month, year] = datePart.split("/");
  const isoDateString = `${year}-${month}-${day}T${timePart}Z`;

  const utcDate = new Date(isoDateString);
  if (isNaN(utcDate.getTime())) {
    console.error("soukronfpv - Fecha UTC no válida:", utcDateString);
    return utcDateString;
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "long",
    timeZone: "Europe/Madrid",
  }).format(utcDate);
}

function parseAndConvertDates(text) {
  const regex = /<b>DESDE:<\/b>(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})<br><b>HASTA:<\/b>(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/;
  const match = text.match(regex);

  if (match) {
    const fromDateUTC = match[1];
    const toDateUTC = match[2];
    const fromDateLocal = convertUTCToLocal(fromDateUTC);
    const toDateLocal = convertUTCToLocal(toDateUTC);

    return text.replace(
      regex,
      `<b>DESDE:</b> 
      <span class="tooltip" data-original="${fromDateUTC}">
        ${fromDateLocal}
        <span class="tooltiptext">${fromDateUTC} UTC</span>
      </span>
      <br>
      <b>HASTA:</b> 
      <span class="tooltip" data-original="${toDateUTC}">
        ${toDateLocal}
        <span class="tooltiptext">${toDateUTC} UTC</span>
      </span>`
    );
  }
  return text;
}

export { convertUTCToLocal, parseAndConvertDates }; 