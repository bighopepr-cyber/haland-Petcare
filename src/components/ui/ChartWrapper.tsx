"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const RechartsComponents = dynamic(
  () => import("recharts").then((mod) => ({
    LineChart: mod.LineChart,
    BarChart: mod.BarChart,
    PieChart: mod.PieChart,
    ResponsiveContainer: mod.ResponsiveContainer,
    Line: mod.Line,
    Bar: mod.Bar,
    Pie: mod.Pie,
    Cell: mod.Cell,
    XAxis: mod.XAxis,
    YAxis: mod.YAxis,
    CartesianGrid: mod.CartesianGrid,
    Tooltip: mod.Tooltip,
    Legend: mod.Legend,
  })),
  { ssr: false, loading: () => <div className="h-[300px] animate-pulse rounded-lg bg-gray-100" /> }
);

export function ChartSkeleton() {
  return <div className="h-[300px] animate-pulse rounded-lg bg-gray-100" />;
}

export default RechartsComponents;