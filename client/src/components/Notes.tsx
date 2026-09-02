import { useState } from "react";
// Assuming socket is globally available or imported appropriately
// import { socket } from "../../src/socket";

interface Note {
  text: string;
}

interface Experiment {
  _id: string;
  notes: Note[];
}

interface NotesProps {
  exp: Experiment;
}

export default function Notes({ exp }: NotesProps) {
  const [text, setText] = useState("");

  const addNote = () => {
    // socket.emit("add_note", {
    //   id: exp._id,
    //   note: text
    // });
    setText("");
  };

  return (
    <div>
      <h4>Notes</h4>
      <ul>
        {exp.notes.map((n, i) => (
          <li key={i}>{n.text}</li>
        ))}
      </ul>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add note..."
      />
      <button onClick={addNote}>Add</button>
    </div>
  );
}