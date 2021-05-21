import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertVariant } from '@patternfly/react-core';
import { getDeleteInstanceModalConfig } from '@app/modules/OpenshiftStreams/components';
import { useRootModalContext, useAlerts } from '@app/common';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { DefaultApi } from '../../../../../openapi/api';
import { DeleteInstanceModal } from './DeleteInstance';
import { isServiceApiError } from '@app/utils';

const DeleteInstanceConnected = () => {
  const { addAlert } = useAlerts();
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
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
    const accessToken = await authContext?.getToken();
    if (accessToken && id) {
      try {
        setIsLoading(true);
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        await apisService.deleteKafkaById(id, true).then((res) => {
          setIsLoading(false);
          onCloseModal();
          //redirect on kafka list page
          onConnectToRoute({}, 'kafkas');
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
    addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
  };

  const fetchKafkaServiceStatus = async () => {
    const accessToken = await authContext?.getToken();

    if (accessToken) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });

        await apisService.serviceStatus().then((res) => {
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
