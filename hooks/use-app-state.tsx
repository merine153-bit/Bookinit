"use client";

import * as React from "react";
import type { SavedEntityType } from "@/types";

const STORAGE_KEY = "eatit:state:v1";

interface PersistedState {
  likedPosts: string[];
  saved: Array<{ type: SavedEntityType; id: string }>;
  following: string[];
  seenStories: string[];
}

const EMPTY: PersistedState = { likedPosts: [], saved: [], following: [], seenStories: [] };

interface AppStateValue {
  /** يصبح true بعد قراءة الحالة المحفوظة — يمنع اختلاف العرض بين الخادم والمتصفح. */
  ready: boolean;
  isLiked: (postId: string) => boolean;
  toggleLike: (postId: string) => boolean;
  isSaved: (type: SavedEntityType, id: string) => boolean;
  toggleSave: (type: SavedEntityType, id: string) => boolean;
  savedIds: (type: SavedEntityType) => string[];
  savedCount: number;
  isFollowing: (restaurantId: string) => boolean;
  toggleFollow: (restaurantId: string) => boolean;
  isStorySeen: (storyId: string) => boolean;
  markStorySeen: (storyId: string) => void;
}

const AppStateContext = React.createContext<AppStateValue | null>(null);

/**
 * حالة التفاعل الخاصة بالمتصفح (إعجاب/حفظ/متابعة/قصص مشاهدة).
 * تُحفظ محلياً لهذا الجهاز؛ عند ربط Supabase تُزامَن مع جداول
 * post_likes و saved_items و restaurant_followers.
 */
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<PersistedState>(EMPTY);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as PersistedState) });
    } catch {
      // تخزين غير متاح (وضع التصفح الخاص) — نتابع بالحالة الافتراضية.
    }
    setReady(true);
  }, []);

  const persist = React.useCallback((next: PersistedState) => {
    setState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // تجاهل — التخزين المحلي ليس شرطاً لعمل الواجهة.
    }
  }, []);

  const value = React.useMemo<AppStateValue>(() => {
    const savedKey = (type: SavedEntityType, id: string) => `${type}:${id}`;
    const savedSet = new Set(state.saved.map((s) => savedKey(s.type, s.id)));

    return {
      ready,
      isLiked: (postId) => state.likedPosts.includes(postId),
      toggleLike: (postId) => {
        const liked = state.likedPosts.includes(postId);
        persist({
          ...state,
          likedPosts: liked
            ? state.likedPosts.filter((id) => id !== postId)
            : [...state.likedPosts, postId],
        });
        return !liked;
      },
      isSaved: (type, id) => savedSet.has(savedKey(type, id)),
      toggleSave: (type, id) => {
        const isSaved = savedSet.has(savedKey(type, id));
        persist({
          ...state,
          saved: isSaved
            ? state.saved.filter((s) => !(s.type === type && s.id === id))
            : [...state.saved, { type, id }],
        });
        return !isSaved;
      },
      savedIds: (type) => state.saved.filter((s) => s.type === type).map((s) => s.id),
      savedCount: state.saved.length,
      isFollowing: (restaurantId) => state.following.includes(restaurantId),
      toggleFollow: (restaurantId) => {
        const following = state.following.includes(restaurantId);
        persist({
          ...state,
          following: following
            ? state.following.filter((id) => id !== restaurantId)
            : [...state.following, restaurantId],
        });
        return !following;
      },
      isStorySeen: (storyId) => state.seenStories.includes(storyId),
      markStorySeen: (storyId) => {
        if (state.seenStories.includes(storyId)) return;
        persist({ ...state, seenStories: [...state.seenStories, storyId] });
      },
    };
  }, [state, ready, persist]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const context = React.useContext(AppStateContext);
  if (!context) throw new Error("useAppState يجب أن يُستخدم داخل AppStateProvider");
  return context;
}
