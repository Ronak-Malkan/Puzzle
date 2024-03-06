import { useContext } from "react";
import Page from "../Page/page";

import "./page_display.css";
import { BlockContext } from "../../context/block-context";

const PageDisplay = () => {

    const {selectedPage} = useContext(BlockContext);

    const display = () => {
        if(selectedPage !== '' && selectedPage !== 'settingsSelected'){
            return (<Page/>)
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