import { createContext, useState, useRef } from "react";

export const BlockContext = createContext({
   selectedPage: null,
   setPage: () => null,
   selectedPageName: null,
   setPageName: () => null, 
   pageList: null,
   setPageList: () => null,
   blockList: null,
   setBlockList: () => null,
   focusId: null,
   setFocusId: () => null,
   blockListRef: null,
   blockContainerList: null,
   pageBottom: null,
   pageRef: null,
   draggingElementRef: null
});

export const BlockContextProvider = ({ children }) => {
    const [selectedPage, setPage] = useState('');
    const [selectedPageName, setPageName] = useState('');
    const [pageList, setPageList] = useState([]);
    const [blockList, setBlockList] = useState([]);
    const [focusId, setFocusId] = useState('');
    const blockListRef = useRef([]);
    const blockContainerList = useRef([]);
    const pageBottom = useRef();
    const pageRef = useRef(null);
    const draggingElementRef = useRef();

   return (
      <BlockContext.Provider value={{ selectedPage, setPage, selectedPageName, setPageName, pageList, setPageList, blockList, setBlockList, focusId, setFocusId, blockListRef, blockContainerList, pageBottom, pageRef, draggingElementRef }}>
         {children}
      </BlockContext.Provider>
   );
};