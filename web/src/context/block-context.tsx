import { createContext, useState, useRef, ReactNode } from 'react';
import type { Block, Page } from '@/types';

interface BlockContextValue {
  selectedPage: string;
  setPage: (page: string) => void;
  selectedPageName: string;
  setPageName: (name: string) => void;
  pageList: Page[];
  setPageList: (pages: Page[]) => void;
  blockList: Block[];
  setBlockList: (blocks: Block[]) => void;
  focusId: string;
  setFocusId: (id: string) => void;
  blockListRef: React.MutableRefObject<Block[]>;
  blockContainerList: React.MutableRefObject<HTMLDivElement[]>;
  pageBottom: React.MutableRefObject<number | undefined>;
  pageRef: React.MutableRefObject<HTMLDivElement | null>;
  draggingElementRef: React.MutableRefObject<HTMLDivElement | undefined>;
}

export const BlockContext = createContext<BlockContextValue>({
  selectedPage: '',
  setPage: () => null,
  selectedPageName: '',
  setPageName: () => null,
  pageList: [],
  setPageList: () => null,
  blockList: [],
  setBlockList: () => null,
  focusId: '',
  setFocusId: () => null,
  blockListRef: { current: [] },
  blockContainerList: { current: [] },
  pageBottom: { current: undefined },
  pageRef: { current: null },
  draggingElementRef: { current: undefined },
});

interface BlockContextProviderProps {
  children: ReactNode;
}

export const BlockContextProvider = ({ children }: BlockContextProviderProps) => {
  const [selectedPage, setPage] = useState<string>('');
  const [selectedPageName, setPageName] = useState<string>('');
  const [pageList, setPageList] = useState<Page[]>([]);
  const [blockList, setBlockList] = useState<Block[]>([]);
  const [focusId, setFocusId] = useState<string>('');
  const blockListRef = useRef<Block[]>([]);
  const blockContainerList = useRef<HTMLDivElement[]>([]);
  const pageBottom = useRef<number | undefined>(undefined);
  const pageRef = useRef<HTMLDivElement>(null);
  const draggingElementRef = useRef<HTMLDivElement | undefined>(undefined);

  return (
    <BlockContext.Provider
      value={{
        selectedPage,
        setPage,
        selectedPageName,
        setPageName,
        pageList,
        setPageList,
        blockList,
        setBlockList,
        focusId,
        setFocusId,
        blockListRef,
        blockContainerList,
        pageBottom,
        pageRef,
        draggingElementRef,
      }}
    >
      {children}
    </BlockContext.Provider>
  );
};
