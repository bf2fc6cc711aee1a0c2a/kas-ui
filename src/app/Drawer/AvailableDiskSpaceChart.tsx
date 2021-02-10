import React from 'react';
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
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/js/chart_color_orange_300';
import chart_color_green_300 from '@patternfly/react-tokens/dist/js/chart_color_green_300';
import chart_color_blue_500 from '@patternfly/react-tokens/dist/js/chart_color_blue_500';
import chart_color_orange_500 from '@patternfly/react-tokens/dist/js/chart_color_orange_500';
import chart_color_green_500 from '@patternfly/react-tokens/dist/js/chart_color_green_500';
import chart_color_blue_100 from '@patternfly/react-tokens/dist/js/chart_color_blue_100';
import chart_color_orange_100 from '@patternfly/react-tokens/dist/js/chart_color_orange_100';
import chart_color_green_100 from '@patternfly/react-tokens/dist/js/chart_color_green_100';
import { format } from 'date-fns';

export type Broker = {
  name: string

  data: {
    timestamp: number
    usedSpace: number
    softLimit: number
    hardLimit: number
  }[]
}

export type AvailableDiskSpaceChartProps = {
  brokers: Broker[]
}

export class AvailableDiskSpaceChart extends React.Component<AvailableDiskSpaceChartProps> {
  private readonly handleResize: () => void;
  private readonly containerRef: any;

  constructor(props: AvailableDiskSpaceChartProps) {
    super(props);
    this.containerRef = React.createRef();
    this.state = {
      width: 0
    };
    this.handleResize = () => {
      if (this.containerRef.current && this.containerRef.current.clientWidth) {
        this.setState({ width: this.containerRef.current.clientWidth });
      }
    };
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {

    const legend = [] as any[];
    const chartData = [] as any[];

    const colors = [chart_color_blue_300.value, chart_color_orange_300.value, chart_color_green_300.value];
    const softLimitColors = [chart_color_blue_100.value, chart_color_orange_100.value, chart_color_green_100.value];
    const hardLimitColors = [chart_color_blue_500.value, chart_color_orange_500.value, chart_color_green_500.value];


    this.props.brokers.forEach((broker, index) => {
      const color = colors[index];
      const softLimitColor = softLimitColors[index];
      const hardLimitColor = hardLimitColors[index];
      legend.push({
        name: broker.name,
        symbol: {
          fill: color
        }
      });
      const softLimitName = `${broker.name} limit`;
      legend.push({
        name: softLimitName,
        symbol: {
          type: 'threshold',
          fill: softLimitColor
        }
      });
      const hardLimitName = `${broker.name} hard limit`;
      legend.push({
        name: hardLimitName,
        symbol: {
          type: 'threshold',
          fill: hardLimitColor
        }
      });
      const area = [] as any[];
      const softLimit = [] as any[];
      const hardLimit = [] as any[];
      broker.data.forEach(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        area.push({ name: broker.name, x: time, y: value.usedSpace / 1024 / 1024 / 1024 });
        softLimit.push({ name: softLimitName, x: time, y: value.softLimit / 1024 / 1024 / 1024 });
        hardLimit.push({ name: hardLimitName, x: time, y: value.hardLimit / 1024 / 1024 / 1024 });
      });
      chartData.push({ color, softLimitColor, hardLimitColor, area, softLimit, hardLimit });
    });

    const { width } = this.state;
    const itemsPerRow = width > 650 ? 6 : 3;

    return (
      <div ref={this.containerRef}>
        <div style={{ height: '350px' }}>
          <Chart
            ariaDesc="Disk Space available in your Kafka brokers"
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
                orientation={'vertical'}
                data={legend}
                itemsPerRow={itemsPerRow}
              />
            }
            height={350}
            padding={{
              bottom: 160, // Adjusted to accomodate legend
              left: 70,
              right: 50,
              top: 50
            }}
            themeColor={ChartThemeColor.multiUnordered}
            width={width}
          >
            <ChartAxis label={'time'} tickCount={6} />
            <ChartAxis label={'Gi'} dependentAxis showGrid />
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
      </div>
    );
  }
}
