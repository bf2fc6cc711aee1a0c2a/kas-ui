import { KafkaRequest } from '@rhoas/kafka-management-sdk';
import React from 'react';
import { Alert } from '@patternfly/react-core';
import dayjs from 'dayjs';

export type PreviewAlertProps = {
  previewKafkaInstance: KafkaRequest | undefined;
};

/**
 * Todo: remove after summit
 */
export const PreviewAlert: React.FunctionComponent<PreviewAlertProps> = ({
  previewKafkaInstance,
}) => {
  if (previewKafkaInstance) {
    return (
      <Alert
        variant='info'
        isInline
        title={`${previewKafkaInstance?.name} was created on ${dayjs(
          previewKafkaInstance?.created_at
        ).format('LLLL')}`}
        className='pf-u-mt-lg'
      >
        This preview instance will expire 48 hours after creation.
      </Alert>
    );
  }
  return <></>;
};
