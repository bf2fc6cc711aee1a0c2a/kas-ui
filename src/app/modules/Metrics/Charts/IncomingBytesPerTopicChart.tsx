import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bullseye,
  Card,
  CardTitle,
  CardBody,
  Spinner
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
import { ChartEmptyState } from './ChartEmptyState';

type ChartData = {
  color: string
  line: TopicChartData[]
}

type TopicChartData = {
  name: string
  x: string
  y: number 
}

type LegendData = {
  name: string
  symbol: {}
}

type KafkaInstanceProps = {
  chartData: ChartData[]
  legend: LegendData[]
  byteSize: string
  maxValueInDataSets: number
  metricsDataUnavailable: boolean
  chartDataLoading: boolean
}

export const IncomingBytesPerTopicChart: React.FC<KafkaInstanceProps> = ({chartData, legend, byteSize, maxValueInDataSets, metricsDataUnavailable, chartDataLoading, noTopics}: KafkaInstanceProps) => {

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
        <CardTitle component="h2">
          {t('metrics.incoming_bytes_per_topic')}
        </CardTitle>
        <CardBody>
          <div ref={containerRef}>
            <div>
            { !chartDataLoading ? (
              !metricsDataUnavailable ? (
                !noTopics ? (
                chartData && legend && byteSize && maxValueInDataSets &&
                <Chart
                  ariaDesc={t('metrics.incoming_bytes_per_topic')}
                  ariaTitle="Incoming bytes"
                  containerComponent={
                    <ChartVoronoiContainer
                      labels={({ datum }) => `${datum.name}: ${datum.y}`}
                      constrainToVisibleArea
                    />
                  }
                  legendAllowWrap={true}
                  legendPosition="bottom-left"
                  legendComponent={
                    <ChartLegend
                      data={legend}
                      itemsPerRow={itemsPerRow}
                    />
                  }
                  height={300}
                  padding={{
                    bottom: 110,
                    left: 90,
                    right: 30,
                    top: 25
                  }}
                  themeColor={ChartThemeColor.multiUnordered}
                  width={width}
                >
                  <ChartAxis label={'Time'} tickCount={6} />
                  <ChartAxis
                    dependentAxis
                    tickFormat={(t) => `${Math.round(t)} ${byteSize}/s`}
                    tickCount={4}
                    domain={{ y: [0, maxValueInDataSets]}}
                    minDomain={{ y: 0 }}

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
                    <ChartEmptyState
                      title="No topics yet"
                      body="Data will show when topics exist and are in use."
                      noTopics
                    />
                    )
                ) : (
                  <ChartEmptyState
                    title="No data"
                    body="We’re creating your Kafka instance, so some details aren’t yet available."
                    noData
                  />
              )
            ) : (
              <Bullseye>
                <Spinner isSVG/>
              </Bullseye>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
