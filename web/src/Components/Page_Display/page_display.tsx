import React, { useContext, useEffect } from "react";
import Page from "@components/Page/page";
import Settings from "@components/Settings/settings";
import EmptyState from "@components/EmptyState/empty_state";
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
            return (
                <EmptyState
                    icon={
                        <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    title="No Page Selected"
                    description="Select a page from the sidebar or create a new one to get started"
                />
            )
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