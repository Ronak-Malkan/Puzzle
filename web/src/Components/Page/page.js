import { useCallback, useContext, useEffect, useRef, useState } from "react";
import ContentEditable from 'react-contenteditable';

import "./page.css";
import { BlockContext } from "../../context/block-context";
import { BLOCK_TYPES } from "../../Utils/block_types";
import Block from "../Block/block";

const Page = () => {
    const jwtToken = useRef('');
    const pageId = useRef('');
    const newBlockHTML = useRef('');
    const newBlockRef = useRef();
    const latestPosition = useRef(1);
    const {selectedPage, selectedPageName, setPageName, pageList, setPageList} = useContext(BlockContext)
    const [showBlockTypes, setShowBlockTypes] = useState(false);
    const [blockList, setBlockList] = useState([]);

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
                    latestPosition.current = latestPosition.current + res.blocks.length;
                    console.log(res.blocks);
                    setBlockList(res.blocks);
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

    const createBlock = (html) => {
        let newBlockData = {
            block_type: BLOCK_TYPES.TEXT,
            position: latestPosition.current,
            parent: pageId.current,
            properties: true,
            children: false,
            propertiesList: [
                {
                    property_name: 'title',
                    value: html
                }
            ]
        }
        fetch('api/block/create', {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken.current}`
            },
            body: JSON.stringify(newBlockData)
        })
        .then(res => res.json())
        .then(res => {
            if(res.message === 'block created') {
                console.log('block created');
                newBlockRef.current.innerHTML = '';
                newBlockHTML.current = '';
                latestPosition.current = latestPosition.current + 1;
            }else {
                console.log(res.error);
            }
        })
    }

    const handleNewBlockBlur = (e) => {
        if(e.target.innerHTML !== '') {
            createBlock(e.target.innerHTML);
        }
    }
    
    const handleNewBlockKeyDown = (e) => {
        if(e.key === 'Enter' && newBlockHTML.current !== ''){
            e.preventDefault();
            createBlock(newBlockHTML.current);
        }
    }

    const handleNewBlockChange = (e) => {
        newBlockHTML.current = e.target.value;
        if(e.target.value === '/') {
            setShowBlockTypes(true);
        }
        else {
            setShowBlockTypes(false);
        }
    }

    return (
        <>
            <ContentEditable className="page-title-editable" onBlur={handleTitleChange} tagName="h1" disabled={false} placeholder={'Untitled'} html={headingHTML()}/>
            {
                blockList.map((block) => {
                    return <Block key={block.id} block={block}/>
                })
            }
            <div className="new-block-container">
                <ContentEditable innerRef={newBlockRef} className="new-block" onBlur={handleNewBlockBlur} onChange={handleNewBlockChange} onKeyDown={handleNewBlockKeyDown} tagName="div" disabled={false} placeholder={"Type '/' for block types"} html={newBlockHTML.current}/>
                {showBlockTypes && <div className="block-types-container">
                    <h3 className="block-types-heading">Blocks</h3>
                    <div className="block-types">Heading 1</div>
                    <div className="block-types">Heading 2</div>
                    <div className="block-types">Heading 3</div>
                    <div className="block-types">Text</div>
                    <div className="block-types">To Do List</div>
                </div>}
            </div>
        </>
    )
}

export default Page;