const MIME_TYPE = "audio/webm;codecs=opus";

type AudioRecording = { stop: () => Promise<Blob> };

function recordAudio(stream: MediaStream): AudioRecording {
  const recorder = new MediaRecorder(stream, { mimeType: MIME_TYPE });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: MIME_TYPE }));
  });
  recorder.start();
  return {
    stop: () => {
      recorder.stop();
      return stopped;
    },
  };
}

export { recordAudio };
export type { AudioRecording };
