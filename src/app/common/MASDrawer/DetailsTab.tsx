import React from 'react';
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

export type DetailsTabProps = {
  mainToggle?: boolean;
  detailsTabProps?: {
    textList?: Array<{ label?: string; value?: string }>;
    cardDetails?: Array<{
      title?: string;
      value?: any;
    }>;
  };
};

export const DetailsTab = ({ mainToggle, detailsTabProps }: DetailsTabProps) => {
  const { textList, cardDetails } = detailsTabProps || {};

  const renderCard = (cardInfo) => {
    const { title, value } = cardInfo;
    return (
      <Card isFlat>
        <CardBody>
          <TextContent>
            <Text component={TextVariants.small} className="pf-u-mb-0">
              {title}
            </Text>
            <Text component={TextVariants.h3} className="pf-u-mt-0">
              {value}
            </Text>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="mas--details__drawer--tab-content">
      {mainToggle && cardDetails && (
        <Grid className="mas--details__drawer--grid">
          <GridItem span={6} className="mas--details__drawer--grid--column-one">
            {renderCard(cardDetails[0])}
          </GridItem>
          <GridItem span={6}>{renderCard(cardDetails[1])}</GridItem>
        </Grid>
      )}
      <TextContent>
        <TextList component={TextListVariants.dl}>
          {textList?.map((item) => {
            const { label, value } = item;
            return (
              <>
                {value && (
                  <>
                    <TextListItem component={TextListItemVariants.dt}>{label}</TextListItem>
                    <TextListItem component={TextListItemVariants.dd}>{value}</TextListItem>
                  </>
                )}
              </>
            );
          })}
        </TextList>
      </TextContent>
    </div>
  );
};
