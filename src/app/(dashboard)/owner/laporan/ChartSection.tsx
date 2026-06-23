"use client";

import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

interface ChartSectionProps {
  revenueData: { date: string; pemasukan: number; pengeluaran: number }[];
  paymentMethods: { name: string; value: number }[];
}

export default function ChartSection({ revenueData, paymentMethods }: ChartSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Pemasukan vs Pengeluaran</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pemasukan" stroke="#10b981" strokeWidth={2} name="Pemasukan" />
            <Line type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={2} name="Pengeluaran" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Metode Pembayaran</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={paymentMethods.length > 0 ? paymentMethods : [{ name: "Belum ada data", value: 1 }]} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
              {paymentMethods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}