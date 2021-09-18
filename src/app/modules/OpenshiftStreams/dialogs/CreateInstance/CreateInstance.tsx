import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertVariant, Divider, Flex, FlexItem } from '@patternfly/react-core';
import { isServiceApiError } from '@app/utils/error';
import { MASCreateModal, useRootModalContext } from '@app/common';
import { ErrorCodes } from '@app/utils';
import { Configuration, DefaultApi } from '@rhoas/kafka-management-sdk';
import './CreateInstance.css';
import { InstanceInfo } from './InstanceInfo';
import {
  Quota,
  QuotaType,
  QuotaValue,
  useAlert,
  useAuth,
  useConfig,
  useQuota,
} from '@rhoas/app-services-ui-shared';
import { QuotaAlert } from './QuotaAlert';
import { CreateInstanceForm } from '@app/modules/OpenshiftStreams/dialogs/CreateInstance/CreateInstanceForm';
import {
  asKafkaRequestPayload,
  createEmptyNewKafkaRequestPayload,
  isKafkaRequestInvalid,
  NewKafkaRequestPayload,
} from '@app/models';

const CreateInstance: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { store, hideModal } = useRootModalContext();
  const { onCreate, refresh, cloudProviders, hasUserTrialKafka } =
    store?.modalProps || {};
  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};
  const { addAlert } = useAlert() || {};
  const { getQuota } = useQuota() || {};

  const [kafkaRequest, setKafkaRequest] = useState<NewKafkaRequestPayload>(
    createEmptyNewKafkaRequestPayload()
  );

  const [isCreationInProgress, setCreationInProgress] = useState(false);
  const [quota, setQuota] = useState<Quota>();
  const [hasKafkaCreationFailed, setHasKafkaCreationFailed] =
    useState<boolean>(false);

  const kasQuota: QuotaValue | undefined = quota?.data?.get(QuotaType?.kas);
  const kasTrial: QuotaValue | undefined = quota?.data?.get(
    QuotaType?.kasTrial
  );
  const loadingQuota = quota?.loading === undefined ? true : quota?.loading;
  const isKasTrial = kasTrial && !kasQuota;

  // Function to fetch cloud Regions based on selected filter
  const fetchCloudRegions = async (id: string) => {
    const accessToken = await auth?.kas.getToken();

    if (accessToken && id) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        const regions = await apisService.getCloudProviderRegions(id);
        return regions.data.items?.filter((p) => p.enabled);
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }
        addAlert &&
          addAlert({
            title: t('common.something_went_wrong'),
            variant: AlertVariant.danger,
            description: reason,
          });
      }
    }
    return undefined;
  };

  const fetchQuota = async () => {
    if (getQuota) {
      await getQuota().then((res) => {
        setQuota(res);
      });
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  const createInstance = async () => {
    const accessToken = await auth?.kas.getToken();

    if (accessToken) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );

        setCreationInProgress(true);
        onCreate();
        await apisService.createKafka(
          true,
          asKafkaRequestPayload(kafkaRequest)
        );
        hideModal();
        refresh();
      } catch (error) {
        if (isServiceApiError(error)) {
          const { code, reason } = error?.response?.data || {};
          //if instance name duplicate
          if (code === ErrorCodes.DUPLICATE_INSTANCE_NAME) {
            kafkaRequest.name.validated = 'error';
            kafkaRequest.name.errorMessage = t(
              'the_name_already_exists_please_enter_a_unique_name',
              {
                name: kafkaRequest.name.value,
              }
            );
          }
          //if kafka creation failed due to quota
          else if (
            code === ErrorCodes.PREVIEW_KAFKA_INSTANCE_EXIST ||
            code === ErrorCodes.INSUFFICIENT_QUOTA ||
            code === ErrorCodes.FAILED_TO_CHECK_QUOTA
          ) {
            setHasKafkaCreationFailed(true);
          } else {
            addAlert &&
              addAlert({
                title: t('common.something_went_wrong'),
                variant: AlertVariant.danger,
                description: reason,
                dataTestId: 'toastCreateKafka-failed',
              });
          }
        }
        setCreationInProgress(false);
      }
    }
  };

  const handleModalToggle = () => {
    hideModal();
  };

  return (
    <MASCreateModal
      isModalOpen={true}
      title={t('create_a_kafka_instance')}
      handleModalToggle={handleModalToggle}
      onCreate={createInstance}
      isFormValid={!isKafkaRequestInvalid(kafkaRequest)}
      primaryButtonTitle={t('create_instance')}
      isCreationInProgress={isCreationInProgress}
      dataTestIdSubmit='modalCreateKafka-buttonSubmit'
      dataTestIdCancel='modalCreateKafka-buttonCancel'
      isDisabledButton={
        loadingQuota ||
        hasUserTrialKafka ||
        hasKafkaCreationFailed ||
        (kasQuota && kasQuota?.remaining === 0) ||
        (!kasQuota && !kasTrial)
      }
    >
      <>
        <QuotaAlert
          quota={quota}
          hasKafkaCreationFailed={hasKafkaCreationFailed}
          loadingQuota={loadingQuota}
          hasUserTrialKafka={hasUserTrialKafka}
          isKasTrial={isKasTrial}
        />
        <Flex direction={{ default: 'column', lg: 'row' }}>
          <FlexItem flex={{ default: 'flex_2' }}>
            <CreateInstanceForm
              kafkaRequest={kafkaRequest}
              setKafkaRequest={setKafkaRequest}
              createInstance={createInstance}
              cloudProviders={cloudProviders}
              getCloudRegions={fetchCloudRegions}
            />
          </FlexItem>
          <Divider isVertical />
          <FlexItem
            flex={{ default: 'flex_1' }}
            className='mk--create-instance-modal__sidebar--content'
          >
            <InstanceInfo isKasTrial={isKasTrial} />
          </FlexItem>
        </Flex>
      </>
    </MASCreateModal>
  );
};

export { CreateInstance };
export default CreateInstance;
