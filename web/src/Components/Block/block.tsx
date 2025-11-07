import { useContext, useEffect, useRef, useState } from "react";
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import type React from 'react';

import "./block.css";
import { BlockContext } from "@context/block-context";
import { BLOCK_TYPES, BlockType } from "@utils/block_types";
import { ReactComponent as DragIcon } from "@utils/Drag.svg";

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

interface BlockProps {
    block: LegacyBlock;
    newBlockRef: React.RefObject<HTMLElement>;
    createBlock: (html: string, type: BlockType, focusNext: number) => void;
}

interface UpdatePropertyData {
    blockId: string;
    property: {
        property_name: string;
        value: string | boolean;
    };
}

interface ApiResponse {
    message: string;
    error?: string;
}

const Block: React.FC<BlockProps> = ({block, newBlockRef, createBlock}) => {
    const jwtToken = useRef<string>('');
    const [content, setContent] = useState<string>('');
    const contentRef = useRef<string>('');
    const {setBlockList, focusId, blockListRef, blockContainerList, draggingElementRef} = useContext(BlockContext);
    const blockRef = useRef<HTMLElement>(null!);
    const blockContainerRef = useRef<HTMLDivElement>(null!);
    const [checked, setChecked] = useState<boolean>(false);

    useEffect(() => {
        for(let property of block.propertiesList) {
            if(property.property_name === 'title') {
                const titleValue = typeof property.value === 'string' ? property.value : '';
                setContent(titleValue);
                contentRef.current = titleValue;
            }
            else if( property.property_name === 'checked'){
                if(property.value === 'true' || property.value === true) setChecked(true)
                else setChecked(false);
            }
        }
        const token = localStorage.getItem('token');
        jwtToken.current = token || '';
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if(focusId === block.id && blockRef.current !== null){
            setTimeout(() => blockRef.current?.focus(), 0);
        }
        // eslint-disable-next-line
    }, [focusId]) 

    useEffect(() => {
        if(blockContainerRef.current !== null) {
            blockContainerList.current.push(blockContainerRef.current);
        }
        // eslint-disable-next-line
    }, [])
    

    const updateProperty = (value: string): void => {
        const propData: UpdatePropertyData = {
            blockId: block.id,
            property: {
                property_name: 'title',
                value: value
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
            if(res.message !== 'property updated') {
                console.log(res.error);
            }
        })
        .catch((error: Error) => {
            console.error('Error updating property:', error);
        });
    };

    const onBlockBlur = (e: ContentEditableEvent): void => {
        updateProperty(e.target.value);
    };

    const onBlockKeyDown = (e: React.KeyboardEvent<HTMLElement>, nextFocus: number, type: BlockType | ''): void => {
        if(e.key === 'Enter'){
            e.preventDefault();
            const textContent = (e.target as HTMLElement).textContent || '';
            updateProperty(textContent);
            if(nextFocus === 0) setTimeout(() => newBlockRef.current?.focus(), 0);
            else if(nextFocus === 1 && type !== '') {
                createBlock('', type, 1);
            }
        }
        else if(e.key === 'Backspace' && (contentRef.current === '' || contentRef.current === '<br>')) {
            fetch('api/block/delete', {
                method: 'DELETE',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken.current}`
                },
                body: JSON.stringify({blockId: block.id})
            })
            .then(res => res.json())
            .then((res: ApiResponse) => {
                if(res.message === 'block deleted') {
                    setTimeout(() => newBlockRef.current?.focus(), 0);
                    const updatedList = blockListRef.current.filter((blockItem) => (blockItem as unknown as LegacyBlock).id !== block.id);
                    const updatedContainerList = blockContainerList.current.filter((blockItem) => blockItem !== blockContainerRef.current);
                    setBlockList([...updatedList] as any);
                    blockListRef.current = updatedList;
                    blockContainerList.current = updatedContainerList;
                }
            })
            .catch((error: Error) => {
                console.error('Error deleting block:', error);
            });
        }
    };

    const handleBlockChange = (e: ContentEditableEvent): void => {
        const value = (e.target as HTMLInputElement).value;
        setContent(value);
        contentRef.current = value;
    };

    const checkboxChangeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setChecked(e.target.checked);
        const propData: UpdatePropertyData = {
            blockId: block.id,
            property: {
                property_name: 'checked',
                value: e.target.checked
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
            if(res.message !== 'property updated') {
                console.log(res.error);
            }
        })
        .catch((error: Error) => {
            console.error('Error updating checkbox:', error);
        });
    };

    const dragStartHandler = (e: React.DragEvent<HTMLDivElement>): void => {
        blockContainerRef.current?.classList.add('dragging-block');
        blockRef.current?.classList.add('dragging-block');
        draggingElementRef.current = e.target as HTMLDivElement;
    };

    const dragEndHandler = (): void => {
        blockContainerRef.current?.classList.remove('dragging-block');
        blockRef.current?.classList.remove('dragging-block');
        const blockArray: [string, number][] = [];
        blockListRef.current.forEach((blockItem, index) => {
            blockArray.push([(blockItem as unknown as LegacyBlock).id, index+1]);
        });
        fetch('api/block/updatepositions', {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken.current}`
            },
            body: JSON.stringify(blockArray)
        })
        .then(res => res.json())
        .then((res: ApiResponse) => {
            if(res.message !== 'Positions updated') {
                console.log(res.error);
            }
            else {
                console.log('Positions updated');
            }
        })
        .catch((error: Error) => {
            console.error('Error updating positions:', error);
        });
    };

    const displayBlock = (): React.JSX.Element | undefined => {
        if(block.block_type ===  BLOCK_TYPES.TEXT) {
            return (
                <div data-blockid={block.id} ref={blockContainerRef} onDragStart={dragStartHandler} onDragEnd={dragEndHandler} className="block" draggable="true">
                    <div className='drag-icon'><DragIcon/></div>
                    <ContentEditable innerRef={blockRef as any} className="block-text block-flex-grow" placeholder="Enter text" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={((e: any) => onBlockKeyDown(e, 0, '')) as any} tagName="p" disabled={false} html={content}/>
                </div>
            )
        }
        else if(block.block_type === BLOCK_TYPES.HEADING1) {
            return (
                <div data-blockid={block.id} ref={blockContainerRef} onDragStart={dragStartHandler} onDragEnd={dragEndHandler} className="block" draggable="true">
                    <div className='drag-icon'><DragIcon/></div>
                    <ContentEditable innerRef={blockRef as any} className="block-heading1 block-flex-grow" placeholder="Enter Heading 1" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={((e: any) => onBlockKeyDown(e, 0, '')) as any} tagName="h1" disabled={false} html={content}/>
                </div>
            )
        }
        else if(block.block_type === BLOCK_TYPES.HEADING2) {
            return (
                <div data-blockid={block.id} ref={blockContainerRef} onDragStart={dragStartHandler} onDragEnd={dragEndHandler} className="block" draggable="true">
                    <div className='drag-icon'><DragIcon/></div>
                    <ContentEditable innerRef={blockRef as any} className="block-heading2 block-flex-grow" placeholder="Enter Heading 2" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={((e: any) => onBlockKeyDown(e, 0, '')) as any} tagName="h2" disabled={false} html={content}/>
                </div>
            )
        }
        else if(block.block_type === BLOCK_TYPES.HEADING3) {
            return (
                <div data-blockid={block.id} ref={blockContainerRef} onDragStart={dragStartHandler} onDragEnd={dragEndHandler} className="block" draggable="true">
                    <div className='drag-icon'><DragIcon/></div>
                    <ContentEditable innerRef={blockRef as any} className="block-heading3 block-flex-grow" placeholder="Enter Heading 3" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={((e: any) => onBlockKeyDown(e, 0, '')) as any} tagName="h3" disabled={false} html={content}/>
                </div>
            )
        }
        else if(block.block_type === BLOCK_TYPES.UNORDEREDLIST) {
            return (
                <ul data-blockid={block.id} ref={blockContainerRef as any} onDragStart={dragStartHandler as any} onDragEnd={dragEndHandler} className="block" draggable="true">
                    <div className='drag-icon'><DragIcon/></div>
                    <ContentEditable innerRef={blockRef as any} className="block-ul block-flex-grow" placeholder="Enter List item" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={((e: any) => onBlockKeyDown(e, 1, BLOCK_TYPES.UNORDEREDLIST)) as any} tagName="li" disabled={false} html={content}/>
                </ul>
            )
        }
        else if(block.block_type === BLOCK_TYPES.CHECKLIST) {
            return (
                <div data-blockid={block.id} ref={blockContainerRef} onDragStart={dragStartHandler} onDragEnd={dragEndHandler} className="block" draggable="true">
                    <div className='drag-icon'><DragIcon/></div>
                    <div className="checkBoxContainer">
                        <input type="checkbox" className="checkbox" checked={checked} onChange={checkboxChangeHandler}/>
                        <ContentEditable
                        innerRef={blockRef as any} className="block-text block-flex-grow" placeholder="Enter To Do List" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={((e: any) => onBlockKeyDown(e, 0, '')) as any} tagName="p" disabled={false} html={content}/>
                    </div>
                </div>
            )
        }
    };

    return (
        <>
            {displayBlock()}
        </>
    )
}

export default Block;