import { useEffect, useRef, useCallback } from "react"

interface UseInfiniteScrollOptions {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  threshold?: number
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            onLoadMore()
          }
        },
        { threshold: 0.1, rootMargin: `0px 0px ${threshold}px 0px` }
      )

      if (node) observerRef.current.observe(node)
    },
    [isLoading, hasMore, onLoadMore, threshold]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [])

  return { loadMoreRef }
}