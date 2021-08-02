import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  TextContent,
  Text,
  TextVariants,
  TextList,
  TextListVariants,
  TextListItem,
  TextListItemVariants,
  Grid,
  GridItem,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import { QuickStartContext, QuickStartContextValues } from '@cloudmosaic/quickstarts';

export type DrawerPanelContentInfoProps = {
  isTrialQuota?: boolean;
};

const DrawerPanelContentInfo: React.FC<DrawerPanelContentInfoProps> = ({ isTrialQuota }) => {
  const { t } = useTranslation();
  const qsContext: QuickStartContextValues = React.useContext(QuickStartContext);

  return (
    <TextContent>
      <Text component={TextVariants.h3}>{t('common.instance_information')}</Text>
      <TextList component={TextListVariants.dl}>
        <Grid sm={6} lg={12} hasGutter>
          {isTrialQuota && (
            <GridItem>
              <TextListItem component={TextListItemVariants.dt}>{t('common.duration')}</TextListItem>
              <TextListItem component={TextListItemVariants.dd}>48 hours</TextListItem>
            </GridItem>
          )}
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.ingress_egress')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>up to 30 MB/second each</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.storage')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>up to 1000 GB</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.partitions')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>up to 500</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.client_connections')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>up to 500</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.connection_rate')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>up to 100 connections/second</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.message_size')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>up to 1 MB</TextListItem>
          </GridItem>
        </Grid>
        <Button
          isSmall
          isInline
          variant={ButtonVariant.link}
          style={{ marginTop: '20px' }}
          onClick={() => qsContext.setActiveQuickStart && qsContext.setActiveQuickStart('getting-started')}
        >
          {t('common.quick_start_guide_message')}
        </Button>
      </TextList>
    </TextContent>
  );
};

export { DrawerPanelContentInfo };
