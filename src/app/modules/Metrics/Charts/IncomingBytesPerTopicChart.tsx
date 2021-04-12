import React, {useState, useEffect, useRef} from 'react';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartThemeColor,
  ChartThreshold,
  ChartVoronoiContainer
} from '@patternfly/react-charts';

export const IncomingBytesPerTopicChart = () => {

  const { t } = useTranslation();
  const [width, setWidth] = useState();
  const [legend, setLegend] = useState();
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    getChartData();
  }, []);

  const getChartData = () => {
    let legendData: Array<LegendData> = [{name: 'Limit', symbol: { fill: chart_color_black_300.value, type: 'threshold'}}];
    let chartData: Array<ChartData> = [];
  
      const color = colors[0];
      const softLimitColor = softLimitColors[0];
      const hardLimitColor = chart_color_black_300.value;
      const softLimitName = `${brokersData.name} limit`;
      const hardLimitName = `${brokersData.name} hard limit`;

      legendData.push({
        name: brokersData.name.charAt(0).toUpperCase() + brokersData.name.slice(1),
        symbol: {
          fill: color
        }
      });

      // legendData.push({
      //   name: softLimitName,
      //   symbol: {
      //     type: 'threshold',
      //     fill: softLimitColor
      //   }
      // });
      // legendData.push({
      //   name: hardLimitName,
      //   symbol: {
      //     type: 'threshold',
      //     fill: hardLimitColor
      //   }
      // });
      let area: Array<BrokerChartData> = [];
      let softLimit: Array<BrokerChartData> = [];
      let hardLimit: Array<BrokerChartData> = [];
      brokersData.data.map(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        area.push({ name: brokersData.name, x: time, y: value.usedSpace / 1024 / 1024 / 1024 });
        softLimit.push({ name: softLimitName, x: time, y: value.softLimit / 1024 / 1024 / 1024 });
        hardLimit.push({ name: hardLimitName, x: time, y: value.hardLimit / 1024 / 1024 / 1024 });
      });
      chartData.push({ color, softLimitColor, hardLimitColor, area, softLimit, hardLimit });
    setLegend(legendData);
    setChartData(chartData);
  }

  return (
  <>
    {chartData && legend && (
      <div ref={containerRef}>
        <Chart
          ariaDesc={t('metrics.available_disk_space_per_broker')}
          ariaTitle="Disk Space"
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
            tickFormat={(t) => `${Math.round(t)} Gi`}
          />
          <ChartGroup>
            {chartData.map((value, index) => (
              <ChartArea
                key={`chart-area-${index}`}
                data={value.area}
                interpolation="monotoneX"
                style={{
                  data: {
                    stroke: value.color
                  }
                }}
              />
            ))}
          </ChartGroup>
          {/* {chartData.map((value, index) => (
            <ChartThreshold
              key={`chart-softlimit-${index}`}
              data={value.softLimit}
              style={{
                data: {
                  stroke: value.softLimitColor
                }
              }}
            />
          ))} */}
          {chartData.map((value, index) => (
            <ChartThreshold
              key={`chart-hardlimit-${index}`}
              data={value.hardLimit}
              style={{
                data: {
                  stroke: value.hardLimitColor
                }
              }}
            />
          ))}
        </Chart>
      </div>
      )}
    </>
  )
}
