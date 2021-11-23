import { Chart, ChartArea, ChartAxis, ChartGroup, ChartLegend, ChartLegendTooltip, ChartThemeColor, ChartThreshold, ChartVoronoiContainer } from '@patternfly/react-charts';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import chart_color_black_500 from '@patternfly/react-tokens/dist/js/chart_color_black_500';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';

type ChartData = {
    areaColor: string;
    softLimitColor: string;
};

type LegendData = {
    name: string;
    symbol?: {
        fill?: string;
        type?: string;
    };
};


export const ChartClientConnections: FunctionComponent = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const { t } = useTranslation();

    const [width, setWidth] = useState<number>();

    const handleResize = () =>
        containerRef.current && setWidth(containerRef.current.clientWidth);
    const itemsPerRow = width && width > 650 ? 6 : 3;

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
    }, [width]);

    const { chartData, legendData } = getChartData(t('Client connections'),
        t('Limit'));

    return (
        <div ref={containerRef}>
            <Chart
                ariaTitle={t('metrics.client_connections')}
                containerComponent={<ChartVoronoiContainer
                    labels={({ datum }) => `${datum.name}: ${datum.y}`}
                    constrainToVisibleArea
                />}
                legendPosition='bottom-left'
                legendComponent={
                    <ChartLegend
                        orientation={'horizontal'}
                        data={legendData}
                        itemsPerRow={itemsPerRow}

                    />}
                height={350}
                padding={{
                    bottom: 110,
                    left: 90,
                    right: 60,
                    top: 25,
                }}
                themeColor={ChartThemeColor.multiUnordered}
                width={width}
                minDomain={{ y: 0 }}
                legendAllowWrap={true}>
                <ChartAxis label={'\n' + 'Time'} tickCount={6} />
                <ChartAxis
                    dependentAxis
                    tickCount={5}
                    label={'\n' + 'Client connections'}
                />
                <ChartGroup>
                    {chartData.map((value, index) => (
                        <ChartArea
                            key={`chart-area-${index}`}
                            interpolation='monotoneX'
                            style={{
                                data: {
                                    // TODO: check if this is needed
                                    // stroke: value.color,
                                },
                            }}
                        />
                    ))}
                </ChartGroup>
                <ChartThreshold
                    key={`chart-softlimit`}
                    style={{
                        data: {
                            stroke: chartData[0].softLimitColor,
                        },
                    }}
                />
            </Chart>

        </div>
    )

}

const getChartData = (
    lineLabel: string,
    limitLabel: string
) => {

    const areaColor = chart_color_blue_300.value;
    const softLimitColor = chart_color_black_500.value;

    const chartData: Array<ChartData> = [];

    const legendData: Array<LegendData> = [
        {
            name: limitLabel,
            symbol: { fill: chart_color_black_500.value, type: 'threshold' },
        },
        { name: lineLabel, symbol: { fill: chart_color_blue_300.value } },
    ];

    chartData.push({ areaColor, softLimitColor })



    return {
        legendData,
        chartData

    };

}