import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Captions,
  Clock,
  Mic,
  MicOff,
  Pause,
  Play,
  Settings,
  Square,
  UserCheck,
  AlertTriangle,
  FileText,
  Volume2,
  VolumeX,
  RotateCcw,
  HelpCircle,
  Send,
  SkipForward,
  CheckCircle2,
  Keyboard,
} from 'lucide-react';
import { evaluateInterviewAnswer } from '../../data/aiInterviewEvaluator';

const MAX_ANSWER_CHARS = 4000;

function buildAnswerAwareFollowUp(question, answerText, skipped = false, evaluation = null) {
  const clean = String(answerText || '').trim();
  const lower = clean.toLowerCase();
  const category = String(question?.category || 'AML Compliance');

  if (skipped || !clean) {
    return (
      question?.followUpPrompt ||
      `Starting from the basics on ${category}, what is the very first compliance check or red flag you would look for in this scenario?`
    );
  }

  const missingPoints = Array.isArray(evaluation?.missingPoints) ? evaluation.missingPoints : [];
  if (missingPoints.length > 0 && missingPoints[0]) {
    return `Good start. You touched on part of the picture—how would you also address "${missingPoints[0]}" before finalizing your decision?`;
  }

  if (lower.includes('escalat') || lower.includes('sar') || lower.includes('str')) {
    return 'Since you mentioned escalation or reporting, what specific threshold, corroborating evidence, or unresolved red flags would confirm a formal escalation while avoiding tipping off the customer?';
  }

  if (lower.includes('ubo') || lower.includes('beneficial') || lower.includes('ownership') || lower.includes('shell')) {
    return 'Suppose an intermediate holding company or nominee structure obscures ownership—how would you trace control to natural persons and document Source of Wealth?';
  }

  if (lower.includes('source of funds') || lower.includes('sof') || lower.includes('source of wealth') || lower.includes('sow')) {
    return 'If the customer provides a partial explanation for the funds that conflicts with their stated profile or transaction history, what corroborating records would you request next?';
  }

  if (lower.includes('structur') || lower.includes('smurf') || lower.includes('velocity') || lower.includes('pass-through') || lower.includes('mule')) {
    return 'Suppose you observe repeated threshold-adjacent or rapid pass-through activity across related counterparties—how would you separate benign business flow from coordinated layering?';
  }

  if (lower.includes('sanction') || lower.includes('pep') || lower.includes('adverse media')) {
    return 'If screening returns a partial match or adverse media hit with incomplete identifiers, what verification steps and disposition notes are required before clearing or escalating?';
  }

  if (question?.followUpPrompt) {
    return question.followUpPrompt;
  }

  return `Building on what you just shared about ${category}, what key red flag or exception would change your risk rating or next investigative step?`;
}

function formatDuration(sec) {
  const safe = Math.max(0, Number(sec) || 0);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LiveVideoInterviewRoom({
  session,
  onUpdateSession,
  onCompleteSession,
  onSwitchToTextMode,
  onExitToHub,
}) {
  if (!session) {
    return (
      <div className="p-6 text-sm text-slate-200 bg-[#081C33] rounded-2xl">
        No active interview session found. Please start or resume a session from the hub.
      </div>
    );
  }
  const questions = Array.isArray(session.questions) ? session.questions : [];
  const totalQ = Math.max(1, questions.length);
  const [stepIdx, setStepIdx] = useState(() =>
    Math.min(Math.max(0, Number(session.currentIndex) || 0), totalQ - 1)
  );

  useEffect(() => {
    setStepIdx(Math.min(Math.max(0, Number(session.currentIndex) || 0), totalQ - 1));
    const propIdx = Math.min(Math.max(0, Number(session.currentIndex) || 0), totalQ - 1);
    setStepIdx((prev) => (propIdx > prev ? propIdx : prev));
  }, [session.currentIndex, totalQ]);

  const currentIdx = Math.min(Math.max(0, stepIdx), totalQ - 1);
  const currentQ = questions[currentIdx] || null;

  const [elapsed, setElapsed] = useState(Number(session.elapsedSeconds) || 0);
  const [isPaused, setIsPaused] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [textFallbackOpen, setTextFallbackOpen] = useState(true);

  // 'IDLE' | 'INTERVIEWER_SPEAKING' | 'LISTENING' | 'PROCESSING'
  const [roomState, setRoomState] = useState('IDLE');
  const [spokenCaption, setSpokenCaption] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [followUpActive, setFollowUpActive] = useState(false);
  const [dynamicFollowUp, setDynamicFollowUp] = useState('');
  const [clarificationShown, setClarificationShown] = useState(false);
  const [isListeningStt, setIsListeningStt] = useState(false);


  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [audioOnlyMode, setAudioOnlyMode] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [selectedMicId, setSelectedMicId] = useState('');
  const [blinkClosed, setBlinkClosed] = useState(false);


  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const speakFallbackTimerRef = useRef(null);
  const introDoneRef = useRef(false);
  const lastTurnKeyRef = useRef('');
  const manualStopRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioCtxRef = useRef(null);
  const meterRafRef = useRef(null);
  const micEnabledRef = useRef(micEnabled);
  const isPausedRef = useRef(isPaused);
  const latestFeedbackRef = useRef(latestFeedback);
  const isEvaluatingRef = useRef(isEvaluating);

  const setStreamAudioEnabled = useCallback((enabled) => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach((track) => {
      try {
        track.enabled = Boolean(enabled);
      } catch {
        // Ignore
      }
    });
  }, []);

  const [micLevel, setMicLevel] = useState(0);
  const [voiceClipUrl, setVoiceClipUrl] = useState('');
  const [isRecordingClip, setIsRecordingClip] = useState(false);

  const stopMicMeter = useCallback(() => {
    if (meterRafRef.current) {
      cancelAnimationFrame(meterRafRef.current);
      meterRafRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
        // Ignore
      }
      audioCtxRef.current = null;
    }
    setMicLevel(0);
  }, []);

  const startMicMeter = useCallback(async () => {
    stopMicMeter();
    if (!navigator?.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true,
        video: false,
      });
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return;
      const ctx = new AudioContextCtor();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = ctx;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!audioCtxRef.current) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) sum += data[i];
        const avg = Math.min(100, Math.round((sum / data.length / 128) * 100));
        setMicLevel(avg);
        meterRafRef.current = requestAnimationFrame(tick);
      };
      meterRafRef.current = requestAnimationFrame(tick);

      window.setTimeout(() => {
        stream.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {
            // Ignore
          }
        });
      }, 15000);
    } catch {
      // Ignore meter errors
    }
  }, [selectedMicId, stopMicMeter]);

  const toggleVoiceClip = useCallback(async () => {
    if (isRecordingClip && mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore
      }
      setIsRecordingClip(false);
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatusMessage('Voice clip recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true,
        video: false,
      });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          setVoiceClipUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          setAnswerText((prev) =>
            prev.trim()
              ? prev
              : '[Voice response recorded — review audio playback or add key compliance points before submitting]'
          );
          setStatusMessage('Voice clip captured. You can play it back below or submit your answer.');
        }
        stream.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {
            // Ignore
          }
        });
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingClip(true);
      setStatusMessage('Recording voice clip directly from microphone... Click "Stop Clip" when done.');
    } catch {
      setStatusMessage('Could not access microphone for voice clip recording.');
    }
  }, [isRecordingClip, selectedMicId]);

  const stopVoiceCapture = useCallback(() => {
    manualStopRef.current = true;
    setInterimTranscript('');
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore
    }
    recognitionRef.current = null;
    setIsListeningStt(false);
  }, []);

  const startVoiceCapture = useCallback(() => {
    const SpeechRec =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRec) {
      setIsListeningStt(false);
      setStatusMessage(
        'Web Speech recognition is not supported in this browser. Type your answer in the box below.'
      );
      return;
    }

    if (isPausedRef.current || latestFeedbackRef.current || isEvaluatingRef.current) {
      return;
    }

    if (!micEnabledRef.current) {
      setIsListeningStt(false);
      setStatusMessage('Mic is muted. Click "Mic On" or type your answer below.');
      return;
    }

    manualStopRef.current = false;
    setInterimTranscript('');
    startMicMeter();
    setStatusMessage('Requesting microphone speech capture...');

    try {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      }
    } catch {
      // Ignore
    }
    recognitionRef.current = null;

    try {
      const rec = new SpeechRec();
      rec.lang = navigator?.language || 'en-IN';
      rec.interimResults = true;
      rec.continuous = true;
      rec.maxAlternatives = 1;

      setStreamAudioEnabled(false);

      rec.onstart = () => {
        setIsListeningStt(true);
        setStatusMessage(
          'Listening now — speak your answer clearly. (Note: browser speech recognition may send audio to an external speech service.)'
        );
      };

      rec.onaudiostart = () => {
        setStatusMessage('Microphone audio stream active — speak now...');
      };

      rec.onspeechstart = () => {
        setStatusMessage('Voice detected — transcribing...');
      };

      rec.onresult = (event) => {
        let sessionFinal = '';
        let liveInterim = '';

        for (let i = 0; i < event.results.length; i += 1) {
          const item = event.results[i];
          const chunk = String(item?.[0]?.transcript || '').trim();
          if (!chunk) continue;
          if (item.isFinal) {
            sessionFinal = sessionFinal ? `${sessionFinal} ${chunk}` : chunk;
          } else {
            liveInterim = liveInterim ? `${liveInterim} ${chunk}` : chunk;
          }
        }

        setInterimTranscript(liveInterim.replace(/\s+/g, ' ').trim());

        const cleanFinal = sessionFinal.replace(/\s+/g, ' ').trim();
        if (cleanFinal) {
          setAnswerText((prev) => {
            const base = String(prev || '').trim();
            if (!base) return cleanFinal.slice(0, MAX_ANSWER_CHARS);
            if (base.endsWith(cleanFinal)) return base.slice(0, MAX_ANSWER_CHARS);
            return `${base} ${cleanFinal}`.replace(/\s+/g, ' ').trim().slice(0, MAX_ANSWER_CHARS);
          });
        }
      };

      rec.onerror = (event) => {
        const code = event?.error || 'unknown';
        setIsListeningStt(false);
        setInterimTranscript('');
        stopMicMeter();
        setStreamAudioEnabled(micEnabledRef.current);

        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setStatusMessage(
            'Microphone/speech permission denied in browser site settings. Allow mic access or type your answer below.'
          );
        } else if (code === 'audio-capture') {
          setStatusMessage(
            'No microphone audio captured (check Windows sound input). Starting local voice clip fallback—click "Record Voice Clip" or type below.'
          );
        } else if (code === 'no-speech') {
          setStatusMessage(
            'No speech heard yet. Check that "Mic input level" moves when you speak, or click "Record Voice Clip" / type below.'
          );
        } else if (code === 'network') {
          setStatusMessage(
            'Browser speech service unreachable (network/DNS/speech endpoint blocked). Use "Record Voice Clip" to capture audio locally or type your answer below.'
          );
        } else {
          setStatusMessage(
            `Speech recognition stopped (${code}). Use "Record Voice Clip" or type your answer below.`
          );
        }
      };

      rec.onend = () => {
        setIsListeningStt(false);
        setInterimTranscript('');
        recognitionRef.current = null;
        setStreamAudioEnabled(micEnabledRef.current);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      setIsListeningStt(false);
      setStatusMessage(
        `Unable to start speech capture (${err?.message || 'error'}). Type your answer below anytime.`
      );
    }
  }, [setStreamAudioEnabled, startMicMeter]);

  const triggerSpeechRecognitionOnce = startVoiceCapture;

  const clearTimersAndSpeech = useCallback(() => {
    if (speakFallbackTimerRef.current) {
      window.clearTimeout(speakFallbackTimerRef.current);
      speakFallbackTimerRef.current = null;
    }
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // Ignore
    }
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore
    }
    recognitionRef.current = null;
    setIsListeningStt(false);
    stopMicMeter();
    setStreamAudioEnabled(micEnabledRef.current);
  }, [setStreamAudioEnabled, stopMicMeter]);

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          // Ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!navigator?.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((d) => d.kind === 'videoinput'));
      setMics(devices.filter((d) => d.kind === 'audioinput'));
    } catch {
      // Ignore
    }
  }, []);

  // Only re-open camera/mic when device toggles or device selection changes
  useEffect(() => {
    let cancelled = false;
    const wantVideo = cameraEnabled && !audioOnlyMode;
    const wantAudio = micEnabled;

    stopMediaStream();
    setMediaError('');

    if (!wantVideo && !wantAudio) {
      return () => {
        cancelled = true;
      };
    }

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setMediaError('Camera/mic require HTTPS or localhost. Typed answers work without camera/mic.');
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setMediaError('Camera/mic APIs unavailable in this browser. Use typed answers or Text Mode.');
      return;
    }

    const constraints = {
      video: wantVideo
        ? selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : { facingMode: 'user' }
        : false,
      audio: wantAudio
        ? selectedMicId
          ? { deviceId: { exact: selectedMicId } }
          : true
        : false,
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (wantVideo && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        refreshDevices();
      })
      .catch((err) => {
        if (cancelled) return;
        const code = err?.name || '';
        if (code === 'NotAllowedError' || code === 'PermissionDeniedError') {
          setMediaError('Camera/mic permission denied. Continue audio-only or answer by typing.');
        } else if (code === 'NotFoundError' || code === 'DevicesNotFoundError') {
          setMediaError('No camera or mic found. You can still type your answers.');
        } else {
          setMediaError('Could not access camera/mic. Typed answers remain available.');
        }
      });

    return () => {
      cancelled = true;
      stopMediaStream();
    };
  }, [cameraEnabled, micEnabled, audioOnlyMode, selectedCameraId, selectedMicId, refreshDevices, stopMediaStream]);

  useEffect(() => {
    return () => {
      stopVoiceCapture();
    clearTimersAndSpeech();
      stopMediaStream();
    };
  }, [clearTimersAndSpeech, stopMediaStream]);

  // Timer
  useEffect(() => {
    if (isPaused || confirmEndOpen) return;
    const id = window.setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => window.clearInterval(id);
  }, [isPaused, confirmEndOpen]);

  // Blink
  useEffect(() => {
    const id = window.setInterval(() => {
      setBlinkClosed(true);
      window.setTimeout(() => setBlinkClosed(false), 150);
    }, 3600);
    return () => window.clearInterval(id);
  }, []);

  const [interimTranscript, setInterimTranscript] = useState('');

  useEffect(() => {
    micEnabledRef.current = micEnabled;
  }, [micEnabled]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    latestFeedbackRef.current = latestFeedback;
  }, [latestFeedback]);

  useEffect(() => {
    isEvaluatingRef.current = isEvaluating;
  }, [isEvaluating]);


  const playInterviewerLine = useCallback(
    (lineText) => {
      const clean = String(lineText || '').trim();
      setSpokenCaption(clean);
      clearTimersAndSpeech();

      if (isPaused) {
        setRoomState('IDLE');
        return;
      }

      const finishSpeakingToListening = () => {
        if (speakFallbackTimerRef.current) {
          window.clearTimeout(speakFallbackTimerRef.current);
          speakFallbackTimerRef.current = null;
        }
        setRoomState('LISTENING');
        triggerSpeechRecognitionOnce();
      };

      const canSpeak =
        ttsEnabled &&
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        typeof window.SpeechSynthesisUtterance === 'function';

      if (!canSpeak || !clean) {
        finishSpeakingToListening();
        return;
      }

      try {
        setRoomState('INTERVIEWER_SPEAKING');
        // Hard safety timeout so TTS never hangs if a browser fails to fire onend
        const estMs = Math.min(18000, Math.max(2500, clean.length * 65));
        speakFallbackTimerRef.current = window.setTimeout(finishSpeakingToListening, estMs);

        const utter = new window.SpeechSynthesisUtterance(clean);
        utter.onend = finishSpeakingToListening;
        utter.onerror = finishSpeakingToListening;
        window.speechSynthesis.speak(utter);
      } catch {
        finishSpeakingToListening();
      }
    },
    [clearTimersAndSpeech, isPaused, ttsEnabled, startVoiceCapture]
  );

  // Present greeting/intro on first question, or current question / follow-up once per turn
  useEffect(() => {
    if (!currentQ || isPaused || latestFeedback) return;
    const turnKey = `${session.id}-${currentIdx}-${followUpActive ? 'fu' : 'q'}`;
    if (lastTurnKeyRef.current === turnKey) return;
    lastTurnKeyRef.current = turnKey;

    if (!introDoneRef.current && currentIdx === 0 && !followUpActive) {
      introDoneRef.current = true;
      const greeting = `Good morning, and welcome to your ${session.role || 'AML Compliance'} interview for ${session.company || 'your target role'}. We will discuss your experience, technical understanding, and investigation approach. ${currentQ.prompt}`;
      playInterviewerLine(greeting);
    } else if (followUpActive && currentQ.followUpPrompt) {
      playInterviewerLine(currentQ.followUpPrompt);
    } else {
      playInterviewerLine(currentQ.prompt);
    }
  }, [currentQ, currentIdx, followUpActive, isPaused, latestFeedback, session.id, session.role, session.company, playInterviewerLine]);

  const handleSubmit = async ({ skipped = false }) => {
    if (!currentQ || isEvaluating) return;
    if (!skipped && !answerText.trim()) return;

    clearTimersAndSpeech();
    setRoomState('PROCESSING');
    setIsEvaluating(true);

    try {
      const activeFollowUpText = dynamicFollowUp || currentQ.followUpPrompt || '';
      const promptUsed =
        followUpActive && activeFollowUpText
          ? `${currentQ.prompt} (Follow-up: ${activeFollowUpText})`
          : currentQ.prompt;

      const evaluation = await evaluateInterviewAnswer({
        question: { ...currentQ, prompt: promptUsed },
        answerText: skipped ? '' : answerText.trim(),
        skipped,
        role: session.role,
        experienceLevel: session.experienceLevel,
        company: session.company,
      });

      const record = {
        questionIndex: currentIdx,
        questionCode: currentQ.code,
        category: currentQ.category,
        recommendedModuleIndex: currentQ.recommendedModuleIndex,
        questionText: promptUsed,
        answerText: skipped ? '' : answerText.trim(),
        skipped,
        inputMode: skipped ? 'skipped' : isListeningStt ? 'voice' : 'text',
        timeSpentSeconds: elapsed,
        evaluation,
      };

      const existing = Array.isArray(session.records) ? session.records : [];
      const updated = [...existing.filter((r) => r.questionIndex !== currentIdx), record].sort(
        (a, b) => a.questionIndex - b.questionIndex
      );

      onUpdateSession({
        ...session,
        elapsedSeconds: elapsed,
        interviewMode: 'video',
        records: updated,
      });
      const cleanAnswer = skipped ? '' : answerText.trim();
      const nextProbe = buildAnswerAwareFollowUp(currentQ, cleanAnswer, skipped, evaluation);
      setDynamicFollowUp(nextProbe);
      setLatestFeedback(record);
    } catch (err) {
      setStatusMessage(`Could not submit answer (${err?.message || 'error'}). Please try again.`);
    } finally {
      setIsEvaluating(false);
      setRoomState('IDLE');
    }
  };

  const handleNext = () => {
    setLatestFeedback(null);
    setFollowUpActive(false);
    setDynamicFollowUp('');
    setClarificationShown(false);
    setAnswerText('');
    setInterimTranscript('');
    setStatusMessage('');
    const nextIdx = currentIdx + 1;
    setStepIdx(nextIdx);
    if (nextIdx >= totalQ) {
      clearTimersAndSpeech();
      stopMediaStream();
      onCompleteSession({
        ...session,
        elapsedSeconds: elapsed,
        currentIndex: totalQ,
      });
    } else {
      onUpdateSession({
        ...session,
        elapsedSeconds: elapsed,
        currentIndex: nextIdx,
      });
    }
  };

  const completionPct = useMemo(
    () => Math.round((((session.records || []).length) / totalQ) * 100),
    [session.records, totalQ]
  );

  if (!currentQ) return null;

  const avatarStateLabel = isPaused
    ? 'Paused'
    : roomState === 'INTERVIEWER_SPEAKING'
    ? 'Speaking'
    : roomState === 'PROCESSING'
    ? 'Thinking'
    : 'Listening';

  try {
    return (
    <div className="min-h-screen bg-[#061324] text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3 border-b border-white/10 bg-[#081C33]/95 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Live AI Video Room (Simulated)
          </span>
          <div className="truncate text-xs sm:text-sm font-semibold text-slate-200">
            {session.company} · {session.role} · {session.experienceLevel}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              clearTimersAndSpeech();
              stopMediaStream();
              onSwitchToTextMode?.({ ...session, elapsedSeconds: elapsed, interviewMode: 'text' });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-100 border border-white/15 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#C4A77D]" />
            Text Interview
          </button>
          <button
            type="button"
            onClick={() => {
              clearTimersAndSpeech();
              stopMediaStream();
              onUpdateSession({ ...session, elapsedSeconds: elapsed, interviewMode: 'video' });
              onExitToHub();
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-white/15 hover:bg-white/5 cursor-pointer"
          >
            Save &amp; Exit
          </button>
        </div>
      </header>

      {/* Privacy & Simulation Disclosure */}
      <div className="px-4 sm:px-6 pt-3">
        <div className="max-w-7xl mx-auto rounded-xl bg-[#0D1E30] border border-white/10 px-3.5 py-2 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <span>
            <strong>Privacy &amp; Simulation Notice:</strong> Camera/mic stay local in your browser (no recording/upload). Browser speech recognition may process audio externally. Animated avatar is a lightweight simulation.
          </span>
          <span className="text-[#C4A77D] font-semibold">State: {roomState}</span>
        </div>
      </div>

      {/* Main Split Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Left: AI Interviewer */}
          <section
            aria-label="AI Interviewer"
            className="relative rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#132944] via-[#0C1D33] to-[#081424] min-h-[340px] sm:min-h-[390px] flex flex-col justify-between p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/35 border border-white/10 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-[#C4A77D]" />
                <span className="font-semibold text-white">Hiring Manager (AI)</span>
                <span className="text-slate-400">· {currentQ.category}</span>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#C4A77D]/15 text-[#E5CFA8] border border-[#C4A77D]/30">
                {avatarStateLabel}
              </span>
            </div>

            <div className="my-auto flex flex-col items-center justify-center py-3">
              <svg
                viewBox="0 0 240 240"
                className="w-40 h-40 sm:w-44 sm:h-44 drop-shadow-xl"
                role="img"
                aria-label="Animated AI compliance interviewer avatar"
              >
                <rect x="20" y="18" width="200" height="140" rx="16" fill="#0F243E" stroke="#264366" strokeWidth="1.5" />
                <rect x="36" y="32" width="76" height="92" rx="8" fill="#173457" opacity="0.7" />
                <rect x="124" y="32" width="80" height="52" rx="8" fill="#173457" opacity="0.5" />
                <path
                  d="M42 222 C46 176, 80 156, 120 156 C160 156, 194 176, 198 222 Z"
                  fill="#1E3A5F"
                  stroke="#3B5B82"
                  strokeWidth="2"
                />
                <polygon points="106,158 134,158 120,206" fill="#F8FAFC" />
                <polygon points="116,166 124,166 126,204 120,214 114,204" fill="#C4A77D" />
                <rect x="106" y="132" width="28" height="28" rx="10" fill="#E0B696" />
                <ellipse cx="120" cy="102" rx="38" ry="44" fill="#E8C0A2" stroke="#CFA180" strokeWidth="1.5" />
                <path
                  d="M82 96 C82 58, 158 58, 158 96 C154 76, 138 68, 120 68 C102 68, 86 76, 82 96 Z"
                  fill="#1E293B"
                />
                <path d="M97 88 Q105 84 113 88" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M127 88 Q135 84 143 88" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                {blinkClosed ? (
                  <>
                    <line x1="99" y1="97" x2="111" y2="97" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
                    <line x1="129" y1="97" x2="141" y2="97" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <circle cx="105" cy="97" r="4.2" fill="#0F172A" />
                    <circle cx="106.5" cy="95.5" r="1.4" fill="#FFFFFF" />
                    <circle cx="135" cy="97" r="4.2" fill="#0F172A" />
                    <circle cx="136.5" cy="95.5" r="1.4" fill="#FFFFFF" />
                  </>
                )}
                <path d="M120 98 L118 111 L123 112" stroke="#C59472" strokeWidth="2" fill="none" strokeLinecap="round" />
                {roomState === 'INTERVIEWER_SPEAKING' && !isPaused ? (
                  <ellipse cx="120" cy="124" rx="8" ry="4.5" fill="#7F1D1D" stroke="#9F1239" strokeWidth="1.2">
                    <animate attributeName="ry" values="2;5.5;2.5;5;2" dur="0.6s" repeatCount="indefinite" />
                  </ellipse>
                ) : (
                  <path d="M110 123 Q120 128 130 123" stroke="#8C583A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                )}
              </svg>

              <div className="mt-2 text-center max-w-lg">
                <div className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
                  Q{currentIdx + 1} of {totalQ} · {currentQ.difficulty}
                </div>
                <p className="mt-1 text-sm sm:text-base font-semibold text-white leading-snug">
                  {followUpActive && (dynamicFollowUp || currentQ.followUpPrompt) ? (dynamicFollowUp || currentQ.followUpPrompt) : currentQ.prompt}
                </p>
                {clarificationShown && (
                  <p className="mt-2 text-xs text-sky-200 bg-sky-950/50 border border-sky-400/25 rounded-lg px-3 py-1.5">
                    <strong>Clarification:</strong>{' '}
                    {currentQ.contextHint ||
                      'State the applicable AML/KYC control, key red flags, investigative checks, and escalation rationale.'}
                  </p>
                )}
              </div>
            </div>

            {captionsOn && (
              <div className="rounded-xl bg-black/55 border border-white/10 px-3.5 py-2 text-xs text-slate-100 leading-relaxed">
                <span className="font-bold text-[#C4A77D] mr-1.5">Captions:</span>
                {spokenCaption || currentQ.prompt}
              </div>
            )}
          </section>

          {/* Right (Desktop) / PiP (Mobile): Candidate Camera */}
          <section
            aria-label="Candidate Camera"
            className="
              fixed bottom-24 right-4 z-30 w-32 h-24 rounded-xl overflow-hidden border-2 border-[#C4A77D]/70 shadow-2xl bg-[#0B192C]
              lg:static lg:w-auto lg:h-auto lg:min-h-[390px] lg:rounded-2xl lg:border lg:border-white/15 lg:shadow-none lg:flex lg:flex-col lg:justify-between lg:p-5
            "
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${
                !cameraEnabled || audioOnlyMode || mediaError ? 'hidden' : 'block'
              }`}
            />

            {(!cameraEnabled || audioOnlyMode || mediaError) && (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-[#0E223A] to-[#081322]">
                {mediaError ? (
                  <div className="space-y-2 max-w-sm">
                    <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                    <p className="text-[11px] lg:text-xs text-amber-200 leading-relaxed">{mediaError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setAudioOnlyMode((prev) => {
                          const next = !prev;
                          setCameraEnabled(!next);
                          return next;
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#C4A77D] text-[#081C33] cursor-pointer"
                    >
                      {audioOnlyMode ? 'Audio-Only Active' : 'Continue Audio-Only'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="w-11 h-11 rounded-full bg-white/10 text-[#C4A77D] font-bold flex items-center justify-center mx-auto text-sm">
                      You
                    </div>
                    <div className="text-[11px] lg:text-xs font-semibold text-slate-300">
                      {audioOnlyMode ? 'Audio-Only Mode' : 'Camera Off'}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="hidden lg:flex items-center justify-between pt-3 text-xs text-slate-300">
              <span className="font-semibold text-white">Candidate Preview (Local Only)</span>
              <span className="text-slate-400">
                {micEnabled ? 'Mic On' : 'Mic Muted'} · {audioOnlyMode ? 'Audio Only' : cameraEnabled ? 'Cam On' : 'Cam Off'}
              </span>
            </div>
          </section>
        </div>

        {/* Response & Follow-Up Controls */}
        <div className="rounded-2xl bg-[#0D1E30] border border-white/15 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  playInterviewerLine(
                    followUpActive && (dynamicFollowUp || currentQ.followUpPrompt) ? (dynamicFollowUp || currentQ.followUpPrompt) : currentQ.prompt
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-100 border border-white/15 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#C4A77D]" />
                Repeat Question
              </button>
              <button
                type="button"
                onClick={() => (isListeningStt ? stopVoiceCapture() : startVoiceCapture())}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                  isListeningStt
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                    : 'bg-white/10 hover:bg-white/15 text-slate-100 border-white/15'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-[#C4A77D]" />
                {isListeningStt ? 'Done Speaking' : 'Speak Answer'}
              </button>
              <button
                type="button"
                onClick={toggleVoiceClip}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                  isRecordingClip
                    ? 'bg-rose-500/20 border-rose-400/50 text-rose-200'
                    : 'bg-white/10 hover:bg-white/15 text-slate-100 border-white/15'
                }`}
              >
                {isRecordingClip ? 'Stop Clip' : 'Record Voice Clip'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setClarificationShown(true);
                  playInterviewerLine(
                    currentQ.contextHint ||
                      'Explain the control objective, red flags, verification steps, and escalation criteria.'
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-100 border border-white/15 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#C4A77D]" />
                Clarify
              </button>
              <button
                type="button"
                onClick={() => setTextFallbackOpen((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-100 border border-white/15 cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5 text-[#C4A77D]" />
                {textFallbackOpen ? 'Compact Box' : 'Expand Typed Box'}
              </button>
            </div>

            {!latestFeedback && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={() => handleSubmit({ skipped: true })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/15 text-slate-300 hover:bg-white/5 disabled:opacity-50 cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Skip
                </button>
                <button
                  type="button"
                  disabled={isEvaluating || !answerText.trim()}
                  onClick={() => handleSubmit({ skipped: false })}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#C4A77D] hover:bg-[#d4ba8f] text-[#081C33] disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
                </button>
              </div>
            )}
          </div>

          {statusMessage && <p className="text-xs text-[#E5CFA8]">{statusMessage}</p>}

          {!latestFeedback ? (
            <>
              {(isListeningStt || isRecordingClip || micLevel > 0) && (
                <div className="mb-2 flex items-center gap-3 text-[11px] text-slate-300">
                  <span>Mic input level:</span>
                  <div className="h-2 flex-1 max-w-[180px] rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#C4A77D] transition-all duration-75"
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                  <span>{micLevel}%</span>
                </div>
              )}
              {voiceClipUrl && (
                <div className="mb-2 flex items-center gap-2">
                  <audio controls src={voiceClipUrl} className="h-8 max-w-full" />
                </div>
              )}
              {interimTranscript && (
                <div className="mb-2 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-3 py-1.5">
                  <strong>Hearing live:</strong> {interimTranscript}
                </div>
              )}
              <textarea
              rows={textFallbackOpen ? 3 : 2}
              maxLength={MAX_ANSWER_CHARS}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Speak aloud when prompted or type your response here..."
                className="w-full rounded-xl bg-[#081C33] border border-white/15 p-3 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4A77D]"
              />
            </>
          ) : (
            <div className="rounded-xl bg-[#081C33] border border-white/15 p-4 space-y-2.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Response Score: {latestFeedback.evaluation.totalScore}/100
                </div>
                <div className="flex items-center gap-2">
                  {!followUpActive && (dynamicFollowUp || currentQ.followUpPrompt) && currentIdx + 1 < totalQ && (
                    <button
                      type="button"
                      onClick={() => {
                        setFollowUpActive(true);
                        setLatestFeedback(null);
                        setAnswerText('');
                      }}
                      className="px-3 py-1.5 rounded-xl font-semibold border border-[#C4A77D]/60 text-[#E5CFA8] hover:bg-[#C4A77D]/10 cursor-pointer"
                    >
                      Ask Follow-Up
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-1.5 rounded-xl font-bold bg-[#C4A77D] text-[#081C33] hover:bg-[#d4ba8f] cursor-pointer"
                  >
                    {currentIdx + 1 >= totalQ ? 'Finish & View Report' : 'Next Question'}
                  </button>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-[#C4A77D]">Model Answer:</strong> {latestFeedback.evaluation.suggestedAnswer}
              </p>
            </div>
          )}
        </div>

        {settingsOpen && (
          <div className="rounded-2xl bg-[#0D1E30] border border-white/15 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Camera Device</label>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                disabled={audioOnlyMode}
                className="w-full rounded-xl bg-[#081C33] border border-white/15 px-3 py-2 text-slate-100 disabled:opacity-50"
              >
                {cameras.length === 0 ? (
                  <option value="">Default Camera</option>
                ) : (
                  cameras.map((c, idx) => (
                    <option key={c.deviceId || idx} value={c.deviceId}>
                      {c.label || `Camera ${idx + 1}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Microphone Device</label>
              <select
                value={selectedMicId}
                onChange={(e) => setSelectedMicId(e.target.value)}
                className="w-full rounded-xl bg-[#081C33] border border-white/15 px-3 py-2 text-slate-100"
              >
                {mics.length === 0 ? (
                  <option value="">Default Microphone</option>
                ) : (
                  mics.map((m, idx) => (
                    <option key={m.deviceId || idx} value={m.deviceId}>
                      {m.label || `Microphone ${idx + 1}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={() => {
                  setAudioOnlyMode((prev) => {
                    const next = !prev;
                    setCameraEnabled(!next);
                    return next;
                  });
                }}
                className="w-full px-3 py-2 rounded-xl font-bold border border-[#C4A77D]/50 text-[#E5CFA8] hover:bg-[#C4A77D]/10 cursor-pointer"
              >
                {audioOnlyMode ? 'Disable Audio-Only' : 'Switch to Audio-Only'}
              </button>
            </div>
          </div>
        )}

        {confirmEndOpen && (
          <div className="rounded-2xl bg-amber-950/70 border border-amber-500/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-amber-100">
              <strong>End interview now?</strong> Answered questions will generate your practice report.
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmEndOpen(false)}
                className="px-3.5 py-2 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/15 cursor-pointer"
              >
                Resume
              </button>
              <button
                type="button"
                onClick={() => {
                  clearTimersAndSpeech();
                  stopMediaStream();
                  setConfirmEndOpen(false);
                  onCompleteSession({
                    ...session,
                    elapsedSeconds: elapsed,
                    completedEarly: true,
                  });
                }}
                className="px-3.5 py-2 rounded-xl font-bold bg-[#C4A77D] text-[#081C33] hover:bg-[#d4ba8f] cursor-pointer"
              >
                End &amp; Report
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Control Bar */}
      <footer className="px-4 sm:px-6 py-3 border-t border-white/10 bg-[#081C33]/95">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 font-bold text-white">
              <Clock className="w-3.5 h-3.5 text-[#C4A77D]" />
              {formatDuration(elapsed)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold">
                Q{currentIdx + 1}/{totalQ}
              </span>
              <div className="w-24 sm:w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#C4A77D] transition-all duration-300"
                  style={{ width: `${Math.max(completionPct, Math.round(((currentIdx + 1) / totalQ) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMicEnabled((p) => !p)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                micEnabled
                  ? 'bg-white/10 border-white/15 text-white hover:bg-white/15'
                  : 'bg-red-500/20 border-red-400/40 text-red-200'
              }`}
            >
              {micEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{micEnabled ? 'Mic On' : 'Mic Muted'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (audioOnlyMode) {
                  setAudioOnlyMode(false);
                  setCameraEnabled(true);
                } else {
                  setCameraEnabled((p) => !p);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                cameraEnabled && !audioOnlyMode
                  ? 'bg-white/10 border-white/15 text-white hover:bg-white/15'
                  : 'bg-amber-500/20 border-amber-400/40 text-amber-200'
              }`}
            >
              {cameraEnabled && !audioOnlyMode ? (
                <Camera className="w-3.5 h-3.5" />
              ) : (
                <CameraOff className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{cameraEnabled && !audioOnlyMode ? 'Camera' : 'Cam Off'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTtsEnabled((p) => {
                  const next = !p;
                  if (!next) clearTimersAndSpeech();
                  return next;
                });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                ttsEnabled
                  ? 'bg-[#C4A77D]/20 border-[#C4A77D]/50 text-[#F3DFB8]'
                  : 'bg-white/10 border-white/15 text-slate-300'
              }`}
            >
              {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#C4A77D]" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCaptionsOn((p) => !p)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                captionsOn
                  ? 'bg-[#C4A77D]/20 border-[#C4A77D]/50 text-[#F3DFB8]'
                  : 'bg-white/10 border-white/15 text-slate-300'
              }`}
            >
              <Captions className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Captions</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen((p) => !p)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Audio Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmEndOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              End Interview
            </button>
          </div>
        </div>
      </footer>
    </div>
    );
  } catch (renderErr) {
    return (
      <div className="min-h-[70vh] bg-[#081C33] text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full rounded-2xl border border-rose-400/40 bg-slate-900/90 p-5 space-y-2">
          <h2 className="text-base font-bold text-rose-300">Live AI Interview Render Error</h2>
          <p className="text-xs text-slate-200 font-mono break-all">
            {renderErr?.message || String(renderErr)}
          </p>
          <pre className="text-[11px] text-slate-400 overflow-x-auto max-h-48 whitespace-pre-wrap">
            {renderErr?.stack || ''}
          </pre>
        </div>
      </div>
    );
  }
}
