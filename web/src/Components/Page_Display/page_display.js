import { useEffect, useState } from "react";
import Page from "../Page/page";

import "./page_display.css";

const PageDisplay = ({selectPage, selectedPageName, pageList, setPageList, setPageName}) => {

    const display = () => {
        if(selectPage !== '' && selectPage !== 'settingsSelected'){
            return (<Page selectPage={selectPage} selectedPageName={selectedPageName} pageList={pageList} setPageList={setPageList} setPageName={setPageName}/>)
        }
        else {
            return <div></div>
        }
    }

    return (
        <div className="page-container">
            {
                display()
            }
        </div>
    )
}

export default PageDisplay;