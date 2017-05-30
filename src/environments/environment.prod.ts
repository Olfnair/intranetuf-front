export const environment = {
  production: true,
  backend: {
    protocol: 'https',
    host: 'localhost',
    port: '8443',
    endpoints: {
      allUsers: '/IUF/rest/entities.user',
      oneUser: '/IUF/rest/entities.user/:id'
    }
  }
};