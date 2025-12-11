// src/context/VolunteerContext.jsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";
  import { EVENTS } from "../data/events";
  
  const VolunteerContext = createContext(null);
  
  const LS_STATE_KEY = "ared_volState_v1";
  const LS_MY_KEY = "ared_mySignups_v1";
  
  export function VolunteerProvider({ children }) {
    // Build initial state from EVENTS + localStorage merge
    const [volState, setVolState] = useState(() => {
      const base = {};
  
      // base from EVENTS
      for (const e of EVENTS) {
        if (e._isVolunteer && e._volCapacity) {
          base[e.id] = {
            signed: e._volInitialSigned ?? 0,
            capacity: e._volCapacity,
          };
        }
      }
  
      if (typeof window === "undefined") return base;
  
      // merge with stored
      try {
        const raw = window.localStorage.getItem(LS_STATE_KEY);
        if (raw) {
          const stored = JSON.parse(raw);
          if (stored && typeof stored === "object") {
            for (const [id, st] of Object.entries(stored)) {
              if (base[id]) {
                const cap = base[id].capacity ?? st.capacity ?? 0;
                const signed = Math.min(
                  st.signed ?? base[id].signed ?? 0,
                  cap || (st.signed ?? 0)
                );
                base[id] = { signed, capacity: cap };
              }
            }
          }
        }
      } catch {
        // ignore bad JSON
      }
  
      return base;
    });
  
    // Per-browser: which events THIS user has signed up for
    const [mySignups, setMySignups] = useState(() => {
      if (typeof window === "undefined") return new Set();
      try {
        const raw = window.localStorage.getItem(LS_MY_KEY);
        if (!raw) return new Set();
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return new Set();
        return new Set(arr);
      } catch {
        return new Set();
      }
    });
  
    // Persist whenever things change
    useEffect(() => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(LS_STATE_KEY, JSON.stringify(volState));
      } catch {
        /* ignore */
      }
    }, [volState]);
  
    useEffect(() => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(LS_MY_KEY, JSON.stringify([...mySignups]));
      } catch {
        /* ignore */
      }
    }, [mySignups]);
  
    const getStatus = (eventId) => {
      const base = volState[eventId];
      if (!base) return { signed: 0, capacity: 0, full: false };
      const full = base.capacity > 0 && base.signed >= base.capacity;
      return { ...base, full };
    };
  
    const hasSigned = (eventId) => mySignups.has(eventId);
  
    const signup = (eventId) => {
      setVolState((prev) => {
        const cur = prev[eventId];
        if (!cur) return prev;
  
        if (cur.capacity && cur.signed >= cur.capacity) return prev; // already full
  
        return {
          ...prev,
          [eventId]: { ...cur, signed: cur.signed + 1 },
        };
      });
  
      setMySignups((prev) => {
        const next = new Set(prev);
        next.add(eventId);
        return next;
      });
    };
  
    const unsign = (eventId) => {
      setVolState((prev) => {
        const cur = prev[eventId];
        if (!cur) return prev;
  
        const nextSigned = Math.max(0, (cur.signed ?? 0) - 1);
        return {
          ...prev,
          [eventId]: { ...cur, signed: nextSigned },
        };
      });
  
      setMySignups((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    };
  
    return (
      <VolunteerContext.Provider
        value={{ getStatus, signup, unsign, hasSigned }}
      >
        {children}
      </VolunteerContext.Provider>
    );
  }
  
  export function useVolunteer() {
    const ctx = useContext(VolunteerContext);
    if (!ctx) {
      throw new Error("useVolunteer must be used inside a VolunteerProvider");
    }
    return ctx;
  }