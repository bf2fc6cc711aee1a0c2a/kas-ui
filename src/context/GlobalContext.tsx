import React, { createContext } from "react";

export interface GlobalState {
  mainToggle: boolean;
}

const initialState: GlobalState = {
  mainToggle: false
};

export interface GlobalContextObj {
  store: GlobalState;
  setMainToggle: (mainToggle: boolean) => void;
}

export const GlobalContext = createContext({} as GlobalContextObj);

export class GlobalContextProvider extends React.Component<unknown, GlobalState> {
  state: GlobalState = initialState;

  render() {
    return (
      <GlobalContext.Provider
        value={{
          setMainToggle: this.setMainToggle,
          store: this.state
        }}
      >
        {this.props.children}
      </GlobalContext.Provider>
    );
  }

  private setMainToggle = (mainToggle: boolean) => {
    this.setState({ mainToggle });
  };
}
