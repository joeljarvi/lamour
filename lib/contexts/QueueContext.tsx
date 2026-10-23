"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useArticles } from "./ArticlesContext";

// Where the queue is kept in the browser between visits
const STORAGE_KEY = "lamour-queue";

type QueueContextValue = {
  // Queued article ids, in the order they were added
  queue: string[];
  // Whether the stored queue has been read (changes made on opening an
  // article wait for it, so the stored queue doesn't overwrite them)
  loaded: boolean;
  isQueued: (id: string) => boolean;
  addToQueue: (id: string) => void;
  // Adds several at the end, in order, skipping ones already queued
  addAllToQueue: (ids: string[]) => void;
  removeFromQueue: (id: string) => void;
  // Empties the queue
  clearQueue: () => void;
  // Adds the article, or removes it if it's already queued
  toggleQueued: (id: string) => void;
};

const QueueContext = createContext<QueueContextValue>({
  queue: [],
  loaded: false,
  isQueued: () => false,
  addToQueue: () => {},
  addAllToQueue: () => {},
  removeFromQueue: () => {},
  clearQueue: () => {},
  toggleQueued: () => {},
});

// The reading queue ("läs senare"): articles saved to read later. Kept in
// the browser's storage, so it lasts between visits on this device; starts
// empty (and stays so) where storage isn't available
export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<string[]>([]);
  // Whether the stored queue has been read, so the empty starting queue
  // isn't saved over it
  const [loaded, setLoaded] = useState(false);

  // Read after the first render, so server and browser render alike
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(stored)) {
        const ids = stored.filter((id): id is string => typeof id === "string");
        // Stored ones first, then any added before this ran (a child's
        // effects run before this one, e.g. the reader queueing a series)
        setQueue((prev) => [...ids, ...prev.filter((id) => !ids.includes(id))]);
      }
    } catch {
      // No storage (private window, blocked): keep the empty queue
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch {
      // No storage: the queue lasts until the page is closed
    }
  }, [queue, loaded]);

  const isQueued = (id: string) => queue.includes(id);
  const addToQueue = (id: string) =>
    setQueue((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const addAllToQueue = (ids: string[]) =>
    setQueue((prev) => [
      ...prev,
      ...ids.filter((id, i) => !prev.includes(id) && ids.indexOf(id) === i),
    ]);
  const removeFromQueue = (id: string) =>
    setQueue((prev) => prev.filter((i) => i !== id));
  const clearQueue = () => setQueue([]);
  const toggleQueued = (id: string) =>
    setQueue((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  return (
    <QueueContext.Provider
      value={{
        queue,
        loaded,
        isQueued,
        addToQueue,
        addAllToQueue,
        removeFromQueue,
        clearQueue,
        toggleQueued,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  return useContext(QueueContext);
}

// The next article to read: the first queued one that isn't the article
// being read (and is still among the articles); null if there's none
export function useNextInQueue(currentSlug: string) {
  const { queue } = useQueue();
  const { articles } = useArticles();
  for (const id of queue) {
    const article = articles.find((a) => a._id === id);
    if (article && article.slug.current !== currentSlug) return article;
  }
  return null;
}

// The article "Nästa artikel" leads to: the next one in the queue, or,
// with none queued, the next article in the current one's series (the
// first published after it; the list is newest first); null if neither
export function useNextArticle(currentSlug: string) {
  const queued = useNextInQueue(currentSlug);
  const { articles } = useArticles();
  if (queued) return queued;
  const index = articles.findIndex((a) => a.slug.current === currentSlug);
  const seriesSlug = articles[index]?.series?.slug.current;
  if (!seriesSlug) return null;
  for (let i = index - 1; i >= 0; i--) {
    if (articles[i].series?.slug.current === seriesSlug) return articles[i];
  }
  return null;
}
