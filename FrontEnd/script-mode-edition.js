document.addEventListener('DOMContentLoaded', () => {
    // Vérifiez si le token est présent dans le localStorage
    const token = localStorage.getItem('authToken');
  
    if (token) {
      // Ajoutez la classe is-auth au body
      document.body.classList.add('is-auth');
      console.log('Mode édition activé : classe is-auth ajoutée au body');
    } else {
      console.log('Utilisateur non authentifié : aucune classe ajoutée');
    }
  });