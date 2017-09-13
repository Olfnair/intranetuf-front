export const environment = {
  production: true,
  backend: {
    protocol: 'https',
    host: 'test.advensys.fr',
    port: '8443',
    endpoints: {
      auth: '/IUF/rest/auth',
      activate: '/IUF/rest/entities.user/activate',
      download: '/IUF/rest/download/',
      file: '/IUF/rest/entities.file',
      project: '/IUF/rest/entities.project',
      projectRight: '/IUF/rest/entities.projectright',
      user: '/IUF/rest/entities.user',
      version: '/IUF/rest/entities.version',
      workflowCheck: '/IUF/rest/entities.workflowcheck'
    }
  }
};