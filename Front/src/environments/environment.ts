export const environment = {
  production: true,
  // API déployée sur Render (service pollution-api)
  apiUrl: 'https://pollution-api-cplq.onrender.com/api',
  // Parties de l'API simulées dans le navigateur (true) ou appelées sur apiUrl (false)
  mockApi: {
    pollutions: false, // fournie par la vraie API depuis l'exercice 3
    auth: true, // l'inscription n'existe pas encore côté API
  },
};
