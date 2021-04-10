import React from 'react';
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
import { useTranslation } from 'react-i18next';

const DrawerPanelContentInfo = () => {
  const { t } = useTranslation();

  return (
    <TextContent>
      <Text component={TextVariants.h3}>{t('common.instance_information')}</Text>
      <TextList component={TextListVariants.dl}>
        <Grid sm={6} lg={12} hasGutter>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.duration')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>48 hours</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.ingress_egress')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>up to 2 MB/s each</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.storage')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>up to 60 GB</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.partitions')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>up to 100</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.client_connections')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>up to 100</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.client_attempts')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>up to 50/s</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.message_size')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>up to 1 MB</TextListItem>
          </GridItem>
        </Grid>
        <Button isSmall isInline variant={ButtonVariant.link} style={{ marginTop: '20px' }}>
          {t('common.quick_start_guide_message')}
        </Button>
      </TextList>
    </TextContent>
  );
};

export { DrawerPanelContentInfo };
