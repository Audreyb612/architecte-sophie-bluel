let works = [];

const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");

console.log("Gallery :", gallery);

fetch("http://localhost:5678/api/works")
  .then(response => response.json())
  .then(data => {
    works = data;
    console.log("Works en mémoire :", works);

    display(works);
  })
  .catch(error => {
    console.error("Erreur fetch works :", error);
  });

filters.innerHTML = "";

fetch("http://localhost:5678/api/categories")
  .then(response => response.json())
  .then(categories => {
    console.log("Catégories :", categories);

    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    filters.appendChild(allButton);

    categories.forEach(category => {
      const button = document.createElement("button");
      button.textContent = category.name;
      button.dataset.id = category.id;
      button.addEventListener ("click", () => {render(categoryId=button.dataset.id)});
      filters.appendChild(button);
    });
  })
  .catch(error => {
    console.error("Erreur fetch catégories :", error);
  });

  function render (categoryId){
  
    console.log("Bouton clic !");
    console.log(`Catégorie sélectionnée : ${categoryId}`)
    const filteredWorks = works.filter(work => {
      return work.categoryId == categoryId;
    });
    console.log(filteredWorks);
    gallery.innerHTML = "";

  display (filteredWorks);

  };

function display (works){
  gallery.innerHTML = "";
  works.forEach(work => {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  })
  }