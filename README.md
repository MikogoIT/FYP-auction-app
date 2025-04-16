# FYP-auction-app


fyp auction app hello conflict

app deployed to dockerhub
https://hub.docker.com/r/boiledsteak/infinity-cleaner-app

start docker container with
```
docker-compose up
```
access the app
```
http://localhost:4433
```

## codebase structure

```
/app
├── backend
│   ├── server.js
│   ├── package.json
│   └── ...
├── frontend
│   ├── public
│   ├── src
│   ├── package.json
│   ├── dist (generated after build)
│   └── ...
├── Dockerfile
└── docker-compose.yml
```

## the app start up process:
- npm update
- npm install
- npm run build
(npm run start when ready)

### npm update:
```package.json```: Checks for updates to dependencies based on version ranges defined.

```package-lock.json```: Updates to reflect the exact versions of dependencies, ensuring consistency across environments.

```node_modules/```: Dependencies are updated or installed according to the version ranges and package-lock.json.

### npm install:
```package.json```: Identifies dependencies to install.

```package-lock.json```: Ensures that the exact versions from package-lock.json are installed (if it exists), providing consistency across all installations.

```node_modules/```: The actual dependencies are installed or updated to match the definitions in the package.json and package-lock.json.

### npm run build:
```frontend/src/``` and ```frontend/public/```: Source code (React components, assets, etc.) and static assets are processed by Vite.

```frontend/dist/```: The production-ready files are created, optimized for performance (minified JS, CSS, HTML) and placed in the dist/ folder. This folder is ready to be deployed.

### npm run start (When Ready):
```backend/server.js```: Starts the Express server, which serves the production build from frontend/dist/ and handles backend API routes.

