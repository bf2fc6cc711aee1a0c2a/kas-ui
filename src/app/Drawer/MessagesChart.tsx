import React from 'react';
import { Chart, ChartAxis, ChartGroup, ChartLine, ChartThemeColor, ChartLegendTooltip, ChartVoronoiContainer, createContainer } from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/js/chart_color_orange_300';
import chart_color_green_300 from '@patternfly/react-tokens/dist/js/chart_color_green_300';
import { format } from 'date-fns';

export type Topic = {
  name: string

  data: {
    timestamp: number
    count: number
  }[]
}

export type MessagesChartProps = {
  topics: Topic[]
}

export class MessagesChart extends React.Component<MessagesChartProps> {
  render() {
    // Note: Container order is important
    const CursorVoronoiContainer = createContainer("voronoi", "cursor");

    const legendData = [] as any[];
    const chartData = [] as any[];

    this.props.topics.forEach(topic => {
      legendData.push({name: topic.name});

      const messages = topic.data.map(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        return {
          x: time,
          y: value.count,
          name: topic.name
        }
      });
      chartData.push(messages);
    });

    console.log(this.props.topics);

    return (
      <div style={{ height: '300x', width: '450px' }}>
        <Chart
          ariaDesc="Messages in to a topic"
          ariaTitle="Messages in"
          containerComponent={
            <CursorVoronoiContainer
              cursorDimension="x"
              labels={({ datum }) => `${datum.y}`}
              labelComponent={<ChartLegendTooltip legendData={legendData} title={(datum) => datum.x}/>}
              mouseFollowTooltips
              voronoiDimension="x"
              voronoiPadding={50}
            />
          }
          legendData={legendData}
          legendPosition="bottom"
          height={300}
          maxDomain={{y: 10}}
          minDomain={{y: 0}}
          padding={{
            bottom: 100, // Adjusted to accommodate legend
            left: 70,
            right: 50,
            top: 50
          }}
          themeColor={ChartThemeColor.green}
          width={450}
        >
          <ChartAxis label='time' tickCount={6} />
          <ChartAxis dependentAxis showGrid label={'messages'} />
          <ChartGroup>
            {chartData.map((value, index) => (
              <ChartLine data={value} key={`chart-messages-${index}`}/>
            ))}
          </ChartGroup>
        </Chart>
      </div>
    );
  }
}
