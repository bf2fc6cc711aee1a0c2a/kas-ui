import React from 'react';
import { Title, Button, EmptyState as PFEmptyState, EmptyStateIcon, EmptyStateBody } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

type EmptyStateProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
};

const EmptyState: React.FC<EmptyStateProps> = ({ createStreamsInstance, setCreateStreamsInstance }) => {
  const { t } = useTranslation();
  const onCreate = () => {
    setCreateStreamsInstance(!createStreamsInstance);
  };
  return (
    <>
      <PFEmptyState>
        <EmptyStateIcon icon={PlusCircleIcon} />
        <Title headingLevel="h4" size="lg">
          {t('you_do_not_have_any_streams_instances_yet')}
        </Title>
        <EmptyStateBody>{t('create_a_streams_instance_to_get_started')}</EmptyStateBody>
        <Button variant="primary" onClick={onCreate}>
          {t('create_a_streams_instance')}
        </Button>
      </PFEmptyState>
    </>
  );
};

export { EmptyState };
