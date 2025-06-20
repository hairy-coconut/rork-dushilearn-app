import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from '@/utils/supabase';

export const getUserProfileProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', input.userId)
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  });

export const updateUserProfileProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    name: z.string().optional(),
    avatarUrl: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: input.name,
        avatar_url: input.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.userId)
      .select();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  });