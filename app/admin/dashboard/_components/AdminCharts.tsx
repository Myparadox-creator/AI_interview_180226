"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

interface AdminChartsProps {
    type: 'bar' | 'pie';
    data: any[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e'];

const darkTooltipStyle = {
    backgroundColor: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

export function AdminCharts({ type, data }: AdminChartsProps) {
    if (type === 'bar') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        dy={8}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <Tooltip
                        contentStyle={darkTooltipStyle}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        labelStyle={{ color: '#9ca3af' }}
                    />
                    <Bar
                        dataKey="count"
                        fill="url(#barGradient)"
                        radius={[6, 6, 0, 0]}
                        barSize={36}
                    />
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        );
    }

    if (type === 'pie') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="rgba(0,0,0,0.3)"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={darkTooltipStyle} labelStyle={{ color: '#9ca3af' }} />
                    <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    return null;
}
