
let works = [];

const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");
console.log(filters)

fetch("http://localhost:5678/api/works")
  .then(response => response.json())
  .then(data => {
    works = data;
    console.log("Works en mémoire :", works);
    gallery.innerHTML = "";
    
    data.forEach(work => {
        const figure = document.createElement("figure");
      
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
      
        const figcaption = document.createElement("figcaption");
        figcaption.textContent = work.title;
      
        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
      });

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
            filters.appendChild(button);
          });
      })

      .catch(error => {
        console.error("Erreur catégories :", error);
      });

    console.log("Données reçues :", data);
  })
  .catch(error => {
    console.error("Erreur :", error);
  });
