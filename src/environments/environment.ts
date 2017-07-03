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
      workflowCheck: '/IUF/rest/entities.workflowcheck',
      rights: '/IUF/rest/entities.projectright',
      allUsers: '/IUF/rest/entities.user',
      oneUser: '/IUF/rest/entities.user/:id',
      activateUser: '/IUF/rest/entities.user/activate',
      allProjects: '/IUF/rest/entities.project',
      oneProject: '/IUF/rest/entities.project/:id',
      auth: '/IUF/rest/auth',
      allFiles: '/IUF/rest/entities.file',
      filesByProject: '/IUF/rest/entities.file/project/',
      allVersions: '/IUF/rest/entities.version',
      download: '/IUF/rest/download/'
    }
  }
};
