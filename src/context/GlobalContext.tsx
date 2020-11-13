import React, { createContext } from "react";

export interface ToolbarStatus {
//   areAllSelected: boolean;
//   selectedItems: any[];
//   isChecked?: boolean;
}

export interface GlobalState {
  // example: apis: Api[];
}

/**
 * List of views for the dashboard.
 */
export enum DashboardViews {
  list = "list",
  card = "card"
}

const initialState: GlobalState = {
//   apiDrawerExpanded: false,
//   apis: [],
//   collaborators: [],
//   currentFilterCategory: "Name",
//   dashboardView: DashboardViews.list,
//   inputValue: '',
//   lastCreatedApi: "",
//   notificationDrawerExpanded: false,
//   recentActivity: [],
//   selectedApiId: "",
//   toolbarStatus: {
//     areAllSelected: false,
//     isChecked: false,
//     selectedItems: []
//   }
};

export interface GlobalContextObj {
//   setApiDrawerExpanded: (isExpanded: boolean) => void;
//   setCurrentFilterCategory: (currentFilterCategory: string) => void;
//   setSelectedApiId: (selectedApiId: string) => void;
//   store: GlobalState;
//   setDashboardView: (view: DashboardViews) => void;
//   setInputValue: (inputValue: string) => void;
//   setNotificationDrawerExpanded: (isExpanded: boolean) => void;
//   setLastCreatedApi: (lastCreatedApi: string) => void;
//   updateApis: (apis: Api[]) => void;
//   updateCollaborators: (collaborators: ApiCollaborator[]) => void;
//   updateRecentActivity: (recentActivity: ApiDesignChange[]) => void;
//   updateToolbarStatus: (toolbarStatus: ToolbarStatus) => void;
}

export const GlobalContext = createContext({} as GlobalContextObj);

export class GlobalContextProvider extends React.Component<{}, GlobalState> {
  state: GlobalState = initialState;

  render() {
    return (
      <GlobalContext.Provider
        value={{
          setApiDrawerExpanded: this.setApiDrawerExpanded,
          setCurrentFilterCategory: this.setCurrentFilterCategory,
          setDashboardView: this.setDashboardView,
          setInputValue: this.setInputValue,
          setLastCreatedApi: this.setLastCreatedApi,
          setNotificationDrawerExpanded: this.setNotificationDrawerExpanded,
          setSelectedApiId: this.setSelectedApiId,
          store: this.state,
          updateApis: this.updateApis,
          updateCollaborators: this.updateCollaborators,
          updateRecentActivity: this.updateRecentActivity,
          updateToolbarStatus: this.updateToolbarStatus
        }}
      >
        {this.props.children}
      </GlobalContext.Provider>
    );
  }

  private setApiDrawerExpanded = (apiDrawerExpanded: boolean) => {
    this.setState({ apiDrawerExpanded });
  };

  private setSelectedApiId = (selectedApiId: string) => {
    this.setState({ selectedApiId });
  };

  private setLastCreatedApi = (lastCreatedApi: string) => {
    this.setState({ lastCreatedApi });
  }
  private setCurrentFilterCategory = (currentFilterCategory: string) => {
    this.setState({ currentFilterCategory });
  };

  private setDashboardView = (dashboardView: DashboardViews) => {
    this.setState({ dashboardView });
  };

  private setInputValue = (inputValue: string) => {
    this.setState({ inputValue });
  };

  private setNotificationDrawerExpanded = (
    notificationDrawerExpanded: boolean
  ) => {
    this.setState({ notificationDrawerExpanded });
  };

  private updateApis = (apis: Api[]) => {
    this.setState({ apis });
  };
  
  private updateRecentActivity = (recentActivity: ApiDesignChange[]) => {
    this.setState({ recentActivity });
  };

  private updateCollaborators = (collaborators: ApiCollaborator[]) => {
    this.setState({ collaborators });
  };

  private updateToolbarStatus = (toolbarStatus: ToolbarStatus) => {
    this.setState({ toolbarStatus });
  };
}
