// import { socket } from "../../src/socket";
import Timer from "./Timer";
import Notes from "./Notes";

interface Experiment {
  name: string;
  status: string;
  startTime?: number | string;
  estimatedTime: number;
  duration?: number;
  _id: string;
  notes: { text: string }[];
}

interface ExperimentCardProps {
  exp: Experiment;
}

export default function ExperimentCard({ exp }: ExperimentCardProps) {
  const start = () => {
    // socket.emit("update_experiment", {
    //   ...exp,
    //   status: "running",
    //   startTime: Date.now()
    // });
  };

  const stop = () => {
    const duration = Math.floor(
      (Date.now() - new Date(exp.startTime!)) / 1000
    );
    // socket.emit("update_experiment", {
    //   ...exp,
    //   status: "completed",
    //   endTime: Date.now(),
    //   duration
    // });
  };

  return (
    <div className="card">
      <h3>{exp.name}</h3>
      <Timer startTime={exp.startTime} status={exp.status} />
      <p>Status: {exp.status}</p>
      <p>Estimated: {exp.estimatedTime}s</p>
      <p>Actual: {exp.duration || 0}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <Notes exp={exp} />
    </div>
  );
}