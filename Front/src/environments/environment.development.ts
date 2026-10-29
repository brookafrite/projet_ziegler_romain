export const environment = {
  production: false,
  // API Node.js lancée en local (dossier api/, npm run dev)
  apiUrl: 'http://localhost:3000/api',
  // Parties de l'API simulées dans le navigateur (true) ou appelées sur apiUrl (false)
  mockApi: {
    pollutions: false, // fournie par la vraie API depuis l'exercice 3
    auth: true, // l'inscription n'existe pas encore côté API
  },
};
