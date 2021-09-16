import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertVariant } from '@patternfly/react-core';
import { useAuth, useConfig, useAlert } from '@rhoas/app-services-ui-shared';
import { getDeleteInstanceModalConfig } from '@app/modules/OpenshiftStreams/components';
import { useRootModalContext } from '@app/common';
import { Configuration, DefaultApi } from '@rhoas/kafka-management-sdk';
import { DeleteInstanceModal } from './DeleteInstance';
import { isServiceApiError } from '@app/utils';

const DeleteInstanceConnected = () => {
  const { addAlert } = useAlert() || {};
  const { t } = useTranslation();
  const auth = useAuth();
  const history = useHistory();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};

  const { store, hideModal } = useRootModalContext();
  const { selectedItemData: instanceDetail, setIsOpenDeleteInstanceModal } = store?.modalProps || {};
  const { status, name, id } = instanceDetail || {};
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { title, confirmActionLabel, description } = getDeleteInstanceModalConfig(t, status, name);

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
        await apisService.deleteKafkaById(id, true).then(() => {
          setIsLoading(false);
          onCloseModal();
          //redirect on kafka list page
          history.push('/streams/kafkas');
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
    addAlert &&
      addAlert({
        title: t('something_went_wrong'),
        variant: AlertVariant.danger,
        description: reason,
      });
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
export default DeleteInstanceConnected;
