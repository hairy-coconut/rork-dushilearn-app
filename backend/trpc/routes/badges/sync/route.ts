import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const syncBadgesProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    badges: z.array(z.object({
      id: z.string(),
      earned: z.boolean(),
      earnedDate: z.string().optional(),
    }))
  }))
  .mutation(async ({ input }) => {
    // Get only earned badges
    const earnedBadges = input.badges.filter(badge => badge.earned);
    
    // Delete existing badges
    const { error: deleteError } = await supabase
      .from('user_badges')
      .delete()
      .eq('user_id', input.userId);
      
    if (deleteError) {
      throw new Error(deleteError.message);
    }
    
    // Insert earned badges
    if (earnedBadges.length > 0) {
      const badgeRecords = earnedBadges.map(badge => ({
        user_id: input.userId,
        badge_id: badge.id,
        earned_date: badge.earnedDate || new Date().toISOString(),
        created_at: new Date().toISOString()
      }));
      
      const { data, error: insertError } = await supabase
        .from('user_badges')
        .insert(badgeRecords)
        .select();
        
      if (insertError) {
        throw new Error(insertError.message);
      }
      
      return data;
    }
    
    return [];
  });