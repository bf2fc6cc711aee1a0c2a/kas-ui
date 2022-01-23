import {
  CreateKafkaInstance,
  CreateKafkaInstanceError,
  InitializationData,
} from '@rhoas/app-services-ui-components';
import {
  BaseModalProps,
  CreateInstanceProps,
} from '@rhoas/app-services-ui-shared';
import React, { useCallback } from 'react';
import { useAvailableProvidersAndDefault } from './api';

const CreateInstance: React.FunctionComponent<
  CreateInstanceProps & BaseModalProps
> = ({ hideModal }) => {
  const fetchAvailableProvidersAndDefault = useAvailableProvidersAndDefault();
  const onCreate = useCallback(function (
    onSuccess: () => void,
    onError: (error: CreateKafkaInstanceError) => void
  ): void {
    // TODO this
  },
  []);

  const getAvailableProvidersAndDefaults =
    useCallback(async (): Promise<InitializationData> => {
      return fetchAvailableProvidersAndDefault();
    }, []);

  return (
    <CreateKafkaInstance
      isModalOpen={true}
      onClickQuickStart={() => false}
      onCancel={hideModal}
      getAvailableProvidersAndDefaults={getAvailableProvidersAndDefaults}
      onCreate={onCreate}
    />
  );
};

export { CreateInstance };
export default CreateInstance;
