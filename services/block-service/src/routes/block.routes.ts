import { Router, Response } from 'express';
import * as BlockModel from '../models/block.model';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import redisClient from '../config/redis';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all pages for authenticated user
router.get('/pages', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const cacheKey = `user:pages:${req.user.id}`;

    // Check cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.debug({ userId: req.user.id }, 'Cache hit for pages');
      return res.status(200).json({
        message: 'pages retrieved',
        pages: JSON.parse(cached),
      });
    }

    const pages = await BlockModel.getAllPages(req.user.id);

    // Cache result
    await redisClient.setEx(
      cacheKey,
      parseInt(process.env.CACHE_PAGES_TTL || '300'),
      JSON.stringify(pages)
    );

    res.status(200).json({ message: 'pages retrieved', pages });
  } catch (error: any) {
    logger.error({ error }, 'Get pages error');
    res.status(500).json({ error: error.message || 'Failed to get pages' });
  }
});

// Get all blocks for a page
router.get('/blocks/:pageId', async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;

    const cacheKey = `blocks:page:${pageId}`;

    // Check cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.debug({ pageId }, 'Cache hit for blocks');
      return res.status(200).json({
        message: 'blocks retrieved',
        blocks: JSON.parse(cached),
      });
    }

    const blocks = await BlockModel.getBlocksByPageId(pageId);

    // Cache result
    await redisClient.setEx(
      cacheKey,
      parseInt(process.env.CACHE_BLOCKS_TTL || '120'),
      JSON.stringify(blocks)
    );

    res.status(200).json({ message: 'blocks retrieved', blocks });
  } catch (error: any) {
    logger.error({ error }, 'Get blocks error');
    res.status(500).json({ error: error.message || 'Failed to get blocks' });
  }
});

// Create new block
router.post('/create', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const blockData = {
      ...req.body,
      user_id: req.user.id,
    };

    const id = await BlockModel.createBlock(blockData);

    // Invalidate cache
    await redisClient.del(`user:pages:${req.user.id}`);
    if (blockData.page_id) {
      await redisClient.del(`blocks:page:${blockData.page_id}`);
    }

    res.status(201).json({ message: 'block created', id });
  } catch (error: any) {
    logger.error({ error }, 'Create block error');
    res.status(400).json({ error: error.message || 'Failed to create block' });
  }
});

// Update block
router.put('/update', async (req: AuthRequest, res: Response) => {
  try {
    const { id, block_type, position, parent_id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Block ID is required' });
    }

    await BlockModel.updateBlock({ id, block_type, position, parent_id });

    // Invalidate cache
    const block = await BlockModel.getBlockById(id);
    if (block) {
      await redisClient.del(`user:pages:${block.user_id}`);
      if (block.page_id) {
        await redisClient.del(`blocks:page:${block.page_id}`);
      }
    }

    res.status(200).json({ message: 'block updated' });
  } catch (error: any) {
    logger.error({ error }, 'Update block error');
    res.status(400).json({ error: error.message || 'Failed to update block' });
  }
});

// Update block property
router.put('/property/update', async (req: AuthRequest, res: Response) => {
  try {
    const { blockId, property } = req.body;

    if (!blockId || !property) {
      return res.status(400).json({ error: 'blockId and property are required' });
    }

    await BlockModel.updateProperty(blockId, property);

    // Invalidate cache
    const block = await BlockModel.getBlockById(blockId);
    if (block) {
      await redisClient.del(`user:pages:${block.user_id}`);
      if (block.page_id) {
        await redisClient.del(`blocks:page:${block.page_id}`);
      }
    }

    res.status(200).json({ message: 'property updated' });
  } catch (error: any) {
    logger.error({ error }, 'Update property error');
    res.status(400).json({ error: error.message || 'Failed to update property' });
  }
});

// Batch update positions (for drag-drop reordering)
router.patch('/reorder', async (req: AuthRequest, res: Response) => {
  try {
    const { blockUpdates } = req.body;

    if (!blockUpdates || !Array.isArray(blockUpdates)) {
      return res.status(400).json({ error: 'blockUpdates array is required' });
    }

    await BlockModel.updatePositions(blockUpdates);

    // Invalidate cache for affected pages
    if (req.user) {
      await redisClient.del(`user:pages:${req.user.id}`);
    }

    res.status(200).json({ message: 'positions updated' });
  } catch (error: any) {
    logger.error({ error }, 'Update positions error');
    res.status(400).json({ error: error.message || 'Failed to update positions' });
  }
});

// Delete block
router.delete('/delete', async (req: AuthRequest, res: Response) => {
  try {
    const { blockId } = req.body;

    if (!blockId) {
      return res.status(400).json({ error: 'blockId is required' });
    }

    // Get block info before deleting
    const block = await BlockModel.getBlockById(blockId);

    await BlockModel.deleteBlock(blockId);

    // Invalidate cache
    if (block) {
      await redisClient.del(`user:pages:${block.user_id}`);
      if (block.page_id) {
        await redisClient.del(`blocks:page:${block.page_id}`);
      }
    }

    res.status(200).json({ message: 'block deleted' });
  } catch (error: any) {
    logger.error({ error }, 'Delete block error');
    res.status(400).json({ error: error.message || 'Failed to delete block' });
  }
});

export default router;
