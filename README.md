# Control Plane UI

Welcome to the repository for the Control Plane UI. The lead developer is [Christie Molloy](https://github.com/christiemolloy) and lead designer is [Jenn Giardino](https://github.com/jgiardino), please feel free to contact us!

## Contributing

If you are contributing please check out the [Contributing Guidelines.](https://github.com/bf2fc6cc711aee1a0c2a/mk-ui-frontend/blob/master/CONTRIBUTING.md)


## Quick-start

```bash
sudo echo "127.0.0.1 prod.foo.redhat.com" >> /etc/hosts
git clone https://github.com/bf2fc6cc711aee1a0c2a/mk-ui-frontend.git 
cd mk-ui-frontend
npm install && npm run start:dev
```

The dev server runs using self-signed certificates, so you'll need to accept / install them into your system in order to load the UI. In Chrome you can simply accept the warnings and it will allow you in.

## Development Scripts
```sh
# Install development/build dependencies
npm install

# Start the development server
npm run start:dev

# Run a production build (outputs to "dist" dir)
npm run build

# Run the test suite
npm run test

# Run the linter
npm run lint

# Run the code formatter
npm run format

# Launch a tool to inspect the bundle size
npm run bundle-profile:analyze

# Start the express server (run a production build first)
npm run start
```

## Starting the Mock Server

```
cd mas-mock
yarn
yarn start # API running at http://localhost:9000

```

## Generating OpenAPI docs

```
npm run api:generate
```
