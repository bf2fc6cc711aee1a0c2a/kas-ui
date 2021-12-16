import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';
import { useInstanceDrawer } from '@app/modules/InstanceDrawer/contexts/InstanceDrawerContext';

export const DetailsTab: React.FunctionComponent = () => {
  const { instanceDrawerInstance } = useInstanceDrawer();
  dayjs.extend(localizedFormat);
  const { t } = useTranslation(['kasTemporaryFixMe']);
  const { id, owner, created_at, updated_at } = instanceDrawerInstance || {};

  const renderTextListItem = (title: string, value?: string) =>
    value && (
      <>
        <TextListItem component={TextListItemVariants.dt}>{title}</TextListItem>
        <TextListItem component={TextListItemVariants.dd}>{value}</TextListItem>
      </>
    );

  return (
    <div className='mas--details__drawer--tab-content'>
      <TextContent>
        <TextList component={TextListVariants.dl}>
          {renderTextListItem(t('cloud_provider'), t('amazon_web_services'))}
          {renderTextListItem(
            t('region'),
            t(instanceDrawerInstance?.region || '')
          )}
          {renderTextListItem(t('id'), id)}
          {renderTextListItem(t('owner'), owner)}
          {renderTextListItem(t('created'), dayjs(created_at).format('LLLL'))}
          {renderTextListItem(t('updated'), dayjs(updated_at).format('LLLL'))}
        </TextList>
      </TextContent>
    </div>
  );
};

export default DetailsTab;
