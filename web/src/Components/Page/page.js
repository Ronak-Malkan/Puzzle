import { useCallback, useContext, useEffect, useRef, useState } from "react";
import ContentEditable from 'react-contenteditable';

import "./page.css";
import { BlockContext } from "../../context/block-context";
import { BLOCK_TYPES } from "../../Utils/block_types";
import Block from "../Block/block";
import sanitizeHtml from 'sanitize-html';

const Page = () => {
    const jwtToken = useRef('');
    const pageId = useRef('');
    const newBlockHTML = useRef('');
    const newBlockRef = useRef();
    const latestPosition = useRef(1);
    const {selectedPage, selectedPageName, setPageName, pageList, setPageList, blockList, setBlockList, setFocusId, blockListRef, pageBottom, pageRef, blockContainerList, draggingElementRef} = useContext(BlockContext)
    const [showBlockTypes, setShowBlockTypes] = useState(false);
    const heading1Ref = useRef(null);
    const currentType = useRef(null);
    const blocksContainerRef = useRef(null);
    const sanitizeHTMLConfig = {
        disallowedTagsMode: 'discard',
        allowedTags: [
        ],
    }

    useEffect(() => {
        jwtToken.current = localStorage.getItem('token');
    }, [])

    useEffect(() => {
        pageId.current = selectedPage;
    }, [selectedPage]);

    useEffect(() => {
        blockListRef.current = blockList;
        console.log(blockList);
    }, [blockList]);

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
                    console.log(2);
                    setBlockList(res.blocks);
                }else {
                    console.log(res.error);
                }
            })
        }
    }, [selectedPage, jwtToken])

    const handleTitleChange = (e) => {
        const sanitizedHTML = sanitizeHtml(e.target.innerHTML, sanitizeHTMLConfig);
        let propData = {
            blockId: pageId.current,
            property: {
                property_name: 'title',
                value: sanitizedHTML
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
                setPageList([...updatedPageList]);
                setPageName(propData.property.value);
            }else {
                console.log(res.error);
            }
        })
    }

    const headingHTML = () => {
        if(selectedPageName==='Untitled') return '';
        else return selectedPageName;
    }

    const createBlock = (html, type, focusNext) => {
        let newBlockData = {
            block_type: type,
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
                    newBlockData.id = res.id;
                const updateBLockList = blockListRef.current;
                updateBLockList.push(newBlockData);
                setBlockList([...updateBLockList]);
                blockListRef.current = updateBLockList;
                newBlockRef.current.innerHTML = '';
                newBlockHTML.current = '';
                setShowBlockTypes(false);
                latestPosition.current = latestPosition.current + 1;
                if(focusNext === 0) {
                    setTimeout(() => newBlockRef.current.focus(), 0);
                    setFocusId('-1');
                }
                else if(focusNext === 1) setFocusId(newBlockData.id);
            }else {
                console.log(res.error);
            }
        })
    }

    const handleNewBlockBlur = (e) => {
        if(e.target.innerHTML !== '' && e.target.innerHTML !== '/') {
            createBlock(e.target.innerHTML, BLOCK_TYPES.TEXT, 0);
        }
    }
    
    const handleNewBlockKeyDown = (e) => {
        if(e.key === 'Enter' && newBlockHTML.current !== ''){
            e.preventDefault();
            createBlock(newBlockHTML.current, BLOCK_TYPES.TEXT, 0);
        }
    }

    const handleNewBlockChange = (e) => {
        newBlockHTML.current = e.target.value;
        if(e.target.value === '/') {
            setShowBlockTypes(true);
            setTimeout(() => {
                heading1Ref.current.focus();
            }, 0)
        }
        else {
            setShowBlockTypes(false);
        }
    }

    const handleBlockTypeKeyDown = (blockType, e) => {
        if(e.key === 'ArrowUp') {
            if(currentType.current === null) {
                if(heading1Ref.current.previousSibling !== null){ 
                    currentType.current = heading1Ref.current.previousSibling;
                    currentType.current.focus();
                }
            }
            else {
                if(currentType.current.previousSibling !== null){ 
                    currentType.current = currentType.current.previousSibling;
                    currentType.current.focus();
                }
            }
        }
        if(e.key === 'ArrowDown') {
            console.log('Arrow Down');
            if(currentType.current === null) {
                if(heading1Ref.current.nextSibling !== null){ 
                    currentType.current = heading1Ref.current.nextSibling;
                    currentType.current.focus();
                }
            }
            else {
                if(currentType.current.nextSibling !== null){ 
                    currentType.current = currentType.current.nextSibling;
                    currentType.current.focus();
                }
            }
        }
        if(e.key === 'Enter') {
            createBlock('', blockType, 1);
            currentType.current = null;
        }
    }

    const handleTitleKeyDown = (e) => {
        if(e.key === 'Enter') {
            e.preventDefault();
        }
    }

    const dragOverHandler = (e) => {
        if(pageBottom.current - e.clientY < 260) pageRef.current.scrollBy(0, 1);
        if(e.clientY - blocksContainerRef.current.offsetTop < 70) pageRef.current.scrollBy(0, -1);
        let draggingElementIndex;
        let closestElementIndex;
        let closestValue = Number.NEGATIVE_INFINITY;
        blockContainerList.current.forEach((block, index) => {
            if(block === draggingElementRef.current) {
                draggingElementIndex = index;
            }
            else {
                if(e.clientY - block.getBoundingClientRect().top < 0 && e.clientY - block.getBoundingClientRect().top > closestValue) {
                    closestElementIndex = index;
                    closestValue = e.clientY - block.getBoundingClientRect().top;
                }
            }
        });

        if(draggingElementIndex - closestElementIndex === -1 || ( draggingElementIndex === blockContainerList.current.length-1 && closestElementIndex === undefined )) {
            return;
        }
        else if(closestElementIndex === undefined ) {
            let newBlocksContainerArray = [...blockContainerList.current.slice(0, draggingElementIndex), ... blockContainerList.current.slice(draggingElementIndex+1), blockContainerList.current[draggingElementIndex]];
            let newBlocksArray = [...blockListRef.current.slice(0, draggingElementIndex), ... blockListRef.current.slice(draggingElementIndex+1), blockListRef.current[draggingElementIndex]];
            blockContainerList.current = newBlocksContainerArray;
            setBlockList([...newBlocksArray]);
            blockListRef.current = newBlocksArray;
        }
        else if(closestElementIndex > draggingElementIndex) {
            let newBlocksContainerArray = [...blockContainerList.current.slice(0, draggingElementIndex), ... blockContainerList.current.slice(draggingElementIndex+1, closestElementIndex), blockContainerList.current[draggingElementIndex], ... blockContainerList.current.slice(closestElementIndex)];
            let newBlocksArray = [...blockListRef.current.slice(0, draggingElementIndex), ... blockListRef.current.slice(draggingElementIndex+1, closestElementIndex), blockListRef.current[draggingElementIndex], ... blockListRef.current.slice(closestElementIndex)];
            blockContainerList.current = newBlocksContainerArray;
            setBlockList([...newBlocksArray]);
            blockListRef.current = newBlocksArray;
        }
        else if(closestElementIndex < draggingElementIndex) {
            let newBlocksContainerArray = [...blockContainerList.current.slice(0, closestElementIndex), blockContainerList.current[draggingElementIndex], ... blockContainerList.current.slice( closestElementIndex, draggingElementIndex), ... blockContainerList.current.slice(draggingElementIndex + 1)];

            let newBlocksArray = [...blockListRef.current.slice(0, closestElementIndex), blockListRef.current[draggingElementIndex], ... blockListRef.current.slice( closestElementIndex, draggingElementIndex), ... blockListRef.current.slice(draggingElementIndex + 1)];

            blockContainerList.current = newBlocksContainerArray;
            setBlockList([...newBlocksArray]);
            blockListRef.current = newBlocksArray;
        }
    }
 
    return (
        <>
            <ContentEditable className="page-title-editable" onBlur={handleTitleChange} onKeyDown={handleTitleKeyDown} tagName="h1" disabled={false} placeholder={'Untitled'} html={headingHTML()}/>
            <div ref={blocksContainerRef} className="blocks-container" onDragOver={dragOverHandler}>
                {
                    blockList !== undefined  && blockList.map((block) => {
                        //if(block !== undefined)
                        return <Block key={block.id} newBlockRef={newBlockRef} createBlock={createBlock} block={block}/>;
                    })        
                }
            </div>
            <div className="new-block-container">
                <ContentEditable innerRef={newBlockRef} className="new-block" onBlur={handleNewBlockBlur} onChange={handleNewBlockChange} onKeyDown={handleNewBlockKeyDown} tagName="div" disabled={false} placeholder={"Type '/' for block types"} html={newBlockHTML.current}/>
                {showBlockTypes && <div className="block-types-container" role="menu">
                    <h3 className="block-types-heading" >Blocks</h3>

                    <div className="block-types" tabIndex='-1' role="menuitem" ref={heading1Ref} onKeyDown={(e) => handleBlockTypeKeyDown(BLOCK_TYPES.HEADING1, e)} onClick={() => { currentType.current = null; createBlock('', BLOCK_TYPES.HEADING1, 1); }}>
                        Heading 1
                    </div>

                    <div className="block-types" tabIndex='-1' role="menuitem" onKeyDown={(e) => handleBlockTypeKeyDown(BLOCK_TYPES.HEADING2, e)}  onClick={() => { currentType.current = null; createBlock('', BLOCK_TYPES.HEADING2, 1); }}>
                        Heading 2
                    </div>

                    <div className="block-types" tabIndex='-1' role="menuitem" onKeyDown={(e) => handleBlockTypeKeyDown(BLOCK_TYPES.HEADING3, e)}  onClick={() => { currentType.current = null; createBlock('', BLOCK_TYPES.HEADING3, 1); }}>
                        Heading 3
                    </div>

                    <div className="block-types" tabIndex='-1' role="menuitem" onKeyDown={(e) => handleBlockTypeKeyDown(BLOCK_TYPES.TEXT, e)}  onClick={() => { currentType.current = null; createBlock('', BLOCK_TYPES.TEXT, 1); }}>
                        Text
                    </div>

                    <div className="block-types" tabIndex='-1' role="menuitem" onKeyDown={(e) => handleBlockTypeKeyDown(BLOCK_TYPES.UNORDEREDLIST, e)}  onClick={() => { currentType.current = null; createBlock('', BLOCK_TYPES.UNORDEREDLIST, 1); }}>
                        Unordered List
                    </div>
                </div>}
            </div>
        </>
    )
}

export default Page;