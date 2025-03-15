async function loadAirportsData() {
  try {
    const response = await fetch(chrome.runtime.getURL('aip.json'));
    const data = await response.json();
    console.log('soukronfpv - Datos de aeropuertos cargados');
    return data;
  } catch (error) {
    console.error('soukronfpv - Error cargando datos de aeropuertos:', error);
    return null;
  }
}

export { loadAirportsData }; 