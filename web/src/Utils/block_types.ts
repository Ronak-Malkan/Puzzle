export const BLOCK_TYPES = {
  TEXT: 'text',
  PAGE: 'page',
  HEADING1: 'heading1',
  HEADING2: 'heading2',
  HEADING3: 'heading3',
  UNORDEREDLIST: 'ul',
  CHECKLIST: 'checklist',
} as const;

export type BlockType = typeof BLOCK_TYPES[keyof typeof BLOCK_TYPES];

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: Record<string, unknown>;
  children?: string[];
  parent_id?: string | null;
}
