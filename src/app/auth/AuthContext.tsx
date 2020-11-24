import React from 'react';

export interface IAuthContext {
  token: string | undefined;
}

export const AuthContext = React.createContext<IAuthContext>({
  token: undefined
});
