import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card,
  CardTitle,
  CardBody,
  Spinner,
  Bullseye
} from '@patternfly/react-core';
import {
  Chart,
  ChartLine,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartThemeColor,
  ChartVoronoiContainer
} from '@patternfly/react-charts';

export type Topic = {
  name: string
  data: {
    name: string
    timestamp: number
    bytes: number
  }[]
}

export type ChartDataOutgoing = {
  color: string
  line: TopicChartDataOutgoing[]
}

export type TopicChartDataOutgoing = {
  name: string
  x: string
  y: number 
}

export type LegendData = {
  name: string
  symbol: {}
}

export type KafkaInstanceProps = {
  chartData: ChartDataOutgoing[]
  legend: LegendData[]
  byteSize: string
  maxValueInDataSets: number
}

export const OutgoingBytesPerTopicChart: React.FC<KafkaInstanceProps> = ({chartData, legend, byteSize, maxValueInDataSets}: KafkaInstanceProps) => {

  const containerRef = useRef();
  const { t } = useTranslation();
  const [width, setWidth] = useState();

  const handleResize = () => containerRef.current && setWidth(containerRef.current.clientWidth);
  const itemsPerRow = width && width > 650 ? 6 : 3;

  useEffect(() => {
    handleResize();
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, [width]);


  return (
    <Card>
      <CardTitle>
        {t('metrics.outgoing_bytes_per_topic')}
      </CardTitle>
      <CardBody>
        <div ref={containerRef}>
          {chartData && legend && width && byteSize ? (
            <Chart
              ariaDesc={t('metrics.outgoing_bytes_per_topic')}
              ariaTitle="Outgoing bytes"
              containerComponent={
                <ChartVoronoiContainer
                  labels={({ datum }) => `${datum.name}: ${datum.y}`}
                  constrainToVisibleArea
                />
              }
              legendPosition="bottom-left"
              legendComponent={
                <ChartLegend
                  data={legend}
                  itemsPerRow={itemsPerRow}
                />
              }
              height={300}
              padding={{
                bottom: 80,
                left: 90,
                right: 30,
                top: 25
              }}
              themeColor={ChartThemeColor.multiUnordered}
              width={width}
            >
              <ChartAxis label={'Time'} tickCount={5} />
              <ChartAxis
                dependentAxis
                tickFormat={(t) => `${Math.round(t)} ${byteSize}/s`}
                tickCount={4}
                domain={{ y: [0, maxValueInDataSets]}}
              />
              <ChartGroup>
                {chartData.map((value, index) => (
                  <ChartLine
                    key={`chart-line-${index}`}
                    data={value.line}
                    style={{
                      data: {
                        stroke: value.color
                      }
                    }}
                  />
                ))}
              </ChartGroup>
            </Chart>
            ) : (
              <Bullseye>
                <Spinner isSVG/>
              </Bullseye>
            )
            }
        </div>
      </CardBody>
    </Card>
  );
}
