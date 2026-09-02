import { useEffect, useState } from "react";
import { socket } from "./socket";
import ExperimentCard from "../components/ExperimentCard";
import Dashboard from "../components/Dashboard";

function App() {
  const [experiments, setExperiments] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    socket.emit("load_experiments");

    socket.on("experiments_data", setExperiments);

    socket.on("experiment_created", (exp) => {
      setExperiments(prev => [...prev, exp]);
    });

    socket.on("experiment_updated", (updated) => {
      setExperiments(prev =>
        prev.map(e => e._id === updated._id ? updated : e)
      );
    });

  }, []);

  const createExperiment = () => {
    socket.emit("create_experiment", {
      name,
      estimatedTime: 300
    });
    setName("");
  };

  return (
    <div>
      <h1>🧪 Experiment Tracker</h1>

      <Dashboard experiments={experiments} />

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={createExperiment}>Create</button>

      {experiments.map(exp => (
        <ExperimentCard key={exp._id} exp={exp} />
      ))}
    </div>
  );
}

export default App;