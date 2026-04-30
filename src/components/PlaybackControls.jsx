import { Play, Square } from "lucide-react";

export default function PlaybackControls({ status, onStartGame, onStop }) {
  const isRunning = status !== "idle";

  return (
    <section className="game-transport">
      <button className="game-start" disabled={isRunning} onClick={onStartGame}>
        <Play size={20} />
        Start Game
      </button>

      <button className="game-stop" disabled={!isRunning} onClick={onStop}>
        <Square size={20} />
        Stop
      </button>
    </section>
  );
}
