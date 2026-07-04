import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, PhoneOff, AlertCircle, Volume2, Sparkles, Wifi } from "lucide-react";

export default function VoiceConsultView() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusLogs, setStatusLogs] = useState<string[]>([
    "Ready for voice consultation. Ensure your microphone is plugged in."
  ]);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  
  // Playback queue states
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextStartTimeRef = useRef(0);

  const addLog = (message: string) => {
    setStatusLogs(prev => [message, ...prev.slice(0, 15)]);
  };

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    addLog("Requesting microphone permissions...");

    try {
      // 1. Get user mic access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      micStreamRef.current = stream;
      addLog("Microphone access authorized.");

      // 2. Initialize Web Audio Context
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      nextStartTimeRef.current = audioCtx.currentTime;

      // 3. Connect WebSocket to server
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      addLog(`Initializing Live Channel...`);

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        addLog("Channel connected. Gemini Live Session starting...");
        
        // Start streaming mic audio to WebSocket
        startMicStreaming(audioCtx, stream, ws);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.error) {
            setError(message.error);
            stopSession();
            return;
          }

          if (message.audio) {
            queueIncomingAudio(message.audio);
          }

          if (message.interrupted) {
            clearPlaybackQueue();
            addLog("AI interrupted by user speech.");
          }
        } catch (err) {
          console.error("Error reading Live WebSocket message:", err);
        }
      };

      ws.onclose = () => {
        addLog("Consultation channel closed.");
        stopSession();
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("WebSocket channel failure. Please ensure your Gemini API Key is configured.");
        stopSession();
      };

    } catch (err: any) {
      console.error("Mic or connection failure:", err);
      setError(err.message || "Failed to authorize mic input or establish secure websocket gateway.");
      setIsConnecting(false);
    }
  };

  const startMicStreaming = (audioCtx: AudioContext, stream: MediaStream, ws: WebSocket) => {
    const source = audioCtx.createMediaStreamSource(stream);
    
    // ScriptProcessorNode for wide compatibility and direct PCM extraction
    const processor = audioCtx.createScriptProcessor(2048, 1, 1);
    inputProcessorRef.current = processor;

    source.connect(processor);
    processor.connect(audioCtx.destination);

    processor.onaudioprocess = (e) => {
      if (isMuted) return;
      if (ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);
      
      // Convert Float32Array to 16-bit Signed PCM
      const pcmBuffer = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        // Clamp and scale to Int16 limits
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      // Base64 encode the PCM buffer
      const uint8Buffer = new Uint8Array(pcmBuffer.buffer);
      let binary = "";
      for (let i = 0; i < uint8Buffer.length; i++) {
        binary += String.fromCharCode(uint8Buffer[i]);
      }
      const base64 = btoa(binary);

      ws.send(JSON.stringify({ audio: base64 }));
    };
  };

  const queueIncomingAudio = (base64Audio: string) => {
    // Decode base64 to binary
    const binary = atob(base64Audio);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Convert Int16 bytes back to Float32 array for Web Audio
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    playbackQueueRef.current.push(float32Array);
    if (!isPlayingRef.current) {
      processPlaybackQueue();
    }
  };

  const processPlaybackQueue = () => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx || playbackQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const float32Data = playbackQueueRef.current.shift()!;

    // Create an audio buffer for playback
    const audioBuffer = audioCtx.createBuffer(1, float32Data.length, 16000);
    audioBuffer.copyToChannel(float32Data, 0);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);

    // Calculate when to play the chunk to avoid overlaps or clicks
    const currentTime = audioCtx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime;
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;

    source.onended = () => {
      processPlaybackQueue();
    };
  };

  const clearPlaybackQueue = () => {
    playbackQueueRef.current = [];
    isPlayingRef.current = false;
    if (audioContextRef.current) {
      nextStartTimeRef.current = audioContextRef.current.currentTime;
    }
  };

  const stopSession = () => {
    addLog("Ending consult session...");
    
    try {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    } catch (e) {}

    try {
      if (inputProcessorRef.current) {
        inputProcessorRef.current.disconnect();
        inputProcessorRef.current = null;
      }
    } catch (e) {}

    try {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
      }
    } catch (e) {}

    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (e) {}

    clearPlaybackQueue();
    setIsConnected(false);
    setIsConnecting(false);
    addLog("Consultation closed. Ready to begin.");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    addLog(!isMuted ? "Microphone muted." : "Microphone active.");
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div id="voice-consult-view" className="space-y-8 max-w-4xl mx-auto">
      {/* Title block */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white tracking-tight">AI Voice Consultation</h2>
            <p className="text-xs text-slate-500">Engage in fluent, zero-latency real-time voice discussions with clinical advisor Zephyr.</p>
          </div>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>Active Channel</span>
          </div>
        )}
      </div>

      {/* Safety Alert */}
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex gap-3 text-xs dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-500" />
        <p className="leading-relaxed">
          <strong className="font-extrabold">Instant Voice Safety Guidelines:</strong> This is an educational voice companion interface using Google's real-time multimodal live framework. It provides wellness advice but is strictly incapable of giving diagnostic physical guidance or issuing prescriptions. Speak naturally, ask questions, or describe lab results.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 flex gap-3 text-xs dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <span className="font-extrabold block">Connection Blocked</span>
            <span className="block mt-1">{error}</span>
          </div>
        </div>
      )}

      {/* Interactive Stage */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-10 text-center flex flex-col items-center justify-center space-y-8 min-h-[380px]">
        {/* Stage Graphic */}
        <div className="relative flex items-center justify-center">
          {isConnected ? (
            <>
              {/* Wave pulse elements */}
              <div className="absolute w-36 h-36 bg-indigo-500/10 rounded-full animate-ping duration-2000" />
              <div className="absolute w-28 h-28 bg-indigo-500/20 rounded-full animate-pulse" />
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 relative z-10">
                <Volume2 className="w-8 h-8 animate-bounce duration-1000" />
              </div>
            </>
          ) : isConnecting ? (
            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <Mic className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Text descriptions */}
        <div className="space-y-2 max-w-sm">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            {isConnected ? "Zephyr is listening..." : isConnecting ? "Connecting Voice Gateway..." : "Initiate Consultation Session"}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isConnected
              ? "Speak into your microphone. Say 'Hello' or ask 'How do I optimize my lipids?'. Zephyr will reply immediately with zero lag."
              : isConnecting
              ? "Establishing secure audio pipeline. Authorizing microphone matrix..."
              : "Start a private real-time audio session to discuss your bioindicators, meal plans, or healthy daily goals verbally."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex gap-4">
          {!isConnected && !isConnecting ? (
            <button
              onClick={startSession}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>Start Voice Consultation</span>
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={`font-bold text-xs px-4 py-3 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                  isMuted
                    ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isMuted ? "Unmute" : "Mute Mic"}</span>
              </button>

              <button
                onClick={stopSession}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-rose-600/10"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Terminal logs */}
      <div className="bg-slate-950 rounded-2xl p-6 border border-slate-850 shadow-xs space-y-3 font-mono">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 tracking-wider">
          <span>Active Pipeline Logs</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Console Connected</span>
          </span>
        </div>
        <div className="h-32 overflow-y-auto space-y-2 text-[11px] text-slate-400 leading-relaxed scrollbar-thin">
          {statusLogs.map((log, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="text-slate-600 shrink-0">[{new Date().toISOString().split("T")[1].slice(0, 8)}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
