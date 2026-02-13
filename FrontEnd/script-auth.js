document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  
  if (!loginForm) {
	console.error("Formulaire de connexion introuvable !");
	return;
  }

  loginForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;

	if (!email || !password) {
	  const errorElement = document.getElementById('loginError');
	  errorElement.textContent = "Veuillez remplir tous les champs.";
	  return;
	}

	try {
	  // Envoyer une requête POST au backend
	  const response = await fetch('http://localhost:5678/api/users/login', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email, password }),
	  });

	  if (response.ok) {
		// Si la réponse est correcte
		const data = await response.json(); // Récupérer les données de la réponse
		const token = data.token; // Extraire le token
		console.log('Connexion réussie : OK', data);

		// Stocker le token dans le localStorage
		localStorage.setItem('authToken', token);

		// Rediriger vers la page d'accueil en mode édition
		window.location.href = 'index.html?mode=edit';
	  } else {
		// Si les données sont incorrectes
		const errorElement = document.getElementById('loginError');
		errorElement.textContent = "Email ou mot de passe incorrect.";

	  }
	} catch (error) {
	  console.error("Erreur lors de la connexion :", error);
	  const errorElement = document.getElementById('loginError');
	  errorElement.textContent = "Une erreur est survenue. Veuillez réessayer.";
	}
  });
});