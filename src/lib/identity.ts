"use client";

import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

// Anonymous device identity — powers likes, bookmarks, comments,
// uploads and the private-by-default Dream Journal.
export interface Identity {
  id: string;
  name: string;
}

const KEY_ID = "aesthetica_uid";
const KEY_NAME = "aesthetica_name";

const NAME_POOL = [
  "Neon Drifter",
  "Cloud Cartographer",
  "Static Poet",
  "Chrome Ghost",
  "Meadow Wanderer",
  "Rain Archivist",
  "Corridor Walker",
  "Sunset Driver",
  "Signal Diver",
  "Memory Keeper",
];

export function getIdentity(): Identity {
  if (typeof window === "undefined") return { id: "", name: "" };
  let id = localStorage.getItem(KEY_ID);
  if (!id) {
    id = uuid();
    localStorage.setItem(KEY_ID, id);
  }
  let name = localStorage.getItem(KEY_NAME);
  if (!name) {
    name = NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];
    localStorage.setItem(KEY_NAME, name);
  }
  return { id, name };
}

export function setName(name: string) {
  localStorage.setItem(KEY_NAME, name);
}

export function useIdentity(): Identity {
  const [ident, setIdent] = useState<Identity>({ id: "", name: "" });
  useEffect(() => {
    const id = requestAnimationFrame(() => setIdent(getIdentity()));
    return () => cancelAnimationFrame(id);
  }, []);
  return ident;
}

// Auth header for API calls
export function authHeaders(): HeadersInit {
  const ident = getIdentity();
  return {
    "Content-Type": "application/json",
    "x-user-id": ident.id || "anon",
    "x-user-name": encodeURIComponent(ident.name || "Anonymous Dreamer"),
  };
}
