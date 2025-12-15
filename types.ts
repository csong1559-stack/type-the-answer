export interface Question {
  id: string;
  text: string;
}

export type AppRoute = 'HOME' | 'EDITOR' | 'EXPORT';

export type NoteCardSize = 'SQUARE' | 'PORTRAIT' | 'THREE_FOUR';

export interface AppState {
  currentRoute: AppRoute;
  currentQuestionIndex: number;
  answerText: string;
  isMuted: boolean;
  selectedSize: NoteCardSize;
  year: number;
}
