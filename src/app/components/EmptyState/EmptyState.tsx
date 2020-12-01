import React from 'react';
import { Title, Button, EmptyState as PFEmptyState, EmptyStateIcon, EmptyStateBody } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

type EmptyStateProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
};

const EmptyState = ({ createStreamsInstance, setCreateStreamsInstance, mainToggle }: EmptyStateProps) => {
  const { t } = useTranslation();
  return (
    <>
      <PFEmptyState>
        <EmptyStateIcon icon={PlusCircleIcon} />
        <Title headingLevel="h4" size="lg">
          {t("You don't have any Streams instances yet")}
        </Title>
        <EmptyStateBody>{t('Create a Streams instance to get started')}</EmptyStateBody>
        <Button variant="primary" onClick={() => setCreateStreamsInstance(!createStreamsInstance)}>
          {t('Create a Streams Instance')}
        </Button>
      </PFEmptyState>
    </>
  );
};

export { EmptyState };
