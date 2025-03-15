function convertToMeters(limit) {
  if (limit === "SFC") {
    return "el suelo";
  } else if (limit.startsWith("FL")) {
    const feet = parseInt(limit.replace("FL", ""), 10) * 100;
    return `${Math.round(feet * 0.3048)}m`;
  } else if (limit.endsWith("FT")) {
    const feet = parseInt(limit.replace("FT", ""), 10);
    return `${Math.round(feet * 0.3048)}m`;
  } else if (limit.endsWith("M")) {
    return `${parseInt(limit.replace("M", ""), 10)}m`;
  }
}

function parseAndConvertHeights(notamContent) {
  const heightRegex = /(SFC|FL\d+|\d+FT|\d+M)\s*\/\s*(FL\d+|\d+FT|\d+M)\s*(AMSL|AGL)?/;

  return notamContent.replace(
    heightRegex,
    (match, lowerLimit, upperLimit, reference) => {
      const lowerLimitConverted = convertToMeters(lowerLimit);
      const upperLimitConverted = convertToMeters(upperLimit);

      return `<b>LIMITES</b>: <span class="tooltip" data-original="${match}">
      Desde ${lowerLimitConverted} hasta ${upperLimitConverted} ${reference || ""}
      <span class="tooltiptext">${match}</span>
    </span>`;
    }
  );
}

export { convertToMeters, parseAndConvertHeights }; 