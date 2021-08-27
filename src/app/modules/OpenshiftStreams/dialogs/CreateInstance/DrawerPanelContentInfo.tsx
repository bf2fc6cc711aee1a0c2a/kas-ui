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
  isKasTrial?: boolean;
};

const DrawerPanelContentInfo: React.FC<DrawerPanelContentInfoProps> = ({ isKasTrial }) => {
  const { t } = useTranslation();
  const qsContext: QuickStartContextValues = React.useContext(QuickStartContext);

  return (
    <TextContent>
      <Text component={TextVariants.h3}>{t('common.instance_information')}</Text>
      <TextList component={TextListVariants.dl}>
        <Grid sm={6} lg={12} hasGutter>
          {isKasTrial && (
            <GridItem>
              <TextListItem component={TextListItemVariants.dt}>{t('common.duration')}</TextListItem>
              <TextListItem component={TextListItemVariants.dd}>{t('common.duration_value')}</TextListItem>
            </GridItem>
          )}
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.ingress_egress')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>{t('common.ingress_egress_value')}</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.storage')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>{t('common.storage_value')}</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.partitions')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>{t('common.partitions_value')}</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.client_connections')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>{t('common.client_connections_value')}</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.connection_rate')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>{t('common.connection_rate_value')}</TextListItem>
          </GridItem>
          <GridItem>
            <TextListItem component={TextListItemVariants.dt}>{t('common.message_size')}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>{t('common.message_size_value')}</TextListItem>
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
