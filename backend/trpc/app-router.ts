import { createTRPCRouter } from './create-context';
import hiRoute from './routes/example/hi/route';
import { getUserProfileProcedure, updateUserProfileProcedure } from './routes/user/profile/route';
import { syncProgressProcedure } from './routes/progress/sync/route';
import { syncBadgesProcedure } from './routes/badges/sync/route';

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  user: createTRPCRouter({
    getProfile: getUserProfileProcedure,
    updateProfile: updateUserProfileProcedure,
  }),
  progress: createTRPCRouter({
    sync: syncProgressProcedure,
  }),
  badges: createTRPCRouter({
    sync: syncBadgesProcedure,
  }),
});

export type AppRouter = typeof appRouter;