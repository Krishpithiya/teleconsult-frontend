"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCircle2, Calendar, AlertCircle, Stethoscope, FileText } from "lucide-react";
import { getSocket } from "@/lib/socket";
import useAuth from "@/hooks/useAuth";

interface Notification {
  id:        string;
  type:      string;
  title:     string;
  message:   string;
  timestamp: string;
  read:      boolean;
  data?:     Record<string, unknown>;
}

// ─── Map notification type → icon + color ─────────────────────────────────
const notifConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  appointment_confirmed: {
    icon:  <CheckCircle2 size={15} />,
    color: "text-emerald-600",
    bg:    "bg-emerald-50",
  },
  appointment_cancelled: {
    icon:  <AlertCircle size={15} />,
    color: "text-red-500",
    bg:    "bg-red-50",
  },
  appointment_completed: {
    icon:  <CheckCircle2 size={15} />,
    color: "text-[#1D6FA4]",
    bg:    "bg-sky-50",
  },
  new_appointment: {
    icon:  <Calendar size={15} />,
    color: "text-[#1D6FA4]",
    bg:    "bg-sky-50",
  },
  doctor_verified: {
    icon:  <Stethoscope size={15} />,
    color: "text-emerald-600",
    bg:    "bg-emerald-50",
  },
  prescription_ready: {
    icon:  <FileText size={15} />,
    color: "text-purple-600",
    bg:    "bg-purple-50",
  },
};

const NotificationBell = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen,        setIsOpen]        = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Connect socket + register user ─────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("register-user", user._id);

    socket.on("notification", (notif: Omit<Notification, "read">) => {
      setNotifications(prev => [{ ...notif, read: false }, ...prev].slice(0, 20));
    });

    return () => {
      socket.off("notification");
    };
  }, [isAuthenticated, user]);

  // ── Close dropdown on outside click ────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const clearAll = () => setNotifications([]);

  const markRead = (id: string) =>
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

  const formatTime = (ts: string) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60)   return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAllRead(); }}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-[#7A90A4]"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E5ECF4] z-50 animate-fade-in overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5ECF4]">
            <div>
              <h3 className="text-sm font-semibold text-[#0D1B2A]"
                style={{ fontFamily: "'Sora',sans-serif" }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-xs text-[#7A90A4]">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#1D6FA4] hover:text-[#0F4C75] font-medium"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-xs text-[#7A90A4] hover:text-[#3D5166]"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={24} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-[#7A90A4]">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const config = notifConfig[notif.type] || {
                  icon:  <Bell size={15} />,
                  color: "text-[#7A90A4]",
                  bg:    "bg-slate-50",
                };
                return (
                  <div
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={`
                      flex gap-3 px-4 py-3 border-b border-slate-50
                      hover:bg-slate-50 transition-colors cursor-pointer
                      ${!notif.read ? "bg-sky-50/40" : ""}
                    `}
                  >
                    {/* Icon */}
                    <div className={`
                      w-8 h-8 rounded-xl flex items-center justify-center
                      flex-shrink-0 ${config.bg} ${config.color}
                    `}>
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-semibold text-[#0D1B2A] leading-tight">
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <div className="w-1.5 h-1.5 bg-[#1D6FA4] rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-[#7A90A4] mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-[#7A90A4] mt-1">
                        {formatTime(notif.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;