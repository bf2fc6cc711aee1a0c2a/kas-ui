# Contributing

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
npm run mock
BASE_PATH=http://localhost:8000 npm run start:dev # start the UI
```

## User testing URL

To view the "mock" UI for user testing, add this query param: `/?user-testing` e.g. `https://prod.foo.redhat.com:1337/?user-testing`



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

## Integration

The individual UIs for Kafka Instances, Service Accounts, Data Plane, and Guides are exported as Federated Modules which are then imported into the Application Services UI, application-services-ui). This UI facilitates the integration between each of the individual UIs so that we can pass props and link between them. These individual UIs are then hosted as navigation items in [cloud.redhat.com](https://github.com/RedHatInsights).


## Code practices

The Control Plane UI uses best practices based off the official [React TypeScript Cheat sheet](https://react-typescript-cheatsheet.netlify.app/), with modifications for this project. The React TypeScript Cheat sheet is maintained and used by developers through out the world, and is a place where developers can bring together lessons learned using TypeScript and React.

### Imports

Since we are using TypeScript 4.x + for this project, default imports should conform to the new standard set forth in TypeScript 2.7:

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
```

For imports that are not the default import use the following syntax:

```typescript
import { X1, X2, ... Xn } from 'package-x';
```

#### View Props

For props we are using **type** instead of **interfaces**. The reason to use types instead of interfaces is for consistency between the views and because it's more constrained (See [Types or Interfaces](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/types_or_interfaces) for more clarification). By using types we are ensuring that both views will not deviate from the agreed upon [contract](https://dev.to/reyronald/typescript-types-or-interfaces-for-react-component-props-1408).

The following is an example of using a type for props:

```typescript
export type ExampleComponentProps = {
  message: string;
};
```

Since we are using typescript we no longer need to use prop-types as typescript provides the functionality we received with prop-types via types. To set the default value of the props you can do so in by specifying a value in the argument's for the function component. The following is an example on how to do that:

```typescript
type GreetProps = { age?: number };

const Greet: FunctionComponent<GreetingProps> = ({ age = 21 }: GreetProps) => // etc
```

#### State objects should be types

When maintaining state for a component that requires it's state to be defined by an object, it is recommended that you use a [type instead of an interface](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/types_or_interfaces). For example if you need to maintain the currentApiId and isExpanded in a single object you can do the following:

```typescript
type ApiDrawerState = {
  currentApiId: string;
  isExpanded: boolean;
};
```

#### Interfaces

Interfaces should be used for all public facing API definitions, as well as models. A table describing when to use interfaces vs. types can be found [here](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/types_or_interfaces).

```typescript
// The following is an example of memory information model

export interface MemoryInfoRepresentation {
  total: number;
  totalFormatted: string;
  used: number;
  usedFormatted: string;
  free: number;
  freePercentage: number;
  freeFormatted: string;
}
```

#### Function Components

This project uses function components and hooks over class components. When coding function components in typescript a developer should include any specific props from the **View.props.tsx**

```typescript
export const ExampleComponent: FunctionComponent<ExampleComponentProps> = ({
  message,
  children,
}: ExampleComponentProps) => (
  <>
    <div>{message}</div>
    <div>{children}</div>
  </>
);
```

For components that do not have any additional props an empty object should be used instead:

```typescript
export const ExampleNoPropsComponent: FunctionComponent<{}> = () => (
  <div>Example Component with no props</div>
);
```

Additional details around function components can be found [here](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/function_components).

#### Hooks

When using hooks with Typescript there are few recommendations that we follow below. Additional recommendations besides the ones mention in this document can be found [here](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks).

#### Inference vs Types for useState

Currently we recommend using inference for the primitive types booleans, numbers, and string when using useState. Anything other then these 3 types should use a declarative syntax to specify what is expected. For example the following is an example of how to use inference:

```typescript
const [isEnabled, setIsEnabled] = React.useState(false);
```

Here is an example how to use a declarative syntax. When using a declarative syntax if the value can be null that will also need to be specified:

```typescript
const [user, setUser] = useState<IUser | null>(null);

setUser(newUser);
```

#### useReducers

When using reducers make sure you specify the [return type and do not use inference](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks#usereducer).

```typescript
const initialState = { count: 0 };

type ACTIONTYPE =
  | { type: 'increment'; payload: number }
  | { type: 'decrement'; payload: string };

function reducer(state: typeof initialState, action: ACTIONTYPE) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + action.payload };
    case 'decrement':
      return { count: state.count - Number(action.payload) };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'decrement', payload: '5' })}>
        -
      </button>
      <button onClick={() => dispatch({ type: 'increment', payload: 5 })}>
        +
      </button>
    </>
  );
}
```

#### useEffect

For useEffect only [return the function or undefined](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks#useeffect).

```typescript
function DelayedEffect(props: { timerMs: number }) {
  const { timerMs } = props;
  // bad! setTimeout implicitly returns a number because the arrow function body isn't wrapped in curly braces
  useEffect(
    () =>
      setTimeout(() => {
        /* do stuff */
      }, timerMs),
    [timerMs]
  );
  return null;
}
```

#### useRef

When using useRef there are two options with Typescript. The first one is when creating a [read-only ref](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks#useref).

```typescript
const refExample = useRef<HTMLElement>(null!);
```

By passing in null! it will prevent Typescript from returning an error saying refExample maybe null.

The second option is for creating [mutable refs](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks#useref) that you will manage.

```typescript
const refExampleMutable = (useRef < HTMLElement) | (null > null);
```

#### Additional Typescript Pointers

Besides the details outlined above a list of recommendations for Typescript is maintained by several Typescript React developers [here](https://react-typescript-cheatsheet.netlify.app/). This is a great reference to use for any additional questions that are not outlined within the coding standards.

### Classnames and ID Naming Conventions

IDs and classes should follow:

`mk--[page or context]__component--element`

where:

- `mk` = Managed Kafka
- `page or context = the context that the component is part of
- `component` = name of the component
- `element` = element in the component

### Testing

More information about testing will be available here soon. We expect to follow Strimzi's [testing guidelines](https://github.com/strimzi/strimzi-ui/blob/master/docs/Test.md).

### Configurations

- [TypeScript Config](./tsconfig.json)
- [Webpack Config](./webpack.common.js)
- [Jest Config](./jest.config.js)
- [Editor Config](./.editorconfig)

### Raster Image Support

To use an image asset that's shipped with PatternFly core, you'll prefix the paths with "@assets". `@assets` is an alias for the PatternFly assets directory in node_modules.

For example:

```js
import imgSrc from '@assets/images/g_sizing.png';
<img src={imgSrc} alt='Some image' />;
```

You can use a similar technique to import assets from your local app, just prefix the paths with "@app". `@app` is an alias for the main src/app directory.

```js
import loader from '@app/assets/images/loader.gif';
<img src={loader} alt="Content loading />
```

### Vector Image Support

Inlining SVG in the app's markup is also possible.

```js
import logo from '@app/assets/images/logo.svg';
<span dangerouslySetInnerHTML={{ __html: logo }} />;
```

You can also use SVG when applying background images with CSS. To do this, your SVG's must live under a `bgimages` directory (this directory name is configurable in [webpack.common.js](./webpack.common.js#L5)). This is necessary because you may need to use SVG's in several other context (inline images, fonts, icons, etc.) and so we need to be able to differentiate between these usages so the appropriate loader is invoked.

```css
body {
  background: url(./assets/bgimages/img_avatar.svg);
}
```

### Code Quality Tools

- For accessibility compliance, we use [react-axe](https://github.com/dequelabs/react-axe)
- To keep our bundle size in check, we use [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- To keep our code formatting in check, we use [prettier](https://github.com/prettier/prettier)
- To keep our code logic and test coverage in check, we use [jest](https://github.com/facebook/jest)
- To ensure code styles remain consistent, we use [eslint](https://eslint.org/)
- To provide a place to showcase custom components, we integrate with [storybook](https://storybook.js.org/)

### Keycloak integration

In our dev environment we use keycloak to obtain the token to authenticate requests. The `KeycloakAuthProvider` is responsible for setting this up.

In stage and prod we use the insights chrome to do this. The `InsightsAuthProvider` (which lives in the `mk-ui-host` project) is responsible for setting this up.

1. To integrate with keycloak go to your keycloak instance and retrieve keycloak.json config
   file for public client. Make sure that client config supports redirect uris:

`localhost*` or `localhost:8080`

2. Put `keycloak.json` info dist folder.
   See`keycloak.example.json` for example content.

3. Run the application.

> NOTE: Keycloak.js package updates are disabled and should be done manually if needed.

#### Using Keycloak Profile in the application

```js
const { keycloak, profile } = useContext(AuthContext);
console.log(user.profile);
```

#### Using Keycloak Token for backend requests

```js
const { keycloak } = useContext(AuthContext);
const header = keycloak.getAuthHeader();
```
