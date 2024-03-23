import { useContext, useEffect, useRef, useState } from "react";
import ContentEditable from 'react-contenteditable';

import "./block.css";
import { BlockContext } from "../../context/block-context";
import { BLOCK_TYPES } from "../../Utils/block_types";
import { ReactComponent as DragIcon } from "../../Utils/Drag.svg";

const Block = ({block, newBlockRef, createBlock}) => {
    const jwtToken = useRef('');
    const [content, setContent] = useState('');
    const contentRef = useRef('');
    const {setBlockList, focusId, blockListRef, blockContainerList, draggingElementRef} = useContext(BlockContext);
    const blockRef = useRef(null);
    const blockContainerRef = useRef(null);

    useEffect(() => {
        for(let property of block.propertiesList) {
            if(property.property_name === 'title') {
                setContent(property.value);
                contentRef.current = property.value;
            }
        }
        jwtToken.current = localStorage.getItem('token');
    }, [])

    useEffect(() => {
        if(focusId === block.id && blockRef.current !== null){
            setTimeout(() => blockRef.current.focus(), 0);
        }
    }, [focusId])

    useEffect(() => {
        if(blockContainerRef.current !== null) {
            blockContainerList.current.push(blockContainerRef.current);
        }
    }, [])
    

    const updateProperty = (value) => {
        let propData = {
            blockId: block.id,
            property: {
                property_name: 'title',
                value: value
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
            if(res.message !== 'property updated') {
                console.log(res.error);
            }
        })
    }

    const onBlockBlur = (e) => {
        updateProperty(e.target.innerHTML);
    }

    const onBlockKeyDown = (e, nextFocus, type) => {
        if(e.key === 'Enter'){
            e.preventDefault();
            updateProperty(e.target.textContent);
            if(nextFocus === 0) setTimeout(() => newBlockRef.current.focus(), 0);
            else if(nextFocus === 1) {
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
            .then(res => {
                if(res.message === 'block deleted') {
                    setTimeout(() => newBlockRef.current.focus(), 0);
                    const updatedList = blockListRef.current.filter((Block) => Block.id !== block.id);
                    const updatedContainerList = blockContainerList.current.filter((Block) => Block !== blockContainerRef.current);
                    setBlockList([...updatedList]);
                    blockListRef.current = updatedList;
                    blockContainerList.current = updatedContainerList;
                }
            })
        }
    }

    const handleBlockChange = (e) => {
        setContent(e.target.value);
        contentRef.current = e.target.value;
    }

    const dragStartHandler = (e) => {
        blockContainerRef.current.classList.add('dragging-block');
        blockRef.current.classList.add('dragging-block');
        draggingElementRef.current = e.target;
    }

    const dragEndHandler = (e) => {
        blockContainerRef.current.classList.remove('dragging-block');
        blockRef.current.classList.remove('dragging-block');
        let blockArray = [];
        blockListRef.current.forEach((block, index) => {
            blockArray.push([block.id, index+1]);
        });
        console.log(blockArray);
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
        .then(res => {
            if(res.message !== 'Positions updated') {
                console.log(res.error);
            }
            else {
                console.log('Positions updated');
            }
        })
    }

    const displayBlock = () => {
        if(block.block_type ===  BLOCK_TYPES.TEXT) {
            return (
                <div data-blockid={block.id} ref={blockContainerRef} onDragStart={dragStartHandler} onDragEnd={dragEndHandler} className="block" draggable="true">
                    <div className='drag-icon'><DragIcon/></div>
                    <ContentEditable innerRef={blockRef} className="block-text block-flex-grow" placeholder="Enter text" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={(e) => onBlockKeyDown(e, 0, '')} tagName="p" disabled={false} html={content}/>
                </div>
            )
        }
        else if(block.block_type === BLOCK_TYPES.HEADING1) {
            return (
                <div data-blockid={block.id} ref={blockContainerRef} onDragStart={dragStartHandler} onDragEnd={dragEndHandler} className="block" draggable="true">
                    <div className='drag-icon'><DragIcon/></div>
                    <ContentEditable innerRef={blockRef} className="block-heading1 block-flex-grow" placeholder="Enter Heading 1" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={(e) => onBlockKeyDown(e, 0, '')} tagName="h1" disabled={false} html={content}/>
                </div>
            )
        }
        else if(block.block_type === BLOCK_TYPES.HEADING2) {
            return (
                <div data-blockid={block.id} ref={blockContainerRef} onDragStart={dragStartHandler} onDragEnd={dragEndHandler} className="block" draggable="true">
                    <div className='drag-icon'><DragIcon/></div>
                    <ContentEditable innerRef={blockRef} className="block-heading2 block-flex-grow" placeholder="Enter Heading 2" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={(e) => onBlockKeyDown(e, 0, '')} tagName="h2" disabled={false} html={content}/>
                </div>
            )
        }
        else if(block.block_type === BLOCK_TYPES.HEADING3) {
            return (
                <div data-blockid={block.id} ref={blockContainerRef} onDragStart={dragStartHandler} onDragEnd={dragEndHandler} className="block" draggable="true">
                    <div className='drag-icon'><DragIcon/></div>
                    <ContentEditable innerRef={blockRef} className="block-heading3 block-flex-grow" placeholder="Enter Heading 3" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={(e) => onBlockKeyDown(e, 0, '')} tagName="h3" disabled={false} html={content}/>
                </div>
            )
        }
        else if(block.block_type === BLOCK_TYPES.UNORDEREDLIST) {
            return (
                <ul data-blockid={block.id} ref={blockContainerRef} onDragStart={dragStartHandler} onDragEnd={dragEndHandler} className="block" draggable="true">
                    <div className='drag-icon'><DragIcon/></div>
                    <ContentEditable innerRef={blockRef} className="block-ul block-flex-grow" placeholder="Enter List item" onChange={handleBlockChange} onBlur={onBlockBlur} onKeyDown={(e) => onBlockKeyDown(e, 1, BLOCK_TYPES.UNORDEREDLIST)} tagName="li" disabled={false} html={content}/>
                </ul>
            )
        }
    }

    return (
        <>
            {displayBlock()}
        </>
    )
}

export default Block;