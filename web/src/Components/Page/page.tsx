import { useContext, useEffect, useRef, useState } from "react";
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import type React from 'react';

import "./page.css";
import { BlockContext } from "@context/block-context";
import { BLOCK_TYPES, BlockType } from "@utils/block_types";
import Block from "@components/Block/block";
import sanitizeHtml from 'sanitize-html';

// Legacy API structure for blocks
interface Property {
    property_name: string;
    value: string | boolean;
}

interface LegacyBlock {
    id: string;
    block_type: BlockType;
    position?: number;
    parent?: string;
    properties?: boolean;
    children?: boolean;
    propertiesList: Property[];
}

interface UpdatePropertyData {
    blockId: string;
    property: {
        property_name: string;
        value: string | boolean;
    };
}

interface BlocksApiResponse {
    message: string;
    blocks?: LegacyBlock[];
    error?: string;
}

interface CreateBlockApiResponse {
    message: string;
    id?: string;
    error?: string;
}

interface ApiResponse {
    message: string;
    error?: string;
}

const Page: React.FC = () => {
    const jwtToken = useRef<string>('');
    const pageId = useRef<string>('');
    const newBlockHTML = useRef<string>('');
    const newBlockRef = useRef<HTMLElement>(null!);
    const latestPosition = useRef<number>(1);
    const {selectedPage, selectedPageName, setPageName, pageList, setPageList, blockList, setBlockList, setFocusId, blockListRef, pageBottom, pageRef, blockContainerList, draggingElementRef} = useContext(BlockContext)
    const [showBlockTypes, setShowBlockTypes] = useState<boolean>(false);
    const heading1Ref = useRef<HTMLDivElement>(null!);
    const currentType = useRef<HTMLDivElement | null>(null);
    const blocksContainerRef = useRef<HTMLDivElement>(null!);
    const sanitizeHTMLConfig: sanitizeHtml.IOptions = {
        disallowedTagsMode: 'discard',
        allowedTags: [
        ],
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        jwtToken.current = token || '';
    }, [])

    useEffect(() => {
        pageId.current = selectedPage;
        blockContainerList.current = [];
    }, [selectedPage]);

    useEffect(() => {
        blockListRef.current = blockList;
        // eslint-disable-next-line
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
            .then((res: BlocksApiResponse) => {
                if(res.message === 'blocks retrieved' && res.blocks) {
                    latestPosition.current = latestPosition.current + res.blocks.length;
                    setBlockList(res.blocks as any);
                }else {
                    console.log(res.error);
                }
            })
            .catch((error: Error) => {
                console.error('Error fetching blocks:', error);
            });
        }
        // eslint-disable-next-line
    }, [selectedPage, jwtToken])

    const handleTitleChange = (e: ContentEditableEvent): void => {
        const sanitizedHTML = sanitizeHtml(e.target.value, sanitizeHTMLConfig);
        const propData: UpdatePropertyData = {
            blockId: pageId.current,
            property: {
                property_name: 'title',
                value: sanitizedHTML
            }
        };
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
        .then((res: ApiResponse) => {
            if(res.message === 'property updated') {
                const updatedPageList = pageList.map((page) => {
                    if(page.id === pageId.current) {
                        for(let property of page.propertiesList) {
                            if(property.property_name === 'title') {
                                property.value = typeof propData.property.value === 'string' ? propData.property.value : '';
                            }
                        }
                    }
                    return page;
                });
                setPageList([...updatedPageList]);
                setPageName(typeof propData.property.value === 'string' ? propData.property.value : '');
            }else {
                console.log(res.error);
            }
        })
        .catch((error: Error) => {
            console.error('Error updating title:', error);
        });
    };

    const headingHTML = (): string => {
        if(selectedPageName==='Untitled') return '';
        else return selectedPageName;
    };

    const createBlock = (html: string, type: BlockType, focusNext: number): void => {
        const newBlockData: LegacyBlock = {
            id: '',
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
        };
        if(type === BLOCK_TYPES.CHECKLIST) {
            newBlockData.propertiesList.push({
                property_name: 'checked',
                value: false
            })
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
        .then((res: CreateBlockApiResponse) => {
            if(res.message === 'block created' && res.id) {
                newBlockData.id = res.id;
                const updateBlockList = blockListRef.current;
                updateBlockList.push(newBlockData as any);
                setBlockList([...updateBlockList] as any);
                blockListRef.current = updateBlockList;
                if(newBlockRef.current) {
                    newBlockRef.current.innerHTML = '';
                }
                newBlockHTML.current = '';
                setShowBlockTypes(false);
                latestPosition.current = latestPosition.current + 1;
                if(focusNext === 0) {
                    setTimeout(() => newBlockRef.current?.focus(), 0);
                    setFocusId('-1');
                }
                else if(focusNext === 1) setFocusId(newBlockData.id);
            }else {
                console.log(res.error);
            }
        })
        .catch((error: Error) => {
            console.error('Error creating block:', error);
        });
    };

    const handleNewBlockBlur = (e: ContentEditableEvent): void => {
        if(e.target.value !== '' && e.target.value !== '/') {
            createBlock(e.target.value, BLOCK_TYPES.TEXT, 0);
        }
    };

    const handleNewBlockKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
        if(e.key === 'Enter' && newBlockHTML.current !== ''){
            e.preventDefault();
            createBlock(newBlockHTML.current, BLOCK_TYPES.TEXT, 0);
        }
    };

    const handleNewBlockChange = (e: ContentEditableEvent): void => {
        const value = (e.target as HTMLInputElement).value;
        newBlockHTML.current = value;
        if(value === '/') {
            setShowBlockTypes(true);
            setTimeout(() => {
                heading1Ref.current?.focus();
            }, 0)
        }
        else {
            setShowBlockTypes(false);
        }
    };

    const handleBlockTypeKeyDown = (blockType: BlockType, e: React.KeyboardEvent<HTMLDivElement>): void => {
        if(e.key === 'ArrowUp') {
            if(currentType.current === null) {
                if(heading1Ref.current && heading1Ref.current.previousSibling !== null){
                    currentType.current = heading1Ref.current.previousSibling as HTMLDivElement;
                    currentType.current.focus();
                }
            }
            else {
                if(currentType.current.previousSibling !== null){
                    currentType.current = currentType.current.previousSibling as HTMLDivElement;
                    currentType.current.focus();
                }
            }
        }
        if(e.key === 'ArrowDown') {
            if(currentType.current === null) {
                if(heading1Ref.current && heading1Ref.current.nextSibling !== null){
                    currentType.current = heading1Ref.current.nextSibling as HTMLDivElement;
                    currentType.current.focus();
                }
            }
            else {
                if(currentType.current.nextSibling !== null){
                    currentType.current = currentType.current.nextSibling as HTMLDivElement;
                    currentType.current.focus();
                }
            }
        }
        if(e.key === 'Enter') {
            createBlock('', blockType, 1);
            currentType.current = null;
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
        if(e.key === 'Enter') {
            e.preventDefault();
        }
    };

    const dragOverHandler = (e: React.DragEvent<HTMLDivElement>): void => {
        if(pageBottom.current !== undefined && pageRef.current) {
            if(pageBottom.current - e.clientY < 260) pageRef.current.scrollBy(0, 1);
        }
        if(blocksContainerRef.current && pageRef.current) {
            if(e.clientY - blocksContainerRef.current.offsetTop < 70) pageRef.current.scrollBy(0, -1);
        }

        let draggingElementIndex: number | undefined;
        let closestElementIndex: number | undefined;
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

        if(draggingElementIndex === undefined) return;

        if(draggingElementIndex - (closestElementIndex ?? -2) === -1 || ( draggingElementIndex === blockContainerList.current.length-1 && closestElementIndex === undefined )) {
            return;
        }
        else if(closestElementIndex === undefined ) {
            const newBlocksContainerArray = [...blockContainerList.current.slice(0, draggingElementIndex), ...blockContainerList.current.slice(draggingElementIndex+1), blockContainerList.current[draggingElementIndex]];
            const newBlocksArray = [...blockListRef.current.slice(0, draggingElementIndex), ...blockListRef.current.slice(draggingElementIndex+1), blockListRef.current[draggingElementIndex]];
            blockContainerList.current = newBlocksContainerArray;
            setBlockList([...newBlocksArray] as any);
            blockListRef.current = newBlocksArray;
            // eslint-disable-next-line
        }
        else if(closestElementIndex > draggingElementIndex) {
            const newBlocksContainerArray = [...blockContainerList.current.slice(0, draggingElementIndex), ...blockContainerList.current.slice(draggingElementIndex+1, closestElementIndex), blockContainerList.current[draggingElementIndex], ...blockContainerList.current.slice(closestElementIndex)];
            const newBlocksArray = [...blockListRef.current.slice(0, draggingElementIndex), ...blockListRef.current.slice(draggingElementIndex+1, closestElementIndex), blockListRef.current[draggingElementIndex], ...blockListRef.current.slice(closestElementIndex)];
            blockContainerList.current = newBlocksContainerArray;
            setBlockList([...newBlocksArray] as any);
            blockListRef.current = newBlocksArray;
        }
        else if(closestElementIndex < draggingElementIndex) {
            const newBlocksContainerArray = [...blockContainerList.current.slice(0, closestElementIndex), blockContainerList.current[draggingElementIndex], ...blockContainerList.current.slice( closestElementIndex, draggingElementIndex), ...blockContainerList.current.slice(draggingElementIndex + 1)];

            const newBlocksArray = [...blockListRef.current.slice(0, closestElementIndex), blockListRef.current[draggingElementIndex], ...blockListRef.current.slice( closestElementIndex, draggingElementIndex), ...blockListRef.current.slice(draggingElementIndex + 1)];
            blockContainerList.current = newBlocksContainerArray;
            setBlockList([...newBlocksArray] as any);
            blockListRef.current = newBlocksArray;
        }
    };
 
    return (
        <>
            <ContentEditable className="page-title-editable" onBlur={handleTitleChange} onKeyDown={handleTitleKeyDown as any} tagName="h1" disabled={false} placeholder={'Untitled'} html={headingHTML()}/>
            <div ref={blocksContainerRef} className="blocks-container" onDragOver={dragOverHandler}>
                {
                    blockList !== undefined  && blockList.map((block) => {
                        return <Block key={(block as any).id} newBlockRef={newBlockRef} createBlock={createBlock} block={block as any}/>;
                    })
                }
            </div>
            <div className="new-block-container">
                <ContentEditable innerRef={newBlockRef as any} className="new-block" onBlur={handleNewBlockBlur} onChange={handleNewBlockChange} onKeyDown={handleNewBlockKeyDown as any} tagName="div" disabled={false} placeholder={"Type '/' for block types"} html={newBlockHTML.current}/>
                {showBlockTypes && <div className="block-types-container" role="menu">
                    <h3 className="block-types-heading" >Blocks</h3>

                    <div className="block-types" tabIndex={-1} role="menuitem" ref={heading1Ref} onKeyDown={(e) => handleBlockTypeKeyDown(BLOCK_TYPES.HEADING1, e)} onClick={() => { currentType.current = null; createBlock('', BLOCK_TYPES.HEADING1, 1); }}>
                        Heading 1
                    </div>

                    <div className="block-types" tabIndex={-1} role="menuitem" onKeyDown={(e) => handleBlockTypeKeyDown(BLOCK_TYPES.HEADING2, e)}  onClick={() => { currentType.current = null; createBlock('', BLOCK_TYPES.HEADING2, 1); }}>
                        Heading 2
                    </div>

                    <div className="block-types" tabIndex={-1} role="menuitem" onKeyDown={(e) => handleBlockTypeKeyDown(BLOCK_TYPES.HEADING3, e)}  onClick={() => { currentType.current = null; createBlock('', BLOCK_TYPES.HEADING3, 1); }}>
                        Heading 3
                    </div>

                    <div className="block-types" tabIndex={-1} role="menuitem" onKeyDown={(e) => handleBlockTypeKeyDown(BLOCK_TYPES.TEXT, e)}  onClick={() => { currentType.current = null; createBlock('', BLOCK_TYPES.TEXT, 1); }}>
                        Text
                    </div>

                    <div className="block-types" tabIndex={-1} role="menuitem" onKeyDown={(e) => handleBlockTypeKeyDown(BLOCK_TYPES.UNORDEREDLIST, e)}  onClick={() => { currentType.current = null; createBlock('', BLOCK_TYPES.UNORDEREDLIST, 1); }}>
                        Unordered List
                    </div>

                    <div className="block-types" tabIndex={-1} role="menuitem" onKeyDown={(e) => handleBlockTypeKeyDown(BLOCK_TYPES.CHECKLIST, e)}  onClick={() => { currentType.current = null; createBlock('', BLOCK_TYPES.CHECKLIST, 1); }}>
                        To Do List
                    </div>
                </div>}
            </div>
        </>
    )
}

export default Page;