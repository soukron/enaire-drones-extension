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

export { toggleDescription }; 