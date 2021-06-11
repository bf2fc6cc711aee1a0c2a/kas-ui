import React from 'react';

import { render } from '@testing-library/react';

import { InstanceDrawer } from './InstanceDrawer';
import { Drawer, DrawerContent } from '@patternfly/react-core';
import userEvent from '@testing-library/user-event';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';
import { MemoryRouter } from 'react-router';

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
    useTranslation: () => ({ t: (key) => key, i18n: { changeLanguage: jest.fn() } }),
  };
});

const instanceDetail: KafkaRequest = {
  name: 'test instance',
  id: 'test_id',
  created_at: '2020-12-10T16:26:53.357492Z',
  updated_at: '2020-12-10T16:26:56.757669Z',
  owner: 'test_owner',
  bootstrap_server_host: 'kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org',
};

const setup = (
  onExpand: () => void,
  isExpanded: boolean,
  mainToggle: boolean,
  onClose: () => void,
  activeTab: 'Details' | 'Connection',
  instance?: KafkaRequest
) => {
  return render(
    <MemoryRouter>
      <Drawer isExpanded={true} onExpand={onExpand}>
        <DrawerContent
          panelContent={
            <InstanceDrawer
              isExpanded={isExpanded}
              mainToggle={mainToggle}
              onClose={onClose}
              activeTab={activeTab}
              instanceDetail={instance || instanceDetail}
              isLoading={instanceDetail === undefined}
              data-ouia-app-id="controlPlane-streams"
              getConnectToRoutePath={jest.fn()}
              onConnectToRoute={jest.fn()}
              tokenEndPointUrl={'sooss'}
              notRequiredDrawerContentBackground={true}
            >
              <></>
            </InstanceDrawer>
          }
        />
      </Drawer>
    </MemoryRouter>
  );
};
describe('Instance Drawer', () => {
  // TODO Fix test
  /*it('should render drawer', () => {
    const { getByTestId } = setup(jest.fn(), true, false, jest.fn(), 'Details');
    expect(getByTestId('mk--instance__drawer')).toBeInTheDocument();
  });*/

  // TODO Fix test
  /*it('should render loading if no instance is available', () => {
    const { getByTestId, getByRole } = render(
      <MemoryRouter>
        <Drawer isExpanded={true} onExpand={jest.fn()}>
          <DrawerContent
            panelContent={
              <InstanceDrawer
                getConnectToRoutePath={jest.fn()}
                onConnectToRoute={jest.fn()}
                tokenEndPointUrl={'sooss'}
                isExpanded={true}
                isLoading={instanceDetail === undefined}
                mainToggle={false}
                onClose={jest.fn()}
                activeTab={'Details'}
              ><></></InstanceDrawer>
            }
          />
        </Drawer>
      </MemoryRouter>
    );
    expect(getByTestId('mk--instance__drawer')).toBeInTheDocument();
    expect(getByRole('status')).toBeInTheDocument();
  });*/

  // TODO Fix test
  /*it('should render instance name card', () => {
    const { getByTestId, getByText } = setup(jest.fn(), true, false, jest.fn(), 'Details');

    expect(getByTestId('mk--instance__drawer')).toBeInTheDocument();
    expect(getByText('instance_name')).toBeInTheDocument();
    expect(getByText('test instance')).toBeInTheDocument();
  });*/

  it('should render instance detail as active tab', () => {
    const { getByRole } = setup(jest.fn(), true, false, jest.fn(), 'Details');

    const detailsButton = getByRole('button', { name: /Details/i });
    expect(detailsButton).toBeInTheDocument();
    const detailTabClasses = detailsButton?.parentElement?.className?.split(' ');
    expect(getByRole('button', { name: /Connection/i })).toBeInTheDocument();
    const connectionButton = getByRole('button', { name: /Connection/i });
    expect(connectionButton).toBeInTheDocument();
    const connectionTabClasses = connectionButton?.parentElement?.className?.split(' ');
    expect(detailTabClasses).toContain('pf-m-current');
    expect(connectionTabClasses?.length).toBeLessThan(2);
  });

  it('should render instance connection as active tab', () => {
    const { getByRole } = setup(jest.fn(), true, false, jest.fn(), 'Connection');

    const detailsButton = getByRole('button', { name: /Details/i });
    expect(detailsButton).toBeInTheDocument();
    const detailTabClasses = detailsButton?.parentElement?.className?.split(' ');
    const connectionButton = getByRole('button', { name: /Connection/i });
    expect(connectionButton).toBeInTheDocument();
    const connectionTabClasses = connectionButton?.parentElement?.className?.split(' ');
    expect(connectionTabClasses).toContain('pf-m-current');
    expect(detailTabClasses?.length).toBeLessThan(2);
  });

  it('should handle toggle of tab from connection to detail', () => {
    const { getByRole } = setup(jest.fn(), true, false, jest.fn(), 'Connection');

    const detailsButton = getByRole('button', { name: /Details/i });
    expect(detailsButton).toBeInTheDocument();

    userEvent.click(detailsButton);

    const connectionButton = getByRole('button', { name: /Connection/i });
    expect(connectionButton).toBeInTheDocument();

    const connectionTabClasses = connectionButton?.parentElement?.className?.split(' ');
    const detailTabClasses = detailsButton?.parentElement?.className?.split(' ');
    expect(detailTabClasses).toContain('pf-m-current');
    expect(connectionTabClasses?.length).toBeLessThan(2);
  });
});

describe('Drawer Details Tab', () => {
  it('should render details in toggle off', () => {
    const { getByText } = setup(jest.fn(), true, false, jest.fn(), 'Details');

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

  it('should render details in toggle on', () => {
    const { getByText } = setup(jest.fn(), true, true, jest.fn(), 'Details');

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
    expect(getByText('topics')).toBeInTheDocument();
    expect(getByText('consumer_groups')).toBeInTheDocument();
  });
});

describe('Drawer Connection Tab', () => {
  // TODO Fix test
  /*it('should render connection tab in toggle off', () => {
    const { getByText } = setup(jest.fn(), true, false, jest.fn(), 'Connection');
    expect(getByText('drawer_resource_tab_body_description_1')).toBeInTheDocument();
    expect(getByText('kafka_listener_and_credentials')).toBeInTheDocument();
    expect(getByText('drawer_resource_tab_body_description_2')).toBeInTheDocument();
    expect(getByText('bootstrap_server')).toBeInTheDocument();
  });*/
  // TODO Fix test
  /*it('should render connection tab with resource and sample code tabs in toggle on', () => {
    const { getByText, getByRole } = setup(jest.fn(), true, true, jest.fn(), 'Connection');
    expect(getByText('drawer_resource_tab_body_description_1')).toBeInTheDocument();
    expect(getByText('kafka_listener_and_credentials')).toBeInTheDocument();
    expect(getByText('drawer_resource_tab_body_description_2')).toBeInTheDocument();
    expect(getByText('bootstrap_server')).toBeInTheDocument();

    expect(getByText('resources')).toBeInTheDocument();
    expect(getByText('sample_code')).toBeInTheDocument();
    expect(getByText('resources')).toBeInTheDocument();
    expect(getByText('sample_code')).toBeInTheDocument();

    const resourceButton = getByRole('button', { name: /resources/i });
    expect(resourceButton).toBeInTheDocument();

    const resourcesTabClasses = resourceButton?.parentElement?.className?.split(' ');
    expect(resourcesTabClasses).toContain('pf-m-current');
  });*/
  // TODO Fix test
  /*it('should render connection tab with sample code as active tab in toggle on', () => {
    const { getByText, getByRole } = setup(jest.fn(), true, true, jest.fn(), 'Connection');
    expect(getByText('drawer_resource_tab_body_description_1')).toBeDefined();
    expect(getByText('kafka_listener_and_credentials')).toBeDefined();
    expect(getByText('drawer_resource_tab_body_description_2')).toBeDefined();
    expect(getByText('bootstrap_server')).toBeDefined();

    expect(getByText('resources')).toBeDefined();
    expect(getByText('sample_code')).toBeDefined();

    const resourceButton = getByRole('button', { name: /resources/i });
    const sampleButton = getByRole('button', { name: /sample/i });
    expect(resourceButton).toBeInTheDocument();
    expect(sampleButton).toBeInTheDocument();

    userEvent.click(sampleButton);
    const sampleCodeTabClasses = sampleButton?.parentElement?.className?.split(' ');
    expect(sampleCodeTabClasses).toContain('pf-m-current');
  });*/
  // TODO Fix test
  /*it('should render server responded bootstrap server host', () => {
    const instance = { ...instanceDetail };
    instance.bootstrap_server_host = 'kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org:443';

    const { getByRole } = setup(jest.fn(), true, false, jest.fn(), 'Connection');

    const clipboardInput: any = getByRole('textbox', { name: /Copyable/i });
    expect(clipboardInput.value).toEqual(instance.bootstrap_server_host);
  });*/
  // TODO Fix test
  /*it('should render bootstrap server host with default port', () => {
    const { getByRole } = setup(jest.fn(), true, false, jest.fn(), 'Connection');

    const clipboardInput: any = getByRole('textbox', { name: /Copyable/i });
    expect(clipboardInput.value).toEqual(instanceDetail.bootstrap_server_host + ':443');
  });*/
  // TODO Fix test
  /*it('should render bootstrap server host with default port', () => {
    const instance = { ...instanceDetail };
    instance.bootstrap_server_host = 'kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org:443';

    const { getByRole } = setup(jest.fn(), true, false, jest.fn(), 'Connection', instance);
    const clipboardInput: any = getByRole('textbox', { name: /Copyable/i });
    expect(clipboardInput.value).toEqual(instanceDetail.bootstrap_server_host + ':443');
  });*/
});
