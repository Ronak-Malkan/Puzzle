import * as express from 'express' 
import * as BlockService from '../services/BlockService.js';

const blockRouter = express.Router();

blockRouter.post("/create", async (req, res) => {
    try {
        const id = await BlockService.createBlock(req.body);
        res.status(201).json({id: id, message: "block created"});
    }catch(err){
        res.status(500).json({error: err.message, message: "Internal server error"});
    }
})

blockRouter.post("/update", async (req, res) => {
    try {
        await BlockService.updateBlock(req.body);
        res.status(201).json({message: 'block updated'});
    }catch (err) {
        res.status(500).json({error: err.message, message: 'Internal Server Error'});
    }
})

blockRouter.post("/updateprop", async (req, res) => {
    try {
        await BlockService.updateProp(req.body.blockId, req.body.property);
        res.status(200).json({message: 'property updated'});
    }catch (err) {
        res.status(500).json({error: err.message, message: 'Internal Server Error'});
    }
})

blockRouter.post('/updatepositions', async (req, res) => {
    try {
        await BlockService.updateBlocksPosition(req.body);
        res.status(200).json({message: 'Positions updated'});
    }catch (err) {
        res.status(500).json({error: err.message, message: 'Internal Server Error'});
    }
})

blockRouter.get("/pages", async (req, res) => {
    try {
        const pages = await BlockService.getAllPages(req.body.user);
        res.status(201).json({pages, message: 'pages retrieved'});
    }catch (err) {
        res.status(500).json({error: err.message, message: 'Internal Server Error'});
    }
})

blockRouter.get("/blocks/:pageId", async (req, res) => {
    try {
        const blocks = await BlockService.getAllBlocks(req.params.pageId);
        res.status(201).json({blocks, message: 'blocks retrieved'});
    }catch (err) {
        res.status(500).json({error: err.message, message: 'Internal Server Error'});
    }
})

blockRouter.delete("/delete", async (req, res) => {
    try {
        await BlockService.delBlock(req.body.blockId);
        res.status(200).json({message: 'block deleted'});
    }catch (err) {
        res.status(500).json({error: err.message, message: 'Internal Server Error'});
    }
})


export {blockRouter};