document.addEventListener("DOMContentLoaded", () => {
  const authLink = document.getElementById("authLink");
  const token = localStorage.getItem("authToken");

  if (token) {
    document.body.classList.add("is-auth");

    if (authLink) {
      authLink.textContent = "logout";
      authLink.href = "#";

      authLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("authToken");
        document.body.classList.remove("is-auth");
        window.location.href = "index.html";
      });
    }
  } else {
    document.body.classList.remove("is-auth");

    if (authLink) {
      authLink.textContent = "login";
      authLink.href = "login.html";
    }
  }
});