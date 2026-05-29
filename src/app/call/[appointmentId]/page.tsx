"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorSpeaker,
  Wifi,
  WifiOff,
  Maximize2,
  User,
  Clock,
} from "lucide-react";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

type ConnectionState = "connecting" | "connected" | "disconnected" | "failed";

// Module-level guard - survives StrictMode double-mount
let callSetupDone = false;

export default function VideoCallPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentUserRef = useRef<any>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  // callSetupDone is module-level (defined above component)

  const [roomId, setRoomId] = useState("");
  const [peerName, setPeerName] = useState("");
  const [callState, setCallState] = useState<ConnectionState>("connecting");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [peerMicOn, setPeerMicOn] = useState(true);
  const [peerCamOn, setPeerCamOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  // Call timer
  useEffect(() => {
    if (callState !== "connected") return;
    const t = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [callState]);

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Create peer connection ────────────────────────────────────────────────
  const createPeerConnection = useCallback((targetSocketId: string) => {
    // Close any previous connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    localStreamRef.current
      ?.getTracks()
      .forEach((track) => pc.addTrack(track, localStreamRef.current!));

    pc.ontrack = (event) => {
      console.log("✅ REMOTE TRACK RECEIVED");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setLoading(false);
      setCallState("connected");
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", {
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("WebRTC state:", pc.connectionState);
      if (pc.connectionState === "connected") setCallState("connected");
      if (pc.connectionState === "disconnected") setCallState("disconnected");
      if (pc.connectionState === "failed") setCallState("failed");
    };

    return pc;
  }, []);

  // ── Main setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Wait for auth to finish hydrating — prevents doctor redirect to /login
    if (authLoading) return;

    // Module-level guard prevents double-init from StrictMode/re-renders
    if (callSetupDone) return;
    callSetupDone = true;

    const storedUser =
      user ||
      JSON.parse(
        localStorage.getItem("teleconsult_user") ||
          localStorage.getItem("user") ||
          "null",
      );

    if (!storedUser) {
      toast.error("Please login again.");
      router.push("/login");
      return;
    }
    currentUserRef.current = storedUser;

    const setupCall = async () => {
      try {
        // 1. Get room ID from backend
        const res = await api.get(`/appointments/${appointmentId}/room`);
        const { videoRoomId } = res.data;
        console.log("ROOM ID:", videoRoomId);
        setRoomId(videoRoomId);

        // 2. Get camera + mic
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // 3. Connect socket — use same host as the browser page
        // localhost → 127.0.0.1 (avoids Windows DNS timeout for localhost)
        // 10.x.x.x → same IP (phone connecting through network)
        // const rawHost   = window.location.hostname;
        // const socketHost = rawHost === 'localhost' ? '127.0.0.1' : rawHost;
        // const socketURL  = `http://${socketHost}:5000`;

        const socketURL =
          process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
        console.log("🔌 Connecting socket to:", socketURL);

        const socket = io(socketURL, {
          withCredentials: true,
          transports: ["websocket", "polling"],
          forceNew: true,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("✅ SOCKET:", socket.id);
          socket.emit("join-room", {
            roomId: videoRoomId,
            userId: storedUser._id || storedUser.id,
            role: storedUser.role,
            name: storedUser.name,
          });
        });

        socket.on("connect_error", (err) => {
          console.error("❌ SOCKET ERROR:", err.message);
          toast.error("Socket connection failed");
        });

        // Room is full — shouldn't happen in normal flow
        socket.on("room-full", () => {
          toast.error("Call room is full.");
          router.back();
        });

        // Someone was already here when we joined
        socket.on("room-participants", (participants) => {
          console.log("👥 Existing participants:", participants);
          if (participants.length > 0) {
            setPeerName(participants[0].name);
            setLoading(false);
          }
        });

        // New person joined after us → we create the offer
        socket.on("user-joined", async ({ socketId, name }) => {
          console.log("👤 USER JOINED:", name, socketId);
          setPeerName(name);
          setLoading(false);

          const pc = createPeerConnection(socketId);
          pcRef.current = pc;

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("offer", {
            targetSocketId: socketId,
            offer,
            fromName: storedUser.name,
          });
        });

        // We received an offer → send back answer
        socket.on("offer", async ({ offer, fromSocketId, fromName }) => {
          console.log("📥 OFFER FROM:", fromName);
          setPeerName(fromName);
          setLoading(false);

          const pc = createPeerConnection(fromSocketId);
          pcRef.current = pc;

          await pc.setRemoteDescription(new RTCSessionDescription(offer));

          // Apply queued ICE candidates
          for (const c of pendingIceRef.current) {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingIceRef.current = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("answer", { targetSocketId: fromSocketId, answer });
        });

        // We received the answer to our offer
        socket.on("answer", async ({ answer }) => {
          console.log("📥 ANSWER RECEIVED");
          if (!pcRef.current) return;

          // Only accept answer when we're waiting for one
          if (pcRef.current.signalingState !== "have-local-offer") {
            console.warn(
              "⚠️ Ignoring answer in state:",
              pcRef.current.signalingState,
            );
            return;
          }

          await pcRef.current.setRemoteDescription(
            new RTCSessionDescription(answer),
          );

          for (const c of pendingIceRef.current) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingIceRef.current = [];
        });

        // ICE candidate from peer
        socket.on("ice-candidate", async ({ candidate }) => {
          if (!pcRef.current || !pcRef.current.remoteDescription) {
            pendingIceRef.current.push(candidate);
            return;
          }
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error("ICE error:", e);
          }
        });

        socket.on("peer-media-toggle", ({ type, enabled }) => {
          if (type === "audio") setPeerMicOn(enabled);
          if (type === "video") setPeerCamOn(enabled);
        });

        socket.on("call-ended", () => {
          toast("Call ended by the other person", { icon: "📞" });
          handleLeave(false);
        });

        socket.on("peer-disconnected", () => {
          setCallState("disconnected");
          setPeerName("");
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
          toast.error("Peer disconnected");
        });
      } catch (err: any) {
        console.error("SETUP ERROR:", err);
        if (err.name === "NotAllowedError")
          toast.error("Camera/mic permission denied.");
        else if (err.name === "NotReadableError")
          toast.error("Camera already in use.");
        else if (err.name === "NotFoundError")
          toast.error("No camera or microphone found.");
        else toast.error(err.response?.data?.message || "Failed to join call.");
        router.back();
      }
    };

    setupCall();

    return () => {
      callSetupDone = false; // reset so re-joining works
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [appointmentId, authLoading, createPeerConnection, router, user]);

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
    socketRef.current?.emit("media-toggle", {
      roomId,
      type: "audio",
      enabled: track.enabled,
    });
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamOn(track.enabled);
    socketRef.current?.emit("media-toggle", {
      roomId,
      type: "video",
      enabled: track.enabled,
    });
  };

  const handleLeave = (emitEvent = true) => {
    if (emitEvent && roomId) socketRef.current?.emit("end-call", { roomId });
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    socketRef.current?.disconnect();
    socketRef.current = null;
    const u = currentUserRef.current || user;
    router.push(
      u?.role === "doctor"
        ? "/dashboard/doctor/appointments"
        : "/dashboard/patient/appointments",
    );
  };

  const statusConfig: Record<
    ConnectionState,
    { label: string; color: string }
  > = {
    connecting: { label: "Connecting...", color: "text-amber-400" },
    connected: { label: "Connected", color: "text-emerald-400" },
    disconnected: { label: "Disconnected", color: "text-red-400" },
    failed: { label: "Failed", color: "text-red-500" },
  };

  return (
    <div
      className="min-h-screen bg-slate-900 flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 backdrop-blur border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <span
            className="text-white font-semibold text-sm"
            style={{ fontFamily: "'Sora',sans-serif" }}
          >
            TeleConsult
          </span>
          {peerName && (
            <span className="text-[#7A90A4] text-sm">· with {peerName}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {callState === "connected" ? (
              <Wifi size={14} className="text-emerald-400" />
            ) : (
              <WifiOff size={14} className="text-[#7A90A4]" />
            )}
            <span
              className={`text-xs font-medium ${statusConfig[callState].color}`}
            >
              {statusConfig[callState].label}
            </span>
          </div>
          {callState === "connected" && (
            <div className="flex items-center gap-1.5 bg-slate-700 px-3 py-1.5 rounded-full">
              <Clock size={12} className="text-[#7A90A4]" />
              <span className="text-slate-200 text-xs font-mono font-medium">
                {formatDuration(callDuration)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-800">
          {/* Remote video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Waiting overlay */}
          {(loading || (!peerName && callState !== "connected")) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center mb-6 animate-pulse">
                <User size={36} className="text-white" />
              </div>
              <p
                className="text-white text-lg font-semibold"
                style={{ fontFamily: "'Sora',sans-serif" }}
              >
                {loading ? "Setting up call..." : "Waiting for other person..."}
              </p>
              <p className="text-[#7A90A4] text-sm mt-2">
                Doctor will join shortly
              </p>
              <div className="flex gap-1.5 mt-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Peer camera off */}
          {!peerCamOn && callState === "connected" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
              <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mb-3">
                <VideoOff size={32} className="text-[#7A90A4]" />
              </div>
              <p className="text-[#7A90A4] text-sm">
                {peerName} turned off camera
              </p>
            </div>
          )}

          {/* Peer name label */}
          {peerName && callState === "connected" && (
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1.5 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white text-sm font-medium">{peerName}</span>
              {!peerMicOn && <MicOff size={12} className="text-red-400" />}
            </div>
          )}
        </div>

        {/* Local video PiP */}
        <div className="absolute bottom-4 right-4 w-40 sm:w-48 aspect-video rounded-2xl overflow-hidden border-2 border-slate-600 shadow-2xl bg-slate-700">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!camOn ? "invisible" : ""}`}
          />
          {!camOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
              <VideoOff size={20} className="text-[#7A90A4]" />
            </div>
          )}
          <div className="absolute bottom-1.5 left-1.5 bg-black/60 px-2 py-0.5 rounded-lg">
            <span className="text-white text-[10px] font-medium">You</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800/90 backdrop-blur border-t border-slate-700 px-6 py-5">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
              micOn
                ? "bg-slate-700 hover:bg-slate-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={toggleCam}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
              camOn
                ? "bg-slate-700 hover:bg-slate-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {camOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            className="w-12 h-12 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-all duration-200 active:scale-95"
            title="Screen share coming soon"
          >
            <MonitorSpeaker size={20} />
          </button>

          <button
            onClick={() => {
              if (!document.fullscreenElement)
                document.documentElement.requestFullscreen();
              else document.exitFullscreen();
            }}
            className="w-12 h-12 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-all duration-200 active:scale-95"
          >
            <Maximize2 size={20} />
          </button>

          <button
            onClick={() => handleLeave(true)}
            className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-full z-50 hover:bg-red-700 transition-colors"
          >
            End Call
          </button>
        </div>

        <p className="text-center text-[#7A90A4] text-xs mt-3">
          {callState === "connected"
            ? "End-to-end encrypted · WebRTC"
            : "Establishing secure connection..."}
        </p>
      </div>
    </div>
  );
}
