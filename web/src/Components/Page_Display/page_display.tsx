import React, { useContext, useEffect } from "react";
import Page from "@components/Page/page";
import Settings from "@components/Settings/settings";
import { BlockContext } from "@context/block-context";

import "./page_display.css";

const PageDisplay: React.FC = () => {
    const { selectedPage, pageBottom, pageRef } = useContext(BlockContext);

    useEffect(() => {
        if(pageRef.current !== null){
             pageBottom.current = pageRef.current.offsetTop + pageRef.current.clientHeight;
        }
        // eslint-disable-next-line
    }, [pageRef])

    const display = (): React.JSX.Element => {
        if(selectedPage !== '' && selectedPage !== 'settingsSelected'){
            return (<Page/>)
        }
        else if(selectedPage === 'settingsSelected'){
            return (<Settings/>)
        }
        else {
            return <div></div>
        }
    }

    return (
        <div ref={pageRef} className="page-container">
            {
                display()
            }
        </div>
    )
}

export default PageDisplay;