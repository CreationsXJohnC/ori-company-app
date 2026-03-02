/**
 * ORI APP — Content & Events Hooks (React Query)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/utils/constants';
import type { ContentBlock, Event, ContentSection } from '@/types';

// ─── Content Blocks ───────────────────────────────────────────────────────────
export function useContentSection(section: ContentSection) {
  return useQuery({
    queryKey: QUERY_KEYS.contentSection(section),
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('section', section)
        .eq('active', true)
        .order('sort_order');
      if (error) throw error;
      return data as ContentBlock[];
    },
    staleTime: 1000 * 60 * 15, // 15 min — content changes rarely
  });
}

export function useAllContent() {
  return useQuery({
    queryKey: QUERY_KEYS.contentBlocks,
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('active', true)
        .order('sort_order');
      if (error) throw error;

      // Group by section
      const grouped: Record<string, ContentBlock[]> = {};
      for (const block of data as ContentBlock[]) {
        if (!grouped[block.section]) grouped[block.section] = [];
        grouped[block.section].push(block);
      }
      return grouped;
    },
    staleTime: 1000 * 60 * 15,
  });
}

// Helper: get a specific key from a section's blocks
export function getContentValue(
  blocks: ContentBlock[] | undefined,
  key: string
): string {
  return blocks?.find((b) => b.key === key)?.value ?? '';
}

// ─── Events ───────────────────────────────────────────────────────────────────
export function useEvents() {
  return useQuery({
    queryKey: QUERY_KEYS.events,
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('active', true)
        .gte('date', new Date().toISOString().split('T')[0]) // upcoming only
        .order('date');
      if (error) throw error;
      return data as Event[];
    },
    staleTime: 1000 * 60 * 5,
  });
}
