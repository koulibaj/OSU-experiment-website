import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

interface Experiment {
  name: string;
  duration?: number;
  estimatedTime: number;
}

interface DashboardProps {
  experiments: Experiment[];
}

export default function Dashboard({ experiments }: DashboardProps) {
  const completed = experiments.filter(e => e.duration !== undefined);

  const data = completed.map(e => ({
    name: e.name,
    actual: e.duration!,
    estimated: e.estimatedTime
  }));

  return (
    <div>
      <h2>📊 Analytics</h2>
      <LineChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="actual" stroke="#8884d8" />
        <Line type="monotone" dataKey="estimated" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
}