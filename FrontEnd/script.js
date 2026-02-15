let works = [];
window.works = works;

const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");

function display(list) {
  gallery.innerHTML = "";
  list.forEach(work => {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;
    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    `;
    gallery.appendChild(figure);
  });
}

function render(categoryId) {
  console.log("Catégorie sélectionnée :", categoryId);

  if (categoryId === "all") {
    display(works);
    return;
  }

  const id = Number(categoryId);

  const filtered = works.filter(w =>
    (w.categoryId !== undefined && w.categoryId === id) ||
    (w.category && w.category.id === id)
  );

  console.log("Filtrés :", filtered.length);
  display(filtered);
}

fetch("http://localhost:5678/api/works")
  .then(r => r.json())
  .then(data => {
    works = data;
    window.works = works;

    window.dispatchEvent(new CustomEvent("worksLoaded", { detail: works }));

    console.log("Works chargés :", works.length, "Exemple:", works[0]);
    display(works);
  })
.catch(err => console.error("Erreur fetch works :", err));

filters.innerHTML = "";

fetch("http://localhost:5678/api/categories")
  .then(r => r.json())
  .then(categories => {

    function setActiveButton(clickedButton) {
      filters.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      clickedButton.classList.add("active");
    }

    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("active"); // actif par défaut
    allButton.addEventListener("click", () => {
      setActiveButton(allButton);
      render("all");
    });
    filters.appendChild(allButton);

    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.textContent = cat.name;
      btn.dataset.id = cat.id;

      btn.addEventListener("click", () => {
        setActiveButton(btn);
        render(Number(btn.dataset.id));
      });

      filters.appendChild(btn);
    });
  })
  .catch(err => console.error("Erreur fetch catégories :", err));

window.addEventListener("worksUpdated", (e) => {
    works = e.detail;
    window.works = works;
  
    // Si un filtre est actif, on le garde
    const activeBtn = document.querySelector(".filters button.active");
    const activeId = activeBtn?.dataset?.id || "all";
  
    if (activeId === "all") display(works);
    else render(Number(activeId));
  });
