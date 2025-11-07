import { BlockType } from '@utils/block_types';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: {
    checked?: boolean;
    [key: string]: unknown;
  };
  children?: string[];
  parent_id?: string | null;
  page_id?: string;
}

export interface Property {
  property_name: string;
  value: string;
}

export interface Page {
  id?: string;
  block_type: BlockType;
  position: number;
  parent: string | null;
  properties: boolean;
  children: boolean;
  propertiesList: Property[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface BlockContextValue {
  selectedPage: Page | null;
  setPage: (page: Page | null) => void;
  selectedPageId: string | null;
  setPageId: (pageId: string | null) => void;
  blockContainerList: React.RefObject<HTMLDivElement>[];
  setBlockContainerList: (refs: React.RefObject<HTMLDivElement>[]) => void;
}
