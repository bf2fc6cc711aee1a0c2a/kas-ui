import React from 'react';

import { render, waitFor } from '@testing-library/react';

import { InstanceDrawer } from './InstanceDrawer';
import { Drawer, DrawerContent } from '@patternfly/react-core';
import userEvent from '@testing-library/user-event';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';
import { MemoryRouter } from 'react-router-dom';
import { InstanceDrawerTabs } from '@app/modules/InstanceDrawer/InstanceDrawerContent';
import { ModalProvider } from '@rhoas/app-services-ui-components';
import { KasModalLoader } from '@app/modals';

jest.mock('@rhoas/kafka-management-sdk', () => {
  // Works and lets you check for constructor calls:
  return {
    DefaultApi: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

jest.mock('react-i18next', () => {
  const reactI18next = jest.requireActual('react-i18next');
  return {
    ...reactI18next,
    useTranslation: () => ({
      t: (key) => key,
      i18n: { changeLanguage: jest.fn() },
    }),
  };
});

const instanceDetail: KafkaRequest = {
  name: 'test instance',
  id: 'test_id',
  created_at: '2020-12-10T16:26:53.357492Z',
  updated_at: '2020-12-10T16:26:56.757669Z',
  owner: 'test_owner',
  bootstrap_server_host:
    'kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org',
};

const setup = (
  onExpand: () => void,
  isExpanded: boolean,
  mainToggle: boolean,
  onClose: () => void,
  activeTab: InstanceDrawerTabs,
  instance?: KafkaRequest
) => {
  return render(
    <MemoryRouter>
      <ModalProvider>
        <Drawer isExpanded={true} onExpand={onExpand}>
          <DrawerContent
            panelContent={
              <InstanceDrawer
                isExpanded={isExpanded}
                onClose={onClose}
                initialTab={activeTab}
                instanceDetail={instance || instanceDetail}
                isLoading={instanceDetail === undefined}
                data-ouia-app-id='controlPlane-streams'
                data-testId='mk--instance__drawer'
                tokenEndPointUrl={
                  'kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org:443'
                }
                notRequiredDrawerContentBackground={true}
              >
                <></>
              </InstanceDrawer>
            }
          />
        </Drawer>
        <KasModalLoader />
      </ModalProvider>
    </MemoryRouter>
  );
};
describe('Instance Drawer', () => {
  it('should render drawer', async () => {
    const { getByTestId } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTabs.DETAILS
    );
    await waitFor(() =>
      expect(getByTestId('mk--instance__drawer')).toBeInTheDocument()
    );
  });

  it('should render loading if no instance is available', () => {
    const instanceDetail = undefined;
    const { getByTestId, getByRole } = render(
      <MemoryRouter>
        <Drawer isExpanded={true} onExpand={jest.fn()}>
          <DrawerContent
            panelContent={
              <InstanceDrawer
                tokenEndPointUrl={
                  'kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org:443'
                }
                isExpanded={true}
                isLoading={instanceDetail === undefined}
                onClose={jest.fn()}
                initialTab={InstanceDrawerTabs.DETAILS}
              >
                <></>
              </InstanceDrawer>
            }
          />
        </Drawer>
      </MemoryRouter>
    );
    expect(getByTestId('mk--instance__drawer')).toBeInTheDocument();
    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render instance name card', () => {
    const { getByTestId, getByText } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTabs.DETAILS
    );

    expect(getByTestId('mk--instance__drawer')).toBeInTheDocument();
    expect(getByText('instance_name')).toBeInTheDocument();
    expect(getByText('test instance')).toBeInTheDocument();
  });

  it('should render instance detail as active tab', () => {
    const { getByRole } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTabs.DETAILS
    );

    const detailsButton = getByRole('button', { name: /Details/i });
    expect(detailsButton).toBeInTheDocument();
    const detailTabClasses =
      detailsButton?.parentElement?.className?.split(' ');
    expect(getByRole('button', { name: /Connection/i })).toBeInTheDocument();
    const connectionButton = getByRole('button', { name: /Connection/i });
    expect(connectionButton).toBeInTheDocument();
    const connectionTabClasses =
      connectionButton?.parentElement?.className?.split(' ');
    expect(detailTabClasses).toContain('pf-m-current');
    expect(connectionTabClasses?.length).toBeLessThan(2);
  });

  it('should render instance connection as active tab', () => {
    const { getByRole } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTabs.CONNECTION
    );

    const detailsButton = getByRole('button', { name: /Details/i });
    expect(detailsButton).toBeInTheDocument();
    const detailTabClasses =
      detailsButton?.parentElement?.className?.split(' ');
    const connectionButton = getByRole('button', { name: /Connection/i });
    expect(connectionButton).toBeInTheDocument();
    const connectionTabClasses =
      connectionButton?.parentElement?.className?.split(' ');
    expect(connectionTabClasses).toContain('pf-m-current');
    expect(detailTabClasses?.length).toBeLessThan(2);
  });

  it('should handle toggle of tab from connection to detail', () => {
    const { getByRole } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTabs.CONNECTION
    );

    const detailsButton = getByRole('button', { name: /Details/i });
    expect(detailsButton).toBeInTheDocument();

    userEvent.click(detailsButton);

    const connectionButton = getByRole('button', { name: /Connection/i });
    expect(connectionButton).toBeInTheDocument();

    const connectionTabClasses =
      connectionButton?.parentElement?.className?.split(' ');
    const detailTabClasses =
      detailsButton?.parentElement?.className?.split(' ');
    expect(detailTabClasses).toContain('pf-m-current');
    expect(connectionTabClasses?.length).toBeLessThan(2);
  });
});

describe('Drawer Details Tab', () => {
  it('should render details in toggle off', () => {
    const { getByText } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTabs.DETAILS
    );

    expect(getByText('cloud_provider')).toBeInTheDocument();
    expect(getByText('region')).toBeInTheDocument();
    expect(getByText('id')).toBeInTheDocument();
    expect(getByText('owner')).toBeInTheDocument();
    expect(getByText('created')).toBeInTheDocument();
    expect(getByText('updated')).toBeInTheDocument();
    expect(getByText('amazon_web_services')).toBeInTheDocument();
    expect(getByText('us_east_north_virginia')).toBeInTheDocument();
    expect(getByText('test_id')).toBeInTheDocument();
    expect(getByText('test instance')).toBeInTheDocument();
  });
});

describe('Drawer Connection Tab', () => {
  it('should render connection tab in toggle off', () => {
    const { getByText } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTabs.CONNECTION
    );
    expect(
      getByText('drawer_resource_tab_body_description_1')
    ).toBeInTheDocument();
    expect(getByText('bootstrap_server')).toBeInTheDocument();
  });

  it('should render server responded bootstrap server host', () => {
    const instance = { ...instanceDetail };
    instance.bootstrap_server_host =
      'kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org:443';

    const { getByRole } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTabs.CONNECTION
    );

    const clipboardInput = getByRole('textbox', {
      name: /Copyable/i,
    }) as HTMLInputElement;
    expect(clipboardInput.value).toEqual(instance.bootstrap_server_host);
  });

  it('should render bootstrap server host with default port', () => {
    const instance = { ...instanceDetail };
    instance.bootstrap_server_host =
      'kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org:443';

    const { getByRole } = setup(
      jest.fn(),
      true,
      false,
      jest.fn(),
      InstanceDrawerTabs.CONNECTION,
      instance
    );
    const clipboardInput = getByRole('textbox', {
      name: /Copyable/i,
    }) as HTMLInputElement;
    expect(clipboardInput.value).toEqual(
      instanceDetail.bootstrap_server_host + ':443'
    );
  });
});
