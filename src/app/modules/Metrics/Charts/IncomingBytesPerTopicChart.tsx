import React, {useState, useEffect, useRef} from 'react';
import {
  Chart,
  ChartLine,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartThemeColor,
  ChartThreshold,
  ChartVoronoiContainer
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/js/chart_color_orange_300';
import chart_color_green_300 from '@patternfly/react-tokens/dist/js/chart_color_green_300';
import chart_color_blue_500 from '@patternfly/react-tokens/dist/js/chart_color_blue_500';
import chart_color_orange_500 from '@patternfly/react-tokens/dist/js/chart_color_orange_500';
import chart_color_green_500 from '@patternfly/react-tokens/dist/js/chart_color_green_500';
import chart_color_blue_100 from '@patternfly/react-tokens/dist/js/chart_color_blue_100';
import chart_color_orange_100 from '@patternfly/react-tokens/dist/js/chart_color_orange_100';
import chart_color_green_100 from '@patternfly/react-tokens/dist/js/chart_color_green_100';
import chart_color_black_300 from '@patternfly/react-tokens/dist/js/chart_color_black_300';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export type Topics = {
  name: string
  data: {
    count: number
    timestamp: number
  }[]
}

export type ChartData = {
  color: string
  softLimitColor: string
  area: BrokerChartData[]
  softLimit: BrokerChartData[]
}

export type BrokerChartData = {
  name: string
  x: string
  y: number 
}

export type LegendData = {
  name: string
  symbol: {}
}

export type AvailableDiskSpaceChartProps = {
  topicBytes: Topics[]
}

export const IncomingBytesPerTopicChart = (topicBytes: AvailableDiskSpaceChartProps) => {

  console.log('what is topics' + JSON.stringify(topicBytes));

  const containerRef = useRef();

  const { t } = useTranslation();
  const [width, setWidth] = useState();
  const [legend, setLegend] = useState([])
  const [chartData, setChartData] = useState<ChartData[]>([] as ChartData[]);
  const itemsPerRow = 4;

  const colors = [chart_color_blue_300.value, chart_color_orange_300.value, chart_color_green_300.value];
  const softLimitColors = [chart_color_blue_100.value, chart_color_orange_100.value, chart_color_green_100.value];

  const handleResize = () => containerRef.current && setWidth(containerRef.current.clientWidth);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, [width]);

  useEffect(() => {
    getChartData();
  }, []);

  const getChartData = () => {
    let legendData: Array<LegendData> = [{name: 'Limit', symbol: { fill: chart_color_black_300.value, type: 'threshold'}}];
    let chartData: Array<ChartData> = [];
  
    topicBytes.topicBytes.map((topic, index) => {
      console.log('HELLO what is topic' + JSON.stringify(topic));
      const color = colors[index];

      let line: Array<BrokerChartData> = [];
      topic.data.map(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        const bytes = value.count;
        console.log('what is bytes' + bytes);
        line.push({ name: topic.name, x: time, y: bytes });
      });
      chartData.push({ color, line });
    });
    setLegend(legendData);
    setChartData(chartData);
  }

    return (
      <>
      {chartData && legend && (
        <div ref={containerRef}>
          <Chart
            ariaDesc={t('metrics.incoming_bytes_per_topic')}
            ariaTitle="Bytes per topic"
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
              bottom: 80, // Adjusted to accomodate legend
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
              tickFormat={(t) => `${Math.round(t)} B/s`}
            />
            <ChartGroup>
              {chartData.map((value, index) => (
                <ChartLine
                  key={`chart-area-${index}`}
                  data={value.area}
                  style={{
                    data: {
                      stroke: value.color
                    }
                  }}
                />
              ))}
            </ChartGroup>
            {chartData.map((value, index) => (
              <ChartThreshold
                key={`chart-softlimit-${index}`}
                data={value.softLimit}
                style={{
                  data: {
                    stroke: value.softLimitColor
                  }
                }}
              />
            ))}
          </Chart>
        </div>
        )}
      </>
    );
  }
