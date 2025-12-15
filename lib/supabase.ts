import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const createShim = () => {
  const chain = {
    select: (..._args: any[]) => chain,
    order: async (..._args: any[]) => ({ data: [] as any[], error: null as any }),
    upsert: async (..._args: any[]) => ({ error: null as any }),
  };
  return {
    storage: {
      from: (_bucket: string) => ({
        getPublicUrl: (_path: string) => ({ data: { publicUrl: undefined }, error: null as any }),
      }),
    },
    from: (_table: string) => chain,
  } as any;
};

export const supabase = url && anon ? createClient(url, anon) : createShim();
