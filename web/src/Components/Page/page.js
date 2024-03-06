import { useCallback, useContext, useEffect, useRef, useState } from "react";
import ContentEditable from 'react-contenteditable';

import "./page.css";
import { BlockContext } from "../../context/block-context";

const Page = () => {
    const jwtToken = useRef('');
    const pageId = useRef('');
    const {selectedPage, selectedPageName, setPageName, pageList, setPageList} = useContext(BlockContext)

    useEffect(() => {
        jwtToken.current = localStorage.getItem('token');
    }, [])

    useEffect(() => {
        pageId.current = selectedPage;
    }, [selectedPage]);

    useEffect(() => {
        if((selectedPage !== '' && selectedPage !== 'settingsSelected') && jwtToken.current !== '') {
            fetch(`api/block/blocks/${selectedPage}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken.current}`
                }
            })
            .then(res => res.json())
            .then(res => {
                if(res.message === 'blocks retrieved') {
                    console.log(res.blocks);
                }else {
                    console.log(res.error);
                }
            })
        }
    }, [selectedPage, jwtToken])

    const handleTitleChange = useCallback((e) => {
        let propData = {
            blockId: pageId.current,
            property: {
                property_name: 'title',
                value: e.target.innerHTML
            }
        }
        fetch('api/block/updateprop', {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken.current}`
            },
            body: JSON.stringify(propData)
        })
        .then(res => res.json())
        .then(res => {
            if(res.message === 'property updated') {
                const updatedPageList = pageList.map((page) => {
                    if(page.id === pageId.current) {
                        for(let property of page.propertiesList) {
                            if(property.property_name === 'title') {
                                property.value = propData.property.value;
                            }
                        }
                    }
                    return page;
                });
                setPageList(updatedPageList);
                setPageName(propData.property.value);
            }else {
                console.log(res.error);
            }
        })
    }, [])

    const headingHTML = () => {
        if(selectedPageName==='Untitled') return '';
        else return selectedPageName;
    }

    const handleNewBlock = () => {

    }

    return (
        <>
            <ContentEditable className="page-title-editable" onBlur={handleTitleChange} tagName="h1" disabled={false} placeholder={'Untitled'} html={headingHTML()}/>
            <div className="new-block-container">
                <ContentEditable className="new-block" onBlur={handleNewBlock} tagName="div" disabled={false} placeholder={"Type '/' for block types"} html=""/>
                <div className="block-types-container">
                    
                </div>
            </div>
        </>
    )
}

export default Page;