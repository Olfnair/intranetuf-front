// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  backend: {
    protocol: 'https',
    host: 'localhost',
    port: '8443',
    endpoints: {
      auth: '/IUF/rest/auth',
      activate: '/IUF/rest/entities.user/activate',
      download: '/IUF/rest/download',
      file: '/IUF/rest/entities.file',
      log: '/IUF/rest/entities.log',
      project: '/IUF/rest/entities.project',
      projectRight: '/IUF/rest/entities.projectright',
      user: '/IUF/rest/entities.user',
      version: '/IUF/rest/entities.version',
      workflowCheck: '/IUF/rest/entities.workflowcheck'
    }
  }
};
