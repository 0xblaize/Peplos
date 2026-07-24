import type { ComponentType } from 'react';
import type { ClosetItem } from '@/lib/supabase';

interface LookbookStageProps {
  basePhotoUrl: string;
  selectedGarments: ClosetItem[];
  generatedResult: string | null;
  isGenerating: boolean;
  loadingPhrase: string;
  error: string;
  favorite: boolean;
  onReroll: () => void;
  onToggleFavorite: () => void;
}

declare const LookbookStage: ComponentType<LookbookStageProps>;
export default LookbookStage;
