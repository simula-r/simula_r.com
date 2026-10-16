import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import type { Camera } from "@/app/elements/types";
import { fitCamera, mixCamera, windowSize, type Point } from "@/lib/camera";
import { easeInOut } from "@/lib/motion";
import { sampleCamera, samplePointer } from "./sample";
import type { Chapter, DriveManifest } from "./types";

const HANDOFF_SECONDS = 0.6;
const REWIND_SECONDS = 2;

type PlayerStatus = "idle" | "playing" | "paused" | "interrupted" | "ended";
type Handoff = { from: Camera; chapter: number; t0: number };
type DriveFrame = {
  chapter: number;
  time: number;
  camera: Camera;
  pointer: Point | null;
};
type FrameListener = (frame: DriveFrame) => void;

function createAudio(chapter: Chapter) {
  const audio = document.createElement("audio");
  audio.preload = "auto";
  for (const src of [chapter.audio.m4a, chapter.audio.webm]) {
    if (!src) continue;
    const source = document.createElement("source");
    source.src = src;
    audio.append(source);
  }
  audio.load();
  return audio;
}

function useDrivePlayer({
  manifest,
  camera,
  setCamera,
}: {
  manifest: DriveManifest | null;
  camera: Camera;
  setCamera: (camera: Camera) => void;
}) {
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [muted, setMuted] = useState(false);
  const [pointer, setPointer] = useState<Point | null>(null);
  const committed = useRef(camera);
  const audios = useRef<HTMLAudioElement[]>([]);
  const handoff = useRef<Handoff | null>(null);
  const index = useRef(0);
  const playing = useRef(false);
  const frame = useRef<DriveFrame | null>(null);
  const listeners = useRef(new Set<FrameListener>());

  useEffect(() => {
    committed.current = camera;
  }, [camera]);

  const publish = (next: DriveFrame) => {
    frame.current = next;
    for (const listener of listeners.current) listener(next);
  };

  const cameraAt = (chapter: Chapter, t: number) => {
    const sampled = sampleCamera(chapter.camera, t);
    if (!manifest || !sampled) return committed.current;
    const target = fitCamera(sampled, manifest.viewport, windowSize());
    const active = handoff.current;
    if (!active || active.chapter !== index.current) return target;
    const k = (t - active.t0) / HANDOFF_SECONDS;
    if (k >= 1) return target;
    return mixCamera(active.from, target, easeInOut(Math.max(0, k)));
  };

  const renderFrame = () => {
    const chapter = manifest?.chapters[index.current];
    const audio = audios.current[index.current];
    if (!chapter || !audio) return;
    const t = audio.currentTime;
    publish({
      chapter: index.current,
      time: t,
      camera: cameraAt(chapter, t),
      pointer: samplePointer(chapter.pointer, t),
    });
  };

  const commit = () => {
    const current = frame.current;
    if (!current) return;
    setCamera(current.camera);
    setPointer(current.pointer);
  };

  const switchChapter = (next: number, at: number) => {
    if (next !== index.current) audios.current[index.current]?.pause();
    index.current = next;
    handoff.current = null;
    const audio = audios.current[next];
    if (audio) audio.currentTime = at;
  };

  const halt = (next: PlayerStatus) => {
    audios.current[index.current]?.pause();
    playing.current = false;
    renderFrame();
    handoff.current = null;
    commit();
    setStatus(next);
  };

  const start = (audio: HTMLAudioElement) => {
    audio.play().catch(() => {
      if (playing.current && audio === audios.current[index.current]) {
        halt("interrupted");
      }
    });
  };

  const onEnded = useEffectEvent(() => {
    if (!playing.current) return;
    const next = index.current + 1;
    if (next >= audios.current.length) {
      halt("ended");
      return;
    }
    switchChapter(next, 0);
    const audio = audios.current[next];
    if (audio) start(audio);
  });

  useEffect(() => {
    if (!manifest) return;
    const elements = manifest.chapters.map(createAudio);
    for (const audio of elements) audio.addEventListener("ended", onEnded);
    audios.current = elements;
    return () => {
      for (const audio of elements) {
        audio.pause();
        audio.removeEventListener("ended", onEnded);
      }
      audios.current = [];
    };
  }, [manifest]);

  useEffect(() => {
    for (const audio of audios.current) audio.muted = muted;
  }, [manifest, muted]);

  const tick = useEffectEvent(renderFrame);

  useEffect(() => {
    if (status !== "playing") return;
    let request = requestAnimationFrame(function loop() {
      tick();
      request = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(request);
  }, [status]);

  const play = () => {
    const audio = audios.current[index.current];
    if (!audio || playing.current) return;
    audio.currentTime = Math.max(0, audio.currentTime - REWIND_SECONDS);
    handoff.current = {
      from: committed.current,
      chapter: index.current,
      t0: audio.currentTime,
    };
    playing.current = true;
    start(audio);
    renderFrame();
    setStatus("playing");
  };

  const pause = () => {
    if (playing.current) halt("paused");
  };

  const interrupt = () => {
    if (playing.current) halt("interrupted");
    else if (status === "paused") setStatus("interrupted");
  };

  const seek = (chapter: number, at: number) => {
    switchChapter(chapter, at);
    const audio = audios.current[chapter];
    if (playing.current && audio?.paused) start(audio);
    renderFrame();
  };

  const settle = () => {
    if (!playing.current) commit();
  };

  const replay = () => {
    if (playing.current) return;
    switchChapter(0, 0);
    play();
  };

  const toggleMute = () => setMuted((m) => !m);

  const isPlaying = () => playing.current;

  const subscribe = useCallback((listener: FrameListener) => {
    const set = listeners.current;
    set.add(listener);
    if (frame.current) listener(frame.current);
    return () => {
      set.delete(listener);
    };
  }, []);

  const chapters = manifest?.chapters ?? [];
  const offsets = chapters.reduce<number[]>((acc, chapter, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + chapters[i - 1].duration);
    return acc;
  }, []);
  const total = chapters.reduce((sum, chapter) => sum + chapter.duration, 0);

  return {
    status,
    chapters,
    offsets,
    total,
    pointer,
    muted,
    play,
    pause,
    interrupt,
    seek,
    settle,
    replay,
    toggleMute,
    isPlaying,
    subscribe,
  };
}

type DrivePlayer = ReturnType<typeof useDrivePlayer>;

export { useDrivePlayer };
export type { DrivePlayer, DriveFrame };
