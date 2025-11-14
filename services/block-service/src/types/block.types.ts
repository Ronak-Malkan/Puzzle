export enum BlockType {
  PAGE = 'page',
  TEXT = 'text',
  HEADING1 = 'heading1',
  HEADING2 = 'heading2',
  HEADING3 = 'heading3',
  UL = 'ul',
  CHECKLIST = 'checklist',
  TABLE = 'table',
  TABLE_HEADER_ROW = 'table_header_row',
  TABLE_ROW = 'table_row',
  TABLE_HEADER_CELL = 'table_header_cell',
  TABLE_CELL = 'table_cell',
}

export interface Property {
  property_name: string;
  value: string;
}

export interface Block {
  id?: string;
  user_id: number;
  block_type: BlockType;
  position: number;
  parent_id: string | null;
  page_id?: string;
  properties: boolean;
  children: boolean;
  properties_list?: Property[];
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateBlockDTO {
  user_id: number;
  block_type: BlockType;
  position: number;
  parent_id: string | null;
  page_id?: string;
  properties?: boolean;
  children?: boolean;
  properties_list?: Property[];
}

export interface UpdateBlockDTO {
  id: string;
  block_type?: BlockType;
  position?: number;
  parent_id?: string | null;
}
