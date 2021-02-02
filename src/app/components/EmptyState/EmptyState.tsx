import React from 'react';
import { Title, Button, EmptyState as PFEmptyState, EmptyStateIcon, EmptyStateBody } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useStoreContext, types, MODAL_TYPES } from '@app/context-state-reducer';

type EmptyStateProps = {
  mainToggle: boolean;
  refresh: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({ mainToggle, refresh }) => {
  const { t } = useTranslation();
  const { dispatch } = useStoreContext();
  const onCreateInstance = () => {
    dispatch({
      type: types.SHOW_MODAL,
      modalType: MODAL_TYPES.CREATE_KAFKA,
      modalProps: {
        refresh: refresh,
        mainToggle: mainToggle,
      },
    });
  };
  return (
    <>
      <PFEmptyState>
        <EmptyStateIcon icon={PlusCircleIcon} />
        <Title headingLevel="h4" size="lg">
          {t('you_do_not_have_any_kafka_instances_yet')}
        </Title>
        <EmptyStateBody>{t('create_a_kafka_instance_to_get_started')}</EmptyStateBody>
        <Button variant="primary" onClick={onCreateInstance}>
          {t('create_a_kafka_instance')}
        </Button>
      </PFEmptyState>
    </>
  );
};

export { EmptyState };
