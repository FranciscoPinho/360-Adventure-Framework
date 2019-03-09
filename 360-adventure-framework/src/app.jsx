import React, { useState } from 'react';
import {ipcRenderer} from 'electron';
import { Button } from 'semantic-ui-react';

export default function App() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <Button onClick={() => {
        ipcRenderer.send('example', 'ping');
        console.log("sent");
      }}
      >
        Click me
      </Button>
    </div>
  );
}
