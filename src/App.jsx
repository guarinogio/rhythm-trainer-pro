import { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import SessionControls from "./components/SessionControls.jsx";
import PlaybackControls from "./components/PlaybackControls.jsx";
import TimelinePattern from "./components/TimelinePattern.jsx";
import { AudioEngine } from "./lib/audioEngine.js";
import { generatePattern } from "./lib/patternGenerator.js";
import { DIFFICULTIES } from "./lib/rhythmCatalog.js";

const GAME_BLOCK_LENGTH = 8;
const QUEUE_BLOCKS = 512;
const LEVEL_ORDER = ["level1", "level2", "level3", "level4", "level5"];

function getScaledDifficulty(startDifficulty, blockIndex) {
  const startIndex = Math.max(0, LEVEL_ORDER.indexOf(startDifficulty));
  const levelIncrease = Math.floor(blockIndex / 3);
  const nextIndex = Math.min(LEVEL_ORDER.length - 1, startIndex + levelIncrease);
  return LEVEL_ORDER[nextIndex];
}

export default function App() {
  const [bpm, setBpm] = useState(80);
  const [volume, setVolume] = useState(75);
  const [backingEnabled, setBackingEnabled] = useState(true);
  const [backingVolume, setBackingVolume] = useState(35);
  const [countInEnabled, setCountInEnabled] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [drumsEnabled, setDrumsEnabled] = useState(true);
  const [drumsVolume, setDrumsVolume] = useState(40);
  const [bassEnabled, setBassEnabled] = useState(true);
  const [bassVolume, setBassVolume] = useState(35);
  const [backingStyle, setBackingStyle] = useState("jazz");
  const [practiceRepeats, setPracticeRepeats] = useState(1);
  const [studyMode, setStudyMode] = useState("clapping");
  const [difficulty, setDifficulty] = useState("level1");

  const [status, setStatus] = useState("idle");
  const [loop, setLoop] = useState(null);
  const [count, setCount] = useState(null);
  const [activeBeat, setActiveBeat] = useState(null);
  const [activeSubdivision, setActiveSubdivision] = useState(null);
  const [blockNumber, setBlockNumber] = useState(1);

  const [pattern, setPattern] = useState(() =>
    generatePattern({ length: GAME_BLOCK_LENGTH, studyMode: "clapping", difficulty: "level1" })
  );

  const audioRef = useRef(null);

  if (!audioRef.current) {
    audioRef.current = new AudioEngine();
  }

  const isRunning = status !== "idle";

  const measures = useMemo(() => {
    const rows = [];
    for (let i = 0; i < pattern.length; i += 4) {
      rows.push(pattern.slice(i, i + 4));
    }
    return rows;
  }, [pattern]);

  useEffect(() => {
    return () => audioRef.current?.stop();
  }, []);

  function makeBlocks() {
    return Array.from({ length: QUEUE_BLOCKS }, (_, blockIndex) =>
      generatePattern({
        length: GAME_BLOCK_LENGTH,
        studyMode,
        difficulty: getScaledDifficulty(difficulty, blockIndex),
      })
    );
  }

  function stop() {
    audioRef.current.stop();
    setStatus("idle");
    setLoop(null);
    setCount(null);
    setActiveBeat(null);
    setActiveSubdivision(null);
  }

  async function startGame() {
    if (isRunning) return;

    const blocks = makeBlocks();
    setPattern(blocks[0]);
    setBlockNumber(1);
    setStatus("listen");

    await audioRef.current.startGameSession({
      blocks,
      bpm,
      volume,
      backingEnabled,
      backingVolume,
      countInEnabled,
      metronomeEnabled,
      drumsEnabled,
      drumsVolume,
      bassEnabled,
      bassVolume,
      backingStyle,
      practiceRepeats,
      dynamicSeed: `${Date.now()}`,
      studyMode,
      onBlock: ({ blockNumber, pattern }) => {
        setBlockNumber(blockNumber);
        setPattern(pattern);
      },
      onLoop: (nextLoop, nextMode) => {
        setStatus(nextMode);
        setLoop(nextMode === "practice" ? nextLoop - 1 : nextLoop);
      },
      onCount: setCount,
      onBeat: ({ beatIndex, subdivisionIndex }) => {
        setActiveBeat(beatIndex);
        setActiveSubdivision(subdivisionIndex ?? null);
      },
      onEndBeat: () => {
        setActiveSubdivision(null);
      },
      onComplete: () => {
        stop();
      },
    });
  }

  if (isRunning) {
    return (
      <main className="app game-app game-running">
        <div className="game-only-top">
          <div className="game-pill">
            <span>Block {blockNumber}</span>
            <strong>
              {status === "listen" ? "Listen" : `Practice ${loop ?? 1}/${practiceRepeats}`}
            </strong>
          </div>

          <button className="game-stop floating-stop" onClick={stop}>
            Stop
          </button>
        </div>

        <TimelinePattern
          measures={measures}
          studyMode={studyMode}
          activeBeat={activeBeat}
          activeSubdivision={activeSubdivision}
          gameMode
        />
      </main>
    );
  }

  return (
    <main className="app game-app">
      <Header />

      <div className="top-actions">
        <PlaybackControls status={status} onStartGame={startGame} onStop={stop} />

        <SessionControls
          bpm={bpm}
          setBpm={setBpm}
          volume={volume}
          setVolume={setVolume}
          backingEnabled={backingEnabled}
          setBackingEnabled={setBackingEnabled}
          backingVolume={backingVolume}
          setBackingVolume={setBackingVolume}
          countInEnabled={countInEnabled}
          setCountInEnabled={setCountInEnabled}
          metronomeEnabled={metronomeEnabled}
          setMetronomeEnabled={setMetronomeEnabled}
          drumsEnabled={drumsEnabled}
          setDrumsEnabled={setDrumsEnabled}
          drumsVolume={drumsVolume}
          setDrumsVolume={setDrumsVolume}
          bassEnabled={bassEnabled}
          setBassEnabled={setBassEnabled}
          bassVolume={bassVolume}
          setBassVolume={setBassVolume}
          backingStyle={backingStyle}
          setBackingStyle={setBackingStyle}
          practiceRepeats={practiceRepeats}
          setPracticeRepeats={setPracticeRepeats}
          studyMode={studyMode}
          setStudyMode={setStudyMode}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          disabled={isRunning}
        />
      </div>

      <section className="idle-stage">
        <strong>Infinite rhythm game</strong>
        <p>Start to reveal the next 8-beat challenge.</p>
      </section>
    </main>
  );
}
