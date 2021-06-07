import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Grid,
  GridItem,
  TextContent,
  Text,
  TextVariants,
  TextList,
  TextListItem,
  TextListVariants,
  TextListItemVariants,
} from '@patternfly/react-core';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

export type DetailsTabProps = {
  mainToggle?: boolean;
  instanceDetail?: KafkaRequest;
};

export const DetailsTab: React.FunctionComponent<DetailsTabProps> = ({
  mainToggle,
  instanceDetail,
}: DetailsTabProps) => {
  dayjs.extend(localizedFormat);
  const { t } = useTranslation();
  const { id, owner, created_at, updated_at } = instanceDetail || {};

  const renderTextListItem = (title: string, value?: string) =>
    value && (
      <>
        <TextListItem component={TextListItemVariants.dt}>{title}</TextListItem>
        <TextListItem component={TextListItemVariants.dd}>{value}</TextListItem>
      </>
    );

  return (
    <div className="mas--details__drawer--tab-content">
      {mainToggle && (
        <Grid className="mas--details__drawer--grid">
          <GridItem span={6} className="mas--details__drawer--grid--column-one">
            <Card isFlat>
              <CardBody>
                <TextContent>
                  <Text component={TextVariants.small} className="pf-u-mb-0">
                    {t('topics')}
                  </Text>
                  <Text component={TextVariants.h3} className="pf-u-mt-0">
                    10
                  </Text>
                </TextContent>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={6}>
            <Card isFlat>
              <CardBody>
                <TextContent>
                  <Text component={TextVariants.small} className="pf-u-mb-0">
                    {t('consumer_groups')}
                  </Text>
                  <Text component={TextVariants.h3} className="pf-u-mt-0">
                    8
                  </Text>
                </TextContent>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      )}
      <TextContent>
        <TextList component={TextListVariants.dl}>
          {renderTextListItem(t('cloud_provider'), t('amazon_web_services'))}
          {renderTextListItem(t('region'), t('us_east_north_virginia'))}
          {renderTextListItem(t('id'), id)}
          {renderTextListItem(t('owner'), owner)}
          {renderTextListItem(t('created'), dayjs(created_at).format('LLLL'))}
          {renderTextListItem(t('updated'), dayjs(updated_at).format('LLLL'))}
        </TextList>
      </TextContent>
    </div>
  );
};
