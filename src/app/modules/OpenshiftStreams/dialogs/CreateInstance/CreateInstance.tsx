import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertVariant,
  Button,
  Divider,
  Flex,
  FlexItem,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { isServiceApiError } from '@app/utils/error';
import { ErrorCodes, getModalAppendTo, InstanceType } from '@app/utils';
import {
  CloudProvider,
  Configuration,
  DefaultApi,
} from '@rhoas/kafka-management-sdk';
import './CreateInstance.css';
import { InstanceInfo } from './InstanceInfo';
import {
  BaseModalProps,
  CreateInstanceProps,
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
import { usePageVisibility } from '@app/hooks/usePageVisibility';

const FORM_ID = 'create_instance_-form';

const CreateInstance: React.FunctionComponent<
  CreateInstanceProps & BaseModalProps
> = ({ onCreate, title, hideModal }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};
  const { addAlert } = useAlert() || {};
  const { getQuota } = useQuota() || {};

  const { isVisible } = usePageVisibility();

  const [kafkaRequest, setKafkaRequest] = useState<NewKafkaRequestPayload>(
    createEmptyNewKafkaRequestPayload()
  );

  const [isCreationInProgress, setCreationInProgress] = useState(false);
  const [quota, setQuota] = useState<Quota>();
  const [hasKafkaCreationFailed, setHasKafkaCreationFailed] =
    useState<boolean>(false);

  const [cloudProviders, setCloudProviders] = useState<
    CloudProvider[] | undefined
  >();
  const [userHasTrialInstance, setUserHasTrialInstance] = useState<
    boolean | undefined
  >();

  const kasQuota: QuotaValue | undefined = quota?.data?.get(QuotaType?.kas);
  const kasTrial: QuotaValue | undefined = quota?.data?.get(
    QuotaType?.kasTrial
  );
  const loadingQuota = quota?.loading === undefined ? true : quota?.loading;
  const isKasTrial = kasTrial && !kasQuota;

  // Function to fetch cloud Regions based on selected filter
  const fetchCloudRegions = async (id: string) => {
    const accessToken = await auth?.kas.getToken();

    if (accessToken && id && loadingQuota === false) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        const regions = await apisService.getCloudProviderRegions(
          id,
          undefined,
          undefined,
          isKasTrial ? InstanceType.eval : InstanceType.standard
        );
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

  const fetchUserHasTrialInstance = async () => {
    const loggedInUser = await auth?.getUsername();
    const accessToken = await auth?.kas.getToken();
    if (loggedInUser) {
      const filter = `owner = ${loggedInUser}`;
      if (accessToken && isVisible) {
        try {
          const apisService = new DefaultApi(
            new Configuration({
              accessToken,
              basePath,
            })
          );
          const res = await apisService.getKafkas('', '', '', filter);
          if (res.data.items) {
            setUserHasTrialInstance(
              res.data.items.some(
                (k) => k?.instance_type === InstanceType?.eval
              )
            );
          }
        } catch (error) {
          handleServerError(error);
        }
      }
    }
  };

  const handleServerError = (error: unknown) => {
    let reason: string | undefined;
    let errorCode: string | undefined;
    if (isServiceApiError(error)) {
      reason = error.response?.data.reason;
      errorCode = error.response?.data?.code;
    }
    addAlert &&
      addAlert({
        variant: AlertVariant.danger,
        title: t('common.something_went_wrong'),
        description: reason,
      });
  };

  useEffect(() => {
    fetchUserHasTrialInstance();
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
        onCreate && onCreate();
        await apisService.createKafka(
          true,
          asKafkaRequestPayload(kafkaRequest)
        );
        hideModal();
        onCreate && onCreate();
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
    <Modal
      id='modalCreateKafka'
      variant={ModalVariant.medium}
      title={title}
      isOpen={true}
      onClose={handleModalToggle}
      appendTo={getModalAppendTo}
      actions={[
        <Button
          key='submit'
          variant='primary'
          type='submit'
          form={FORM_ID}
          isDisabled={
            isKafkaRequestInvalid(kafkaRequest) ||
            isCreationInProgress ||
            loadingQuota ||
            userHasTrialInstance ||
            hasKafkaCreationFailed ||
            (kasQuota && kasQuota?.remaining === 0) ||
            (!kasQuota && !kasTrial)
          }
          spinnerAriaValueText={t('submitting_request')}
          isLoading={isCreationInProgress}
          data-testid='modalCreateKafka-buttonSubmit'
        >
          {t('create_instance')}
        </Button>,
        <Button
          key='cancel'
          variant='link'
          onClick={handleModalToggle}
          data-testid='modalCreateKafka-buttonCancel'
        >
          {t('cancel')}
        </Button>,
      ]}
    >
      <QuotaAlert
        quota={quota}
        hasKafkaCreationFailed={hasKafkaCreationFailed}
        loadingQuota={loadingQuota}
        userHasTrialInstance={userHasTrialInstance}
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
            id={FORM_ID}
            quotaLoading={quota?.loading}
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
    </Modal>
  );
};

export { CreateInstance };
export default CreateInstance;
