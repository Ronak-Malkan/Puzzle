import { useContext, useEffect } from "react";
import Page from "../Page/page";

import "./page_display.css";
import { BlockContext } from "../../context/block-context";

const PageDisplay = () => {

    const {selectedPage, pageBottom, pageRef} = useContext(BlockContext);

    useEffect(() => {
        if(pageRef.current !== null){
             pageBottom.current = pageRef.current.offsetTop + pageRef.current.clientHeight;
        }
        // eslint-disable-next-line
    }, [pageRef])

    const display = () => {
        if(selectedPage !== '' && selectedPage !== 'settingsSelected'){
            return (<Page/>)
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