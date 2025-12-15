import { supabase } from '../lib/supabase';
import { Question } from '../types';

const TABLE = 'questions';

export async function fetchQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id,text')
    .order('id', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ id: String(r.id), text: r.text }));
}

export async function upsertQuestions(list: Question[]): Promise<void> {
  const payload = list.map((q) => ({ id: q.id, text: q.text }));
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

