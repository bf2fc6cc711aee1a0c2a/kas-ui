import React from 'react';

import { render, screen, getByTestId, getByText } from '@testing-library/react';

import { InstanceDrawer } from './InstanceDrawer';
import { Drawer, DrawerContent } from '@patternfly/react-core';
import userEvent from '@testing-library/user-event';
import { KafkaRequest } from 'src/openapi';

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
  bootstrapServerHost: 'kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org',
};

describe('Instance Drawer', () => {
  it('should render drawer', () => {
    const { getByTestId } = render(
      <InstanceDrawer
        isExpanded={true}
        mainToggle={false}
        onClose={jest.fn()}
        instanceDetail={instanceDetail}
        activeTab={'Details'}
      />
    );
    getByTestId('instance-drawer');
  });

  it('should render loading if no instance is available', () => {
    const { getByTestId, getByRole, getByText } = render(
      <Drawer isExpanded={true} onExpand={jest.fn()}>
        <DrawerContent
          panelContent={
            <InstanceDrawer isExpanded={true} mainToggle={false} onClose={jest.fn()} activeTab={'Details'} />
          }
        />
      </Drawer>
    );
    getByTestId('instance-drawer');
    getByRole('status');
  });

  it('should render instance name card', () => {
    const { getByTestId, getByText } = render(
      <Drawer isExpanded={true} onExpand={jest.fn()}>
        <DrawerContent
          panelContent={
            <InstanceDrawer
              isExpanded={true}
              mainToggle={false}
              onClose={jest.fn()}
              activeTab={'Details'}
              instanceDetail={instanceDetail}
            />
          }
        />
      </Drawer>
    );
    getByTestId('instance-drawer');

    getByText('instance_name');
    instanceDetail.name && getByText(instanceDetail.name);
  });

  it('should render instance detail as active tab', () => {
    const { getByTestId, getByText } = render(
      <Drawer isExpanded={true} onExpand={jest.fn()}>
        <DrawerContent
          panelContent={
            <InstanceDrawer
              isExpanded={true}
              mainToggle={false}
              onClose={jest.fn()}
              activeTab={'Details'}
              instanceDetail={instanceDetail}
            />
          }
        />
      </Drawer>
    );
    getByTestId('instance-drawer');

    const detailTabClasses = getByTestId('pf-tab-0-instance-drawer-detail-tab').parentElement?.className.split(' ');
    const connectionTabClasses = getByTestId('pf-tab-1-instance-drawer-connection-tab').parentElement?.className.split(
      ' '
    );
    expect(detailTabClasses).toContain('pf-m-current');
    expect(connectionTabClasses?.length).toBeLessThan(2);
  });

  it('should render instance connection as active tab', () => {
    const { getByTestId } = render(
      <Drawer isExpanded={true} onExpand={jest.fn()}>
        <DrawerContent
          panelContent={
            <InstanceDrawer
              isExpanded={true}
              mainToggle={false}
              onClose={jest.fn()}
              activeTab={'Connection'}
              instanceDetail={instanceDetail}
            />
          }
        />
      </Drawer>
    );

    const detailTabClasses = getByTestId('pf-tab-0-instance-drawer-detail-tab').parentElement?.className.split(' ');
    const connectionTabClasses = getByTestId('pf-tab-1-instance-drawer-connection-tab').parentElement?.className.split(
      ' '
    );
    expect(connectionTabClasses).toContain('pf-m-current');
    expect(detailTabClasses?.length).toBeLessThan(2);
  });

  it('should handle toggle of tab from connection to detail', () => {
    const { getByTestId } = render(
      <Drawer isExpanded={true} onExpand={jest.fn()}>
        <DrawerContent
          panelContent={
            <InstanceDrawer
              isExpanded={true}
              mainToggle={false}
              onClose={jest.fn()}
              activeTab={'Connection'}
              instanceDetail={instanceDetail}
            />
          }
        />
      </Drawer>
    );

    const detailTab = getByTestId('pf-tab-0-instance-drawer-detail-tab');
    userEvent.click(detailTab);
    const connectionTabClasses = getByTestId('pf-tab-0-instance-drawer-detail-tab').parentElement?.className.split(' ');
    expect(connectionTabClasses).toContain('pf-m-current');
  });
});

describe('Drawer Details Tab', () => {
  const drawer = (mainToggle: boolean) => (
    <Drawer isExpanded={true} onExpand={jest.fn()}>
      <DrawerContent
        panelContent={
          <InstanceDrawer
            isExpanded={true}
            mainToggle={mainToggle}
            onClose={jest.fn()}
            activeTab={'Details'}
            instanceDetail={instanceDetail}
          />
        }
      />
    </Drawer>
  );
  it('should render details in toggle off', () => {
    const { getByText } = render(drawer(false));

    getByText('cloud_provider');
    getByText('region');
    getByText('id');
    getByText('owner');
    getByText('created');
    getByText('updated');
    getByText('amazon_web_services');
    getByText('us_east_north_virginia');
    instanceDetail.id && getByText(instanceDetail.id);
    instanceDetail.name && getByText(instanceDetail.name);
  });

  it('should render details in toggle on', () => {
    const { getByText } = render(drawer(true));

    getByText('cloud_provider');
    getByText('region');
    getByText('id');
    getByText('owner');
    getByText('created');
    getByText('updated');
    getByText('amazon_web_services');
    getByText('us_east_north_virginia');
    instanceDetail.id && getByText(instanceDetail.id);
    instanceDetail.name && getByText(instanceDetail.name);
    getByText('topics');
    getByText('consumer_groups');
  });
});

describe('Drawer Connection Tab', () => {
  const drawer = (mainToggle: boolean) => (
    <Drawer isExpanded={true} onExpand={jest.fn()}>
      <DrawerContent
        panelContent={
          <InstanceDrawer
            isExpanded={true}
            mainToggle={mainToggle}
            onClose={jest.fn()}
            activeTab={'Connection'}
            instanceDetail={instanceDetail}
          />
        }
      />
    </Drawer>
  );
  it('should render connection tab in toggle off', () => {
    const { getByText } = render(drawer(false));
    getByText('drawer_resource_tab_body_description_1');
    getByText('kafka_listener_and_credentials');
    getByText('drawer_resource_tab_body_description_2');
    getByText('external_server');
  });

  it('should render connection tab with resource and sample code tabs in toggle on', () => {
    const { getByText, getByTestId } = render(drawer(true));
    getByText('drawer_resource_tab_body_description_1');
    getByText('kafka_listener_and_credentials');
    getByText('drawer_resource_tab_body_description_2');
    getByText('external_server');

    getByText('resources');
    getByText('sample_code');

    // check the resources tab is active
    const resourcesTabClasses = getByTestId('pf-tab-0-connection-detail-resource-tab').parentElement?.className.split(
      ' '
    );
    expect(resourcesTabClasses).toContain('pf-m-current');
  });

  it('should render connection tab with sample code as active tab in toggle on', () => {
    const { getByText, getByTestId } = render(drawer(true));
    getByText('drawer_resource_tab_body_description_1');
    getByText('kafka_listener_and_credentials');
    getByText('drawer_resource_tab_body_description_2');
    getByText('external_server');

    getByText('resources');
    getByText('sample_code');

    const sampleCodeTab = getByTestId('pf-tab-1-connection-detail-sample-code-tab');
    userEvent.click(sampleCodeTab);
    const sampleCodeTabClasses = getByTestId(
      'pf-tab-1-connection-detail-sample-code-tab'
    ).parentElement?.className.split(' ');
    expect(sampleCodeTabClasses).toContain('pf-m-current');
  });

  it('should render server responded bootstrap server host', () => {
    const instance = { ...instanceDetail };
    instance.bootstrapServerHost = 'kafka--ltosqyk-wsmt-t-elukpkft-bg.apps.ms-bv8dm6nbd3jo.cx74.s1.devshift.org:443';

    const { getByTestId } = render(
      <Drawer isExpanded={true} onExpand={jest.fn()}>
        <DrawerContent
          panelContent={
            <InstanceDrawer
              isExpanded={true}
              mainToggle={false}
              onClose={jest.fn()}
              activeTab={'Connection'}
              instanceDetail={instance}
            />
          }
        />
      </Drawer>
    );
    const input: any = getByTestId('text-input-12');
    expect(input.value).toEqual(instance.bootstrapServerHost);
  });

  it('should render bootstrap server host with default port', () => {
    const { getByTestId } = render(
      <Drawer isExpanded={true} onExpand={jest.fn()}>
        <DrawerContent
          panelContent={
            <InstanceDrawer
              isExpanded={true}
              mainToggle={false}
              onClose={jest.fn()}
              activeTab={'Connection'}
              instanceDetail={instanceDetail}
            />
          }
        />
      </Drawer>
    );
    const input: any = getByTestId('text-input-13');
    expect(input.value).toEqual(instanceDetail.bootstrapServerHost + ':443');
  });
});
