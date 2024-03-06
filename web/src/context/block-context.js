import { createContext, useState } from "react";

export const BlockContext = createContext({
   selectedPage: null,
   setPage: () => null,
   selectedPageName: null,
   setPageName: () => null, 
   pageList: null,
   setPageList: () => null
});

export const BlockContextProvider = ({ children }) => {
    const [selectedPage, setPage] = useState('');
    const [selectedPageName, setPageName] = useState('');
    const [pageList, setPageList] = useState([]);

   return (
      <BlockContext.Provider value={{ selectedPage, setPage, selectedPageName, setPageName, pageList, setPageList }}>
         {children}
      </BlockContext.Provider>
   );
};