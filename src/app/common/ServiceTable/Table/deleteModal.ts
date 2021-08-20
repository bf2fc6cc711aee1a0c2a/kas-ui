import { TFunction } from 'i18next';
import { InstanceStatus } from '@app/modules/KasTable/config';

export type ConfigDetail = {
  title: string;
  confirmActionLabel: string;
  description: string;
};

export const getDeleteInstanceModalConfig = (
  t: TFunction,
  status: string | undefined,
  instanceName: string | undefined,
  isMaxCapacityReached?: boolean | undefined
): ConfigDetail => {
  const config: ConfigDetail = {
    title: '',
    confirmActionLabel: '',
    description: '',
  };
  /**
   * This is Onboarding changes
   * Todo: remove this change after public eval
   */
  const additionalMessage = isMaxCapacityReached
    ? ' You might not be able to create a new instance because all of them are currently provisioned by other users.'
    : '';

  if (status === InstanceStatus.READY) {
    config.title = `${t('delete_instance')}?`;
    config.confirmActionLabel = t('delete');
    config.description =
      t('delete_instance_status_complete', { instanceName }) +
      additionalMessage;
  } else if (
    status === InstanceStatus.ACCEPTED ||
    status === InstanceStatus.PROVISIONING ||
    status === InstanceStatus.PREPARING
  ) {
    config.title = `${t('delete_instance')}?`;
    config.confirmActionLabel = t('delete');
    config.description =
      t('delete_instance_status_accepted_or_provisioning', { instanceName }) +
      additionalMessage;
  }
  return config;
};
