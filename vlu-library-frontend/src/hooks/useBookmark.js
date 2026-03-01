import { useState, useEffect } from "react";
import {
  toggleBookmark,
  checkBookmarked,
} from "../api/bookmark.api";

export const useBookmark = (documentId) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await checkBookmarked(documentId);
      setBookmarked(res.data.data.bookmarked);
    } catch (err) {
      console.error("Bookmark check error:", err);
    }
  };

  const handleToggle = async () => {
    try {
      setLoading(true);
      const res = await toggleBookmark(documentId);
      setBookmarked(res.data.data.bookmarked);
    } catch (err) {
      console.error("Bookmark toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchStatus();
  }, [documentId]);

  return { bookmarked, loading, handleToggle };
};