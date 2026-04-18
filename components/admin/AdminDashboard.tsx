"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"

interface AdminDashboardProps {
  adminStats: any
}

export function AdminDashboard({ adminStats }: AdminDashboardProps) {
  // Data untuk line chart - 7 hari terakhir
  const last7DaysData = [
    { day: "Sen", belajar: 120, penggunaBaru: 15, kosakata: 45 },
    { day: "Sel", belajar: 145, penggunaBaru: 22, kosakata: 52 },
    { day: "Rab", belajar: 132, penggunaBaru: 18, kosakata: 48 },
    { day: "Kam", belajar: 168, penggunaBaru: 25, kosakata: 61 },
    { day: "Jum", belajar: 156, penggunaBaru: 20, kosakata: 55 },
    { day: "Sab", belajar: 189, penggunaBaru: 35, kosakata: 72 },
    { day: "Min", belajar: 175, penggunaBaru: 28, kosakata: 65 },
  ]

  // Data untuk area chart - pertumbuhan pengguna per bulan
  const monthlyGrowthData = [
    { month: "Jan", users: 45, active: 38, mastered: 120 },
    { month: "Feb", users: 78, active: 62, mastered: 245 },
    { month: "Mar", users: 112, active: 89, mastered: 412 },
    { month: "Apr", users: 156, active: 124, mastered: 589 },
    { month: "Mei", users: 198, active: 156, mastered: 789 },
    { month: "Jun", users: 245, active: 198, mastered: 1023 },
  ]

  // Data untuk bar chart - level JLPT
  const levelMasteryData = [
    { level: "N5", mastered: 45, total: 80, percentage: 56 },
    { level: "N4", mastered: 32, total: 75, percentage: 43 },
    { level: "N3", mastered: 18, total: 70, percentage: 26 },
    { level: "N2", mastered: 8, total: 65, percentage: 12 },
    { level: "N1", mastered: 3, total: 60, percentage: 5 },
  ]

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-xs" style={{ color: p.color }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{adminStats?.study?.total_sessions || 0}</div>
            <p className="text-sm text-muted-foreground">Total Sesi Belajar</p>
            <div className="text-xs text-green-600 mt-2">↑ 12% dari minggu lalu</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{adminStats?.study?.mastered_items || 0}</div>
            <p className="text-sm text-muted-foreground">Kosakata Dihafal</p>
            <div className="text-xs text-blue-600 mt-2">↑ 8% dari minggu lalu</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{adminStats?.users?.total || 0}</div>
            <p className="text-sm text-muted-foreground">Total Pengguna</p>
            <div className="text-xs text-purple-600 mt-2">↑ 15% dari bulan lalu</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{adminStats?.study?.mastery_rate || 0}%</div>
            <p className="text-sm text-muted-foreground">Tingkat Penguasaan</p>
            <div className="text-xs text-orange-600 mt-2">↑ 5% dari minggu lalu</div>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart - Aktivitas 7 Hari */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Belajar 7 Hari Terakhir</CardTitle>
          <CardDescription>Jumlah sesi belajar, pengguna baru, dan kosakata yang dipelajari</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="day" stroke="#888888" />
              <YAxis stroke="#888888" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="belajar" 
                stroke="#4f46e5" 
                strokeWidth={2}
                dot={{ fill: "#4f46e5", strokeWidth: 2 }}
                name="Sesi Belajar"
              />
              <Line 
                type="monotone" 
                dataKey="penggunaBaru" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2 }}
                name="Pengguna Baru"
              />
              <Line 
                type="monotone" 
                dataKey="kosakata" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: "#f59e0b", strokeWidth: 2 }}
                name="Kosakata Dipelajari"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Area Chart - Pertumbuhan Pengguna */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pertumbuhan Pengguna</CardTitle>
            <CardDescription>Jumlah pengguna baru dan aktif per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1"
                  stroke="#4f46e5" 
                  fill="#4f46e5" 
                  fillOpacity={0.3}
                  name="Total Pengguna"
                />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                  name="Pengguna Aktif"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Level JLPT */}
        <Card>
          <CardHeader>
            <CardTitle>Tingkat Penguasaan per Level JLPT</CardTitle>
            <CardDescription>Jumlah kosakata yang dihafal per level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={levelMasteryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="level" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="mastered" fill="#4f46e5" name="Sudah Dihafal" />
                <Bar dataKey="total" fill="#e0e0e0" name="Total Kosakata" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Progress Ring Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tingkat Penguasaan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  stroke="#e0e0e0"
                />
                <circle
                  className="text-green-500 stroke-current"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  stroke="#10b981"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (adminStats?.study?.mastery_rate || 0) / 100)}`}
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="55" textAnchor="middle" className="text-2xl font-bold fill-current">
                  {adminStats?.study?.mastery_rate || 0}%
                </text>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mt-3">Rata-rata penguasaan materi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pengguna Terverifikasi</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  stroke="#e0e0e0"
                />
                <circle
                  className="text-blue-500 stroke-current"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  stroke="#3b82f6"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (adminStats?.users?.verified_percentage || 0) / 100)}`}
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="55" textAnchor="middle" className="text-2xl font-bold fill-current">
                  {adminStats?.users?.verified_percentage || 0}%
                </text>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {adminStats?.users?.verified || 0} / {adminStats?.users?.total || 0} pengguna
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rata-rata Streak</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  stroke="#e0e0e0"
                />
                <circle
                  className="text-orange-500 stroke-current"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  stroke="#f97316"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (adminStats?.users?.avg_streak || 0) / 30)}`}
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="55" textAnchor="middle" className="text-2xl font-bold fill-current">
                  {adminStats?.users?.avg_streak || 0}
                </text>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mt-3">Rata-rata streak harian</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}