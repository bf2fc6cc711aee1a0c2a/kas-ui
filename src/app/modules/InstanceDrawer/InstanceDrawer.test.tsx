import { render, waitFor } from "@testing-library/react";
import { Drawer, DrawerContent } from "@patternfly/react-core";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import {
  ModalContext,
  BasenameContext,
  Config,
  ConfigContext,
  AuthContext,
  Auth,
} from "@rhoas/app-services-ui-shared";
import { KasModalLoader } from "@app/modals";
import {
  InstanceDrawerContextProps,
  InstanceDrawerContextProvider,
} from "@app/modules/InstanceDrawer/contexts/InstanceDrawerContext";
import { InstanceDrawerTab } from "@app/modules/InstanceDrawer/tabs";

const actualSDK = jest.requireActual("@rhoas/kafka-management-sdk");

import { InstanceDrawer } from "./InstanceDrawer";

jest.mock("@rhoas/kafka-management-sdk", () => {
  // Works and lets you check for constructor calls:
  return {
    ...actualSDK,
    DefaultApi: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

jest.mock("react-i18next", () => {
  const reactI18next = jest.requireActual("react-i18next");
  return {
    ...reactI18next,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { changeLanguage: jest.fn() },
    }),
  };
});

const instanceDetail: NonNullable<
  Required<InstanceDrawerContextProps["drawerInstance"]>
> = {
  name: "test instance",
  id: "test_id",
  created_at: "2020-12-10T16:26:53.357492Z",
  updated_at: "2020-12-10T16:26:56.757669Z",
  owner: "test_owner",
  bootstrap_server_host:
    "kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org",
  multi_az: true,
  reauthentication_enabled: false,
  status: "aaa",
  cloud_provider: "aws",
  region: "EU",
  size: {
    id: "id",
    display_name: "id",
    ingress_throughput_per_sec: { bytes: 123 },
    egress_throughput_per_sec: { bytes: 123 },
    total_max_connections: 123,
    max_data_retention_size: { bytes: 123 },
    max_partitions: 123,
    max_data_retention_period: "aaa",
    max_connection_attempts_per_sec: 123,
    max_message_size: { bytes: 123 },
    min_in_sync_replicas: 123,
    replication_factor: 123,
    supported_az_modes: ["single"],
    lifespan_seconds: 123,
    quota_consumed: 123,
    quota_type: "quota type",
    capacity_consumed: 123,
    maturity_status: "stable",
  },
} as NonNullable<Required<InstanceDrawerContextProps["drawerInstance"]>>;

const authValue = {
  kas: {
    getToken: () => Promise.resolve("test-token"),
  },
  getUsername: () => Promise.resolve("api_kafka_service"),
  isOrgAdmin: () => Promise.resolve(true),
} as Auth;

const setup = (
  onExpand: () => void,
  _isExpanded: boolean,
  _mainToggle: boolean,
  _onClose: () => void,
  activeTab: InstanceDrawerTab,
  instance?: InstanceDrawerContextProps["drawerInstance"]
) => {
  return render(
    <MemoryRouter>
      <BasenameContext.Provider value={{ getBasename: () => "" }}>
        <ModalContext.Provider
          value={{
            registerModals: () => "",
            showModal: () => "",
            hideModal: () => "",
          }}
        >
          <AuthContext.Provider value={authValue}>
            <ConfigContext.Provider
              value={
                {
                  kas: {
                    apiBasePath: "",
                  },
                } as Config
              }
            >
              <Drawer isExpanded={true} onExpand={onExpand}>
                <DrawerContent
                  panelContent={
                    <InstanceDrawerContextProvider
                      isDrawerOpen={false}
                      drawerInstance={instance}
                      setDrawerInstance={() => false}
                      drawerActiveTab={activeTab}
                      setDrawerActiveTab={() => false}
                      openDrawer={() => false}
                      closeDrawer={() => false}
                      tokenEndPointUrl={""}
                    >
                      <InstanceDrawer
                        data-ouia-app-id="controlPlane-streams"
                        data-testId="mk--instance__drawer"
                        tokenEndPointUrl={
                          "kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org:443"
                        }
                        isDrawerOpen={false}
                        drawerInstance={instance}
                        setDrawerInstance={() => false}
                        drawerActiveTab={activeTab}
                        setDrawerActiveTab={() => false}
                        openDrawer={() => false}
                        closeDrawer={() => false}
                      />
                    </InstanceDrawerContextProvider>
                  }
                />
              </Drawer>
              <KasModalLoader />
            </ConfigContext.Provider>
          </AuthContext.Provider>
        </ModalContext.Provider>
      </BasenameContext.Provider>
    </MemoryRouter>
  );
};
describe("Instance Drawer", () => {
  xit("should render drawer", async () => {
    const { getByTestId } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTab.DETAILS
    );
    await waitFor(() =>
      expect(getByTestId("mk--instance__drawer")).toBeInTheDocument()
    );
  });

  xit("should render loading if no instance is available", () => {
    const { getByTestId, getByRole } = render(
      <MemoryRouter>
        <Drawer isExpanded={true} onExpand={jest.fn()}>
          <DrawerContent
            panelContent={
              <InstanceDrawerContextProvider
                isDrawerOpen={false}
                drawerInstance={undefined}
                setDrawerInstance={() => false}
                drawerActiveTab={undefined}
                setDrawerActiveTab={() => false}
                openDrawer={() => false}
                closeDrawer={() => false}
                tokenEndPointUrl={""}
              >
                <InstanceDrawer
                  data-ouia-app-id="controlPlane-streams"
                  data-testId="mk--instance__drawer"
                  tokenEndPointUrl={
                    "kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org:443"
                  }
                  isDrawerOpen={false}
                  drawerInstance={undefined}
                  setDrawerInstance={() => false}
                  drawerActiveTab={undefined}
                  setDrawerActiveTab={() => false}
                  openDrawer={() => false}
                  closeDrawer={() => false}
                />
              </InstanceDrawerContextProvider>
            }
          />
        </Drawer>
      </MemoryRouter>
    );
    expect(getByTestId("mk--instance__drawer")).toBeInTheDocument();
    expect(getByRole("progressbar")).toBeInTheDocument();
  });

  xit("should render instance name card", () => {
    const { getByTestId, getByText } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTab.DETAILS
    );

    expect(getByTestId("mk--instance__drawer")).toBeInTheDocument();
    expect(getByText("instance_name")).toBeInTheDocument();
    expect(getByText("test instance")).toBeInTheDocument();
  });

  xit("should render instance detail as active tab", () => {
    const { getByRole } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTab.DETAILS
    );

    const detailsButton = getByRole("button", { name: /Details/i });
    expect(detailsButton).toBeInTheDocument();
    const detailTabClasses =
      detailsButton?.parentElement?.className?.split(" ");
    expect(getByRole("button", { name: /Connection/i })).toBeInTheDocument();
    const connectionButton = getByRole("button", { name: /Connection/i });
    expect(connectionButton).toBeInTheDocument();
    const connectionTabClasses =
      connectionButton?.parentElement?.className?.split(" ");
    expect(detailTabClasses).toContain("pf-m-current");
    expect(connectionTabClasses?.length).toBeLessThan(2);
  });

  xit("should render instance connection as active tab", () => {
    const { getByRole } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTab.CONNECTION
    );

    const detailsButton = getByRole("button", { name: /Details/i });
    expect(detailsButton).toBeInTheDocument();
    const detailTabClasses =
      detailsButton?.parentElement?.className?.split(" ");
    const connectionButton = getByRole("button", { name: /Connection/i });
    expect(connectionButton).toBeInTheDocument();
    const connectionTabClasses =
      connectionButton?.parentElement?.className?.split(" ");
    expect(connectionTabClasses).toContain("pf-m-current");
    expect(detailTabClasses?.length).toBeLessThan(2);
  });

  xit("should handle toggle of tab from connection to detail", () => {
    const { getByRole } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTab.CONNECTION
    );

    const detailsButton = getByRole("button", { name: /Details/i });
    expect(detailsButton).toBeInTheDocument();

    userEvent.click(detailsButton);

    const connectionButton = getByRole("button", { name: /Connection/i });
    expect(connectionButton).toBeInTheDocument();

    const connectionTabClasses =
      connectionButton?.parentElement?.className?.split(" ");
    const detailTabClasses =
      detailsButton?.parentElement?.className?.split(" ");
    expect(detailTabClasses).toContain("pf-m-current");
    expect(connectionTabClasses?.length).toBeLessThan(2);
  });
});

describe("Drawer Details Tab", () => {
  xit("should render details in toggle off", () => {
    const { getByText } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTab.DETAILS
    );

    expect(getByText("cloud_provider")).toBeInTheDocument();
    //expect(getByText('region')).toBeInTheDocument();
    expect(getByText("id")).toBeInTheDocument();
    expect(getByText("owner")).toBeInTheDocument();
    expect(getByText("created")).toBeInTheDocument();
    expect(getByText("updated")).toBeInTheDocument();
    expect(getByText("amazon_web_services")).toBeInTheDocument();
    //expect(getByText('us_east_north_virginia')).toBeInTheDocument();
    expect(getByText("test_id")).toBeInTheDocument();
    expect(getByText("test instance")).toBeInTheDocument();
  });
});

describe("Drawer Connection Tab", () => {
  xit("should render connection tab in toggle off", () => {
    const { getByText } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTab.CONNECTION
    );
    expect(
      getByText("drawer_resource_tab_body_description_1")
    ).toBeInTheDocument();
    expect(getByText("bootstrap_server")).toBeInTheDocument();
  });

  xit("should render server responded bootstrap server host", () => {
    const instance = { ...instanceDetail };
    instance.bootstrap_server_host =
      "kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org:443";

    const { getByRole } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTab.CONNECTION
    );

    const clipboardInput = getByRole("textbox", {
      name: /Copyable/i,
    }) as HTMLInputElement;
    expect(clipboardInput.value).toEqual(instance.bootstrap_server_host);
  });

  xit("should render bootstrap server host with default port", () => {
    const instance = { ...instanceDetail };
    instance.bootstrap_server_host =
      "kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org:443";

    const { getByRole } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTab.CONNECTION,
      instance
    );
    const clipboardInput = getByRole("textbox", {
      name: /Copyable/i,
    }) as HTMLInputElement;
    expect(clipboardInput.value).toEqual(
      instanceDetail.bootstrap_server_host + ":443"
    );
  });
});
