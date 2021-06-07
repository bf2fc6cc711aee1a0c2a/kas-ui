import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertVariant } from '@patternfly/react-core';
import { useAuth, useConfig, useAlert } from '@bf2/ui-shared';
import { getDeleteInstanceModalConfig } from '@app/modules/OpenshiftStreams/components';
import { useRootModalContext } from '@app/common';
import { Configuration, DefaultApi } from '@rhoas/kafka-management-sdk';
import { DeleteInstanceModal } from './DeleteInstance';
import { isServiceApiError } from '@app/utils';

const DeleteInstanceConnected = () => {
  const { addAlert } = useAlert();
  const { t } = useTranslation();
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();
  const { store, hideModal } = useRootModalContext();
  const { selectedItemData: instanceDetail, onConnectToRoute, setIsOpenDeleteInstanceModal } = store?.modalProps || {};
  const { status, name, id } = instanceDetail || {};
  const [isMaxCapacityReached, setIsMaxCapacityReached] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { title, confirmActionLabel, description } = getDeleteInstanceModalConfig(
    t,
    status,
    name,
    isMaxCapacityReached
  );

  useEffect(() => {
    fetchKafkaServiceStatus();
  }, []);

  const onCloseModal = () => {
    setIsOpenDeleteInstanceModal && setIsOpenDeleteInstanceModal(false);
  };

  const onDeleteInstance = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken && id) {
      try {
        setIsLoading(true);
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        await apisService.deleteKafkaById(id, true).then((res) => {
          setIsLoading(false);
          onCloseModal();
          //redirect on kafka list page
          onConnectToRoute && onConnectToRoute({}, 'kafkas');
        });
      } catch (error) {
        setIsLoading(false);
        handleServerError(error);
      }
    }
  };

  const handleServerError = (error: any) => {
    let reason: string | undefined;
    if (isServiceApiError(error)) {
      reason = error.response?.data.reason;
    }
    addAlert({
      title: t('something_went_wrong'),
      variant: AlertVariant.danger,
      description: reason,
    });
  };

  const fetchKafkaServiceStatus = async () => {
    const accessToken = await auth?.kas.getToken();

    if (accessToken) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );

        await apisService.getServiceStatus().then((res) => {
          const maxCapacityReached = res?.data?.kafkas?.max_capacity_reached;
          setIsMaxCapacityReached(maxCapacityReached);
        });
      } catch (error) {
        handleServerError(error);
      }
    }
  };

  const props = {
    ...store?.modalProps,
    hideModal,
    title,
    confirmButtonProps: {
      onClick: onDeleteInstance,
      label: confirmActionLabel,
      isLoading,
    },
    textProps: {
      description,
    },
    onClose: onCloseModal,
    instanceStatus: status,
  };

  return <DeleteInstanceModal {...props} />;
};

export { DeleteInstanceConnected };
