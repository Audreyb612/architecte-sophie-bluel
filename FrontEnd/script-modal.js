// -----------------------------
// MODALE (open/close + gallery + delete + add)
// -----------------------------

window.__modalInitialized = window.__modalInitialized || false;

// API
const API_WORKS_URL = "http://localhost:5678/api/works";
const API_CATEGORIES_URL = "http://localhost:5678/api/categories";

function getTokenValue() {
  return localStorage.getItem("authToken") || localStorage.getItem("token");
}

// ✅ POST unique (FormData venant du form)
async function createWorkFormData(fd) {
  const tokenValue = getTokenValue();
  if (!tokenValue) throw new Error("Token manquant : reconnecte-toi.");

  const res = await fetch(API_WORKS_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${tokenValue}`,
    },
    body: fd,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`POST /works ${res.status} ${txt}`);
  }

  return res.json();
}

// ---------- Injection modal.html ----------
async function loadModalOnce() {
  if (document.getElementById("modal")) return;

  const root = document.getElementById("modal-root");
  if (!root) {
    console.warn("[modal] #modal-root introuvable");
    return;
  }

  const modalUrl = new URL("modal.html", window.location.href);

  try {
    const res = await fetch(modalUrl);
    if (!res.ok) {
      console.error("[modal] Impossible de charger :", modalUrl.toString(), res.status);
      return;
    }

    root.innerHTML = await res.text();
    console.log("[modal] injectée ?", !!document.getElementById("modal"));
  } catch (err) {
    console.error("[modal] erreur fetch :", err);
  }
}

// ---------- Rendu miniatures ----------
function renderWorksInModal(list) {
  const container = document.getElementById("modalGallery");
  if (!container) return;

  container.innerHTML = "";

  list.forEach((work) => {
    const figure = document.createElement("figure");
    figure.className = "modal__thumb";
    figure.dataset.id = work.id;

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title || "";

    const trash = document.createElement("button");
    trash.className = "modal__trash";
    trash.type = "button";
    trash.dataset.id = work.id;
    trash.setAttribute("aria-label", `Supprimer ${work.title || "ce projet"}`);
    trash.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

    figure.appendChild(img);
    figure.appendChild(trash);
    container.appendChild(figure);
  });
}

// ---------- API helpers ----------
async function fetchWorks() {
  const res = await fetch(API_WORKS_URL);
  if (!res.ok) throw new Error("Impossible de récupérer les works");
  return res.json();
}

async function deleteWork(workId) {
  const tokenValue = getTokenValue();
  const headers = { accept: "*/*" };

  if (tokenValue) headers.Authorization = `Bearer ${tokenValue}`;

  const res = await fetch(`${API_WORKS_URL}/${workId}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`DELETE /works ${res.status} ${txt}`);
  }
}

async function refreshWorksAndNotify() {
  const data = await fetchWorks();
  window.works = data;

  window.dispatchEvent(new CustomEvent("worksUpdated", { detail: data }));
  window.dispatchEvent(new CustomEvent("worksLoaded", { detail: data }));

  return data;
}

// ---------- Categories ----------
async function ensureCategoriesLoaded() {
  if (Array.isArray(window.categories) && window.categories.length > 0) {
    return window.categories;
  }

  const res = await fetch(API_CATEGORIES_URL);
  if (!res.ok) throw new Error("Impossible de récupérer les catégories");

  const cats = await res.json();
  window.categories = cats;
  return cats;
}

function fillCategorySelect(categories) {
  const select = document.getElementById("photoCategory");
  if (!select) return;

  select.innerHTML = `<option value="">—</option>`;
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });
}

// ---------- Init behaviors ----------
function initModal() {
  if (window.__modalInitialized) return;
  window.__modalInitialized = true;

  const modal = document.getElementById("modal");
  if (!modal) return;

  const overlay = modal.querySelector(".modal__overlay");
  const closeBtn = modal.querySelector(".modal__close");
  const backBtn = modal.querySelector(".modal__back");

  const viewGallery = modal.querySelector('[data-view="gallery"]');
  const viewAdd = modal.querySelector('[data-view="add"]');
  const openAddBtn = modal.querySelector("#openAddPhoto");

  const addForm = modal.querySelector("#addPhotoForm");

  function showGalleryView() {
    if (viewGallery) viewGallery.hidden = false;
    if (viewAdd) viewAdd.hidden = true;
    if (backBtn) backBtn.hidden = true;
  }

  async function showAddView() {
    if (viewGallery) viewGallery.hidden = true;
    if (viewAdd) viewAdd.hidden = false;
    if (backBtn) backBtn.hidden = false;
  
    const cats = await ensureCategoriesLoaded();
    fillCategorySelect(cats);
  
    console.log("Categories loaded:", cats.length);
    console.log("Select options:", modal.querySelectorAll("#photoCategory option").length);
  }

  async function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    showGalleryView();

    if (Array.isArray(window.works) && window.works.length > 0) {
      renderWorksInModal(window.works);
      return;
    }

    const data = await fetchWorks();
    window.works = data;
    renderWorksInModal(data);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    showGalleryView();
  }

  window.addEventListener("worksLoaded", (e) => {
    if (modal.classList.contains("is-open")) renderWorksInModal(e.detail);
  });

  document.addEventListener("click", (e) => {
    const editLink = e.target.closest(".edit-link");
    if (!editLink) return;
    e.preventDefault();
    openModal();
  });

  closeBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click", closeModal);

  openAddBtn?.addEventListener("click", showAddView);
  backBtn?.addEventListener("click", showGalleryView);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // Suppression
  modal.addEventListener("click", async (e) => {
    const btn = e.target.closest(".modal__trash");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    if (!Number.isFinite(id)) return;

    if (!confirm("Supprimer définitivement ce projet ?")) return;

    await deleteWork(id);
    await refreshWorksAndNotify();
    showGalleryView();
    renderWorksInModal(window.works || []);
  });

  // Ajout (POST)
  
  addForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("addForm?", addForm);
    console.log("fileInput:", modal.querySelector("#photoFile")?.files?.[0]);
    console.log("titleInput:", modal.querySelector("#photoTitle")?.value);
    console.log("categorySelect:", modal.querySelector("#photoCategory")?.value);
    
    const fd = new FormData(addForm);
    const title = (fd.get("title") || "").toString().trim();
const category = Number(fd.get("category"));
const file = fd.get("image");

if (!file || !(file instanceof File) || file.size === 0) return alert("Image manquante");
if (!title) return alert("Titre manquant");
if (!Number.isFinite(category) || category <= 0) return alert("Catégorie manquante");

    // Debug : tu dois voir image + title + category
    for (const [k, v] of fd.entries()) {
      console.log("FD", k, v instanceof File ? v.name : v);
    }

    await createWorkFormData(fd);
    await refreshWorksAndNotify();

    addForm.reset();
    showGalleryView();
    renderWorksInModal(window.works || []);
  });
}

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", async () => {
  await loadModalOnce();
  initModal();
});
