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

type Topic = {
  name: string
  data: {
    name: string
    timestamp: number
    bytes: number
  }[]
}

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
}

export const IncomingBytesPerTopicChart: React.FC<KafkaInstanceProps> = ({chartData, legend, byteSize, maxValueInDataSets}: KafkaInstanceProps) => {

  const containerRef = useRef();
  const { t } = useTranslation();
  const [width, setWidth] = useState();

  const handleResize = () => containerRef.current && setWidth(containerRef.current.clientWidth);

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
          {t('metrics.incoming_bytes_per_topic')}
        </CardTitle>
        <CardBody>
          <div ref={containerRef}>
            <div>
            {chartData && legend && width && byteSize ? (
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
                    orientation="horizontal"
                    height={400}
                    // itemsPerRow={3}
                    gutter={20}
                  />
                }
                height={300}
                padding={{
                  bottom: 80,
                  left: 60,
                  right: 0,
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
            )}
            </div>
            </div>
          </CardBody>
        </Card>
  );
}
