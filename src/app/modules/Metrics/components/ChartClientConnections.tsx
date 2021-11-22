import { Chart, ChartAxis, ChartLegend, ChartLegendTooltip, ChartVoronoiContainer } from '@patternfly/react-charts';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import chart_color_black_500 from '@patternfly/react-tokens/dist/js/chart_color_black_500';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';

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

    const usageLimit = 500;

    const { legendData } = getChartData(t('Client connections'),
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

                    />}
                height={350}
                padding={{
                    bottom: 110,
                    left: 90,
                    right: 60,
                    top: 25,
                }} >
                <ChartAxis label={'\n' + 'Time'} tickCount={6} />
                <ChartAxis
                    dependentAxis
                    tickCount={5}
                    label={'\n' + 'Client connections'}
                />
            </Chart>

        </div>
    )

}

const getChartData = (
    lineLabel: string,
    limitLabel: string
) => {

    const legendData: Array<LegendData> = [
        {
            name: limitLabel,
            symbol: { fill: chart_color_black_500.value, type: 'threshold' },
        },
        { name: lineLabel, symbol: { fill: chart_color_blue_300.value } },
    ];

    return {
        legendData
    };

}