import { useState } from 'react';
import Landing from './components/Landing';
import VideoChat from './components/VideoChat';

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div className="App">
      {!started ? (
        <Landing onStart={() => setStarted(true)} />
      ) : (
        <VideoChat />
      )}
    </div>
  );
}

export default App;
