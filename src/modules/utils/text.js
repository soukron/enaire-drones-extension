function addRestrictionNotice(text) {
  const restrictionTextRegex = /(TEMPORARY RESTRICTED AREA ESTABLISHED|TEMPORARY SEGREGATED AREA|TEMPO RESTRICTED AREA ACTIVATED)/i;

  return text.replace(/(<b>DESCRIPCIÓN:<\/b>)/i, (match) => {
    if (restrictionTextRegex.test(text)) {
      return `<b>IMPORTANTE:</b> <span style="color: #dc143c;">Este NOTAM PROHIBE el vuelo sin coordinación.</span><br>${match}`;
    }
    return match;
  });
}

function insertNoScheduleLine(text) {
  const scheduleRegex = /(<b>HORARIO:<\/b>)(.*?)(<br>)/i;

  return text.replace(
    scheduleRegex,
    (match, p1, scheduleContent, p3) => {
      const cleanedScheduleContent = scheduleContent.trim();
      if (!cleanedScheduleContent) {
        return `${p1}&nbsp;No especificado${p3}`;
      }
      return `${p1}&nbsp;${cleanedScheduleContent} UTC${p3}`;
    }
  );
}

function addCoordinationData(text) {
  const coordinationMailRegex = /COORDINATION (EMAIL|MAIL): ([^\<\r\n]*)/i;
  const coordinationPhoneRegex = /COORDINATION (TEL|PHONE NUMBER):\s*([\+\d\s\(\)]+)\s*(?:<br>|\s|$)/i;

  const mailMatch = text.match(coordinationMailRegex);
  const phoneMatch = text.match(coordinationPhoneRegex);

  let coordinationText = "";
  if (mailMatch) coordinationText += `E-mail: ${mailMatch[1]}`;
  if (phoneMatch) coordinationText += ` TEL: ${phoneMatch[1]}`;
  if (coordinationText) coordinationText = "<b>COORDINACIÓN:</b> " + coordinationText + "<br>";

  return text.replace(/(<b>DESCRIPCIÓN:<\/b>)/i, (match) => {
    return coordinationText ? `${coordinationText}${match}` : match;
  });
}

export { addRestrictionNotice, insertNoScheduleLine, addCoordinationData }; 