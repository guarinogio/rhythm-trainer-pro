import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header.jsx';
import SessionSetup from './components/SessionSetup.jsx';
import { Transport } from './components/Transport.jsx';
import { StatusBar } from './components/StatusBar.jsx';
import { PatternGrid } from './components/PatternGrid.jsx';
import { RhythmAudioEngine } from './lib/audioEngine.js';
import { DIFFICULTIES, generatePattern, getTotalBeats, MAX_LENGTH, MIN_LENGTH } from './lib/rhythm.js';
import './App.css';

export default function App() {
  const [bpm, setBpm] = useState(80);
  const [length, setLength] = useState(8);
  const [volume, setVolume] = useState(75);
  const [studyMode, setStudyMode] = useState('clapping');
  const [difficulty, setDifficulty] = useState('basic');
  const [status, setStatus] = useState('idle');
  const [loop, setLoop] = useState(0);
  const [count, setCount] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeProgress, setActiveProgress] = useState(0);
  const [pattern, setPattern] = useState(() => generatePattern({ length: 8, studyMode: 'clapping', difficulty: 'basic' }));

  const engineRef = useRef(null);

  if (!engineRef.current) {
    engineRef.current = new RhythmAudioEngine();
  }

  const totalBeats = useMemo(() => getTotalBeats(pattern), [pattern]);
  const isRunning = status !== 'idle';

  useEffect(() => {
    return () => engineRef.current?.stop();
  }, []);

  useEffect(() => {
    if (!isRunning) {
      setPattern(generatePattern({ length, studyMode, difficulty }));
    }
  }, [length, studyMode, difficulty]);

  useEffect(() => {
    engineRef.current?.setVolume(volume);
  }, [volume]);

  function randomize() {
    if (isRunning) return;
    setPattern(generatePattern({ length, studyMode, difficulty }));
    setLoop(0);
    setCount(null);
    setActiveIndex(null);
    setActiveProgress(0);
  }

  function stop() {
    engineRef.current.stop();
    setStatus('idle');
    setLoop(0);
    setCount(null);
    setActiveIndex(null);
    setActiveProgress(0);
  }

  async function start(mode) {
    if (isRunning) return;
    setStatus(mode);
    setLoop(1);
    setCount(null);
    setActiveIndex(null);
    setActiveProgress(0);

    try {
      await engineRef.current.startLoop({
        pattern,
        bpm,
        volume,
        mode,
        studyMode,
        onVisual: ({ index, progress }) => {
          setActiveIndex(index);
          setActiveProgress(progress ?? 0);
        },
        onCount: setCount,
        onLoop: setLoop,
      });
    } catch (error) {
      console.error(error);
      stop();
    }
  }

  function reset() {
    stop();
    setBpm(80);
    setLength(8);
    setVolume(75);
    setStudyMode('clapping');
    setDifficulty('basic');
    setPattern(generatePattern({ length: 8, studyMode: 'clapping', difficulty: 'basic' }));
  }

  function safeSetLength(value) {
    setLength(Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, value)));
  }

  return (
    <main className="app">
      <Header />
      <SessionSetup
        bpm={bpm}
        setBpm={setBpm}
        length={length}
        setLength={safeSetLength}
        volume={volume}
        setVolume={setVolume}
        studyMode={studyMode}
        setStudyMode={setStudyMode}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onRandomize={randomize}
        disabled={isRunning}
      />
      <Transport onDemo={() => start('demo')} onPractice={() => start('practice')} onStop={stop} status={status} />
      <StatusBar status={status} loop={loop} count={count} totalBeats={totalBeats} studyMode={studyMode} difficulty={DIFFICULTIES[difficulty].label} />
      <PatternGrid pattern={pattern} activeIndex={activeIndex} activeProgress={activeProgress} studyMode={studyMode} />
      <footer className="footer-note">Built for guided rhythm study: listen first, then perform with a steady metronome.</footer>
    </main>
  );
}
