import { create } from "zustand";

export type CallState = "idle" | "ringing" | "connecting" | "connected" | "ended";

export type TranscriptMessage = {
  id: string;
  sender: string;
  original_text: string;
  translated_text: string | null;
  language_code: string | null;
  timestamp?: string | null;
};

type CallStore = {
  callState: CallState;
  sessionId: string | null;
  callerNumber: string | null;
  callerLanguage: string | null;
  messages: TranscriptMessage[];
  isConnected: boolean;

  setCallState: (state: CallState) => void;
  setSessionId: (id: string | null) => void;
  setCallerNumber: (num: string | null) => void;
  setCallerLanguage: (lang: string | null) => void;
  addMessage: (msg: TranscriptMessage) => void;
  setIsConnected: (connected: boolean) => void;
  resetCall: () => void;
};

/** Global call state shared between NormalCall and TranslatePhoneCall screens */
export const useCallStore = create<CallStore>((set) => ({
  callState: "idle",
  sessionId: null,
  callerNumber: null,
  callerLanguage: null,
  messages: [],
  isConnected: false,

  setCallState: (callState) => set({ callState }),
  setSessionId: (sessionId) => set({ sessionId }),
  setCallerNumber: (callerNumber) => set({ callerNumber }),
  setCallerLanguage: (callerLanguage) => set({ callerLanguage }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setIsConnected: (isConnected) => set({ isConnected }),
  resetCall: () =>
    set({
      callState: "idle",
      sessionId: null,
      callerNumber: null,
      callerLanguage: null,
      messages: [],
    }),
}));
