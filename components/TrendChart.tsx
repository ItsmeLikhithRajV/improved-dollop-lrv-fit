
import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { cn } from './ui';

export interface TrendDataPoint {
    date: string;
    value: number;
    label?: string;
}

interface TrendChartProps {
    data: TrendDataPoint[];
    title: string;
    color?: string;
    type?: 'line' | 'area';
    showGrid?: boolean;
    showBaseline?: boolean;
    baselineValue?: number;
    height?: number;
    valueFormatter?: (value: number) => string;
    className?: string;
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass rounded-lg px-3 py-2 border border-white/10 shadow-lg">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-white">
                    {formatter ? formatter(payload[0].value) : payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

export const TrendChart: React.FC<TrendChartProps> = ({
    data,
    title,
    color = 'hsl(var(--primary))',
    type = 'area',
    showGrid = true,
    showBaseline = false,
    baselineValue,
    height = 200,
    valueFormatter,
    className
}) => {
    // Format dates for display
    const formattedData = useMemo(() => {
        return data.map(d => ({
            ...d,
            displayDate: new Date(d.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })
        }));
    }, [data]);

    // Calculate average for baseline if not provided
    const baseline = useMemo(() => {
        if (baselineValue !== undefined) return baselineValue;
        if (!showBaseline) return undefined;
        const sum = data.reduce((acc, d) => acc + d.value, 0);
        return Math.round(sum / data.length);
    }, [data, baselineValue, showBaseline]);

    // Determine min/max for better visualization
    const { minVal, maxVal } = useMemo(() => {
        const values = data.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1 || 5;
        return {
            minVal: Math.max(0, Math.floor(min - padding)),
            maxVal: Math.ceil(max + padding)
        };
    }, [data]);

    const Chart = type === 'area' ? AreaChart : LineChart;
    const DataComponent = type === 'area' ? Area : Line;

    return (
        <div className={cn("p-4 glass rounded-xl", className)}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                {data.length > 0 && (
                    <div className="text-2xl font-bold" style={{ color }}>
                        {valueFormatter
                            ? valueFormatter(data[data.length - 1].value)
                            : data[data.length - 1].value
                        }
                    </div>
                )}
            </div>

            <ResponsiveContainer width="100%" height={height}>
                <Chart data={formattedData}>
                    {showGrid && (
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.05)"
                            vertical={false}
                        />
                    )}

                    <XAxis
                        dataKey="displayDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                        dy={10}
                    />

                    <YAxis
                        domain={[minVal, maxVal]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                        dx={-10}
                        width={30}
                    />

                    <Tooltip
                        content={<CustomTooltip formatter={valueFormatter} />}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />

                    {showBaseline && baseline !== undefined && (
                        <ReferenceLine
                            y={baseline}
                            stroke="rgba(255,255,255,0.2)"
                            strokeDasharray="5 5"
                            label={{
                                value: `Avg: ${baseline}`,
                                position: 'right',
                                fill: 'rgba(255,255,255,0.3)',
                                fontSize: 10
                            }}
                        />
                    )}

                    {type === 'area' ? (
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#gradient-${title.replace(/\s/g, '')})`}
                            dot={false}
                            activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: 'var(--background)' }}
                        />
                    ) : (
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: 'var(--background)' }}
                        />
                    )}

                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                </Chart>
            </ResponsiveContainer>
        </div>
    );
};

// Mini version for compact displays
export const MiniTrendChart: React.FC<{
    data: number[];
    color?: string;
    height?: number;
}> = ({ data, color = 'hsl(var(--primary))', height = 40 }) => {
    const chartData = data.map((value, i) => ({ value, idx: i }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData}>
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={1.5}
                    fill={color}
                    fillOpacity={0.1}
                    dot={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
