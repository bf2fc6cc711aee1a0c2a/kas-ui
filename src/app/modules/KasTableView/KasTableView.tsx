import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
import {
  AlertVariant,
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { KAFKA_MODAL_TYPES, useRootModalContext } from '@app/common';
import { ErrorCodes, isServiceApiError } from '@app/utils';
import {
  CloudProvider,
  Configuration,
  DefaultApi,
  KafkaRequest,
} from '@rhoas/kafka-management-sdk';
import './KasTableView.css';
import { PreviewAlert } from '@app/modules/KasTableView/PreviewAlert';
import {
  SelectedInstance,
  ServiceTableConnected,
} from '@app/common/ServiceTable/ConnectedTable/ServiceTableConnected';
import {
  InstanceDrawer,
  InstanceDrawerProps,
} from '@app/modules/InstanceDrawer';
import { MobileModalWrapper } from '@app/modules/KasTableView/MobileModalWrapper';
import { UserUnauthorized } from '@app/modules/KasTableView/UserUnauthorized';
import { useFederated } from '@app/contexts';
import { useAlert, useAuth, useConfig } from '@rhoas/app-services-ui-shared';

export type KasTableProps = Pick<InstanceDrawerProps, 'tokenEndPointUrl'>;

export const KasTableView: React.FunctionComponent<KasTableProps> = ({
  tokenEndPointUrl,
}: KasTableProps) => {
  dayjs.extend(localizedFormat);
  const { shouldOpenCreateModal } = useFederated() || {};

  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig() || {
    kas: {},
  };
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mainToggle = searchParams.has('user-testing');
  const { t } = useTranslation();
  const { addAlert } = useAlert() || {};
  const { showModal } = useRootModalContext();

  // States
  const [loggedInUserKafkaInstance, setLoggedInUserKafkaInstance] = useState<
    KafkaRequest | undefined
  >();
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<
    SelectedInstance<KafkaRequest> | undefined
  >();
  // state to store the expected total kafka instances based on the operation
  const [isUserUnauthorized, setIsUserUnauthorized] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const openModal = async () => {
      const shouldOpen =
        shouldOpenCreateModal && (await shouldOpenCreateModal());
      if (shouldOpen && cloudProviders?.length < 1) {
        fetchCloudProviders();
      }
      if (shouldOpen && cloudProviders?.length > 0) {
        handleCreateModal(yeah);
      }
    };
    openModal();
  }, [shouldOpenCreateModal, cloudProviders]);

  const handleCreateModal = (userHasTrialInstances: boolean) => {
    showModal(KAFKA_MODAL_TYPES.CREATE_KAFKA_INSTANCE, {
      onCreate: () => {
        // No-op
      },
      cloudProviders,
      mainToggle,
      refresh: () => {
        // No-op
      },
      hasUserTrialKafka: userHasTrialInstances
    });
  };

  const onCloseDrawer = () => {
    setSelectedInstance(undefined);
  };

  const handleServerError = (error: unknown) => {
    let reason: string | undefined;
    let errorCode: string | undefined;
    if (isServiceApiError(error)) {
      reason = error.response?.data.reason;
      errorCode = error.response?.data?.code;
    }
    //check unauthorize user
    if (errorCode === ErrorCodes.UNAUTHORIZED_USER) {
      setIsUserUnauthorized(true);
    } else {
      addAlert &&
        addAlert({
          variant: AlertVariant.danger,
          title: t('common.something_went_wrong'),
          description: reason,
        });
    }
  };

  const fetchCloudProviders = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        await apisService.getCloudProviders().then((res) => {
          const providers = res?.data?.items || [];
          const enabledCloudProviders: CloudProvider[] = providers?.filter(
            (p: CloudProvider) => p.enabled
          );
          setCloudProviders(enabledCloudProviders);
        });
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }
        addAlert &&
          addAlert({
            variant: AlertVariant.danger,
            title: t('common.something_went_wrong'),
            description: reason,
          });
      }
    }
  };

  useEffect(() => {
    fetchCloudProviders();
  }, []);

  useEffect(() => {
    auth.getUsername()?.then((username) => setLoggedInUser(username));
  }, [auth]);

  if (isUserUnauthorized) {
    return <UserUnauthorized />;
  }

  const buildApi = async () => {
    const accessToken = await auth?.kas.getToken();

    if (accessToken) {
      return new DefaultApi(
        new Configuration({
          accessToken,
          basePath,
        })
      );
    }
    throw new Error('no access token');
  };

  const getInstances = async (page, size, orderBy, search) => {
    const api = await buildApi();
    return api
      .getKafkas('1', size, orderBy, search)
      .then((res) => res.data)
      .then((kafkaInstancesList) => {
        const kafkaItem: KafkaRequest | undefined =
          kafkaInstancesList?.items?.filter(
            (kafka) => kafka.owner === loggedInUser
          )[0];
        if (!kafkaItem) {
          setLoggedInUserKafkaInstance(
            kafkaInstancesList?.items?.filter(
              (kafka) => kafka.owner === loggedInUser
            )[0]
          );
        }
        return kafkaInstancesList;
      });
  };
  const deleteInstance = async (id) => {
    const api = await buildApi();
    try {
      await api.deleteKafkaById(id, true);
    } catch (error) {
      let reason: string | undefined;
      if (isServiceApiError(error)) {
        reason = error.response?.data.reason;
      }
      /**
       * Todo: show user friendly message according to server code
       * and translation for specific language
       *
       */
      addAlert &&
        addAlert({
          title: t('common.something_went_wrong'),
          variant: AlertVariant.danger,
          description: reason,
        });
    }
  };

  return (
    <MobileModalWrapper>
      <InstanceDrawer
        isExpanded={selectedInstance !== undefined}
        initialTab={selectedInstance?.activeTab}
        isLoading={selectedInstance === undefined}
        instanceDetail={selectedInstance?.instanceDetail}
        onClose={onCloseDrawer}
        data-ouia-app-id='controlPlane-streams'
        tokenEndPointUrl={tokenEndPointUrl}
      >
        <main className='pf-c-page__main'>
          <PageSection variant={PageSectionVariants.light}>
            <Level>
              <LevelItem>
                <TextContent>
                  <Text component='h1'>{t('kafka_instances')}</Text>
                </TextContent>
              </LevelItem>
            </Level>
            <PreviewAlert previewKafkaInstance={loggedInUserKafkaInstance} />
          </PageSection>
          <ServiceTableConnected
            onOpenCreateModal={handleCreateModal}
            onSelectInstance={(value) => setSelectedInstance(value)}
            deleteInstance={deleteInstance}
            getInstances={getInstances}
          />
        </main>
      </InstanceDrawer>
    </MobileModalWrapper>
  );
};
