import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", employees: 18 },
  { month: "Feb", employees: 25 },
  { month: "Mar", employees: 33 },
  { month: "Apr", employees: 41 },
  { month: "May", employees: 55 },
  { month: "Jun", employees: 67 },
  { month: "Jul", employees: 78 },
  { month: "Aug", employees: 89 },
];

function EmployeeGrowthChart() {
  return (
  <div
className="
bg-white
rounded-3xl
shadow-xl
border
border-gray-100
p-8
w-full
">

      <div className="flex justify-between items-start mb-6">

    <div>

        <h2 className="text-2xl font-bold text-gray-800">
            Employee Growth
        </h2>

        <p className="text-sm text-gray-500 mt-1">
            Monthly Hiring Trend
        </p>

    </div>

    <select className="border rounded-lg px-3 py-2 text-sm">

        <option>Last 12 Months</option>

        <option>Last 6 Months</option>

        <option>This Year</option>

    </select>

</div>

      <div style={{ width: "100%", height: 200 }}>

        <ResponsiveContainer>

          <LineChart data={data}>
<CartesianGrid
stroke="#E5E7EB"
strokeDasharray="5 5"
/>
<XAxis
dataKey="month"
axisLine={false}
tickLine={false}
/>
<YAxis
axisLine={false}
tickLine={false}
/>

            <Tooltip
contentStyle={{
    background:"#fff",
    border:"none",
    borderRadius:"12px",
    boxShadow:"0 10px 30px rgba(0,0,0,.15)"
}}
/>

           <Line
    type="monotone"
    dataKey="employees"
    stroke="#2563eb"
    strokeWidth={4}
    dot={{
        r:6,
        fill:"#2563eb",
        stroke:"#fff",
        strokeWidth:3
    }}
    activeDot={{
        r:9
    }}
    animationDuration={1800}
/>


          </LineChart>
          

        </ResponsiveContainer>

      </div>
      <div className="mt-6 flex justify-between">

<div>

<p className="text-sm text-green-600 font-semibold">

▲ Hiring increased 14%

</p>

<p className="text-xs text-gray-500">

Compared to previous month

</p>

</div>

</div>

    </div>
  );
}


export default EmployeeGrowthChart;