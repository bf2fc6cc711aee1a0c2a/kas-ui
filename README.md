# KAS-UI

Welcome to the repository that hosts the UIs for Control Plane, Service Accounts, Service Registry, and Metrics.

The lead developer is [Ajay Pratap](https://github.com/ajaypratap003) and the lead designer is [Jenn Giardino](https://github.com/jgiardino), please feel free to contact us!


## Contributing

If you are contributing please check out the [Contributing Guidelines.](https://github.com/bf2fc6cc711aee1a0c2a/kas-ui/blob/master/CONTRIBUTING.md)


## Integration

The individual UIs for Kafka Instances, Service Accounts, Data Plane, and Guides are exported as Federated Modules which are then imported into the Application Services UI, hosted here on [Gitlab](https://gitlab.cee.redhat.com/mk-ci-cd/application-services-ui). This UI facilitates the integration between each of the individual UIs so that we can pass props and link between them. These individual UIs are then hosted as navigation items in [cloud.redhat.com](https://github.com/RedHatInsights).


## CI/CD

The Managed Kafka CI/CD Guide is [documented here](https://docs.google.com/document/d/1IHVHjg59zrjY0t4LwyNk5auUw0dWhzD3f59ytB5Ik14/edit#heading=h.5xpj1a9a3mxn) and updated frequently.


## Quick-start

```bash
sudo echo "127.0.0.1 prod.foo.redhat.com" >> /etc/hosts
git clone https://github.com/bf2fc6cc711aee1a0c2a/kas-ui.git
cd kas-ui
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

# Parse src folder for internationalized strings
# This will go through and make JSON files for internationalized strings in src/locales and add default values (i.e. the key name or string). You may need to manually edit the default values.
# Japanese files will need to be updated manually if you want non-English test data to work with.
npm run i18n
```

## Internationalization
This project uses [react-i18next](https://react.i18next.com/) for internationalization. Check out the existing examples in the code or the documentation for more information on how to use it.

You should run `npm run i18n` after you internationalize strings in order to generate the required files.

Namespaces other than 'public' must be added to `src/i18n.ts` on line 37.

If you want to add an additional language, you need to import the dayjs locale in `src/i18n.ts` on line 9 and (if you want it managed by the parser) line 51 in `i18next-parser.config.js`.

## Query parameters
```
# Turn on pseudolocalization
# This will let you check components to make sure they can accomodate longer text and ensure that all text is internationalized.
http://localhost:9000/?pseudolocalization=true&lng=en

# Change language to Japanese (if you don't want to change your browser language)
http://localhost:9000/?lng=ja
```


## API

By default the UI will run against the staging api (api.stage.openshift.com) in development. To change the API server set the environment variable `BASE_PATH`.

For example, to run the UI locally against the mock API run:

```
BASE_PATH=http://localhost:8000 npm run start:dev
```

### The Mock Server

We also provide a mock server which can be useful for developing locally if you don't have access to a real API. 

To start the mock server

```
cd mas-mock
npm install
npm run start # API running at http://localhost:8000
BASE_PATH=http://localhost:8000 npm run start:dev # start the UI
```

## Generating OpenAPI docs

```
npm run api:generate
```

## User testing URL

To view the "mock" UI for user testing, add this query param: `/?user-testing` e.g. `https://prod.foo.redhat.com:1337/?user-testing` 
