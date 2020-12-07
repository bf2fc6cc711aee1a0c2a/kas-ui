import React from 'react';

export interface IApiContext {
  basePath: string | undefined;
}

export const ApiContext = React.createContext<IApiContext>({
  basePath: undefined
});
