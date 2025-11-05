import { useEffect } from "react";

export default function EmbedScriptLoader({ needs = {} }) {
  useEffect(() => {
    const tasks = [];
    if (needs.instagram) tasks.push(loadOnce("instgrm-script", "https://www.instagram.com/embed.js"));
    return () => {};
  }, [needs]);
  return null;
}

function loadOnce(id, src) {
  return new Promise((resolve) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement("script");
    s.id = id; s.src = src; s.async = true; s.onload = resolve; s.onerror = resolve;
    document.body.appendChild(s);
  });
}