import { useCallback, useEffect, useRef, useState } from "react";
import ContentEditable from 'react-contenteditable';

import "./page.css";

const Page = ({selectPage, selectedPageName, pageList, setPageList, setPageName}) => {
    const jwtToken = useRef('');
    const pageId = useRef('');

    useEffect(() => {
        jwtToken.current = localStorage.getItem('token');
    }, [])

    useEffect(() => {
        pageId.current = selectPage;
    }, [selectPage]);

    useEffect(() => {
        if((selectPage !== '' && selectPage !== 'settingsSelected') && jwtToken.current !== '') {
            fetch(`api/block/blocks/${selectPage}`, {
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
    }, [selectPage, jwtToken])

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

    return (
        <>
            <ContentEditable className="page-title-editable" onBlur={handleTitleChange} tagName="h1" disabled={false} placeholder={'Untitled'} html={headingHTML()}/>
        </>
    )
}

export default Page;