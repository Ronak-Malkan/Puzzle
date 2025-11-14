import { Router, Response } from 'express';
import * as BlockModel from '../models/block.model';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import redisClient from '../config/redis';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all pages for authenticated user
router.get('/pages', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const cacheKey = `user:pages:${req.user.id}`;

    // Check cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.debug({ userId: req.user.id }, 'Cache hit for pages');
      res.status(200).json({
        message: 'pages retrieved',
        pages: JSON.parse(cached),
      });
      return;
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
router.get('/blocks/:pageId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pageId } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const cacheKey = `page:blocks:${pageId}`;

    // Check cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.debug({ pageId }, 'Cache hit for blocks');
      res.status(200).json({
        message: 'blocks retrieved',
        blocks: JSON.parse(cached),
      });
      return;
    }

    const blocks = await BlockModel.getBlocksByPageId(pageId);

    // Cache result
    await redisClient.setEx(
      cacheKey,
      parseInt(process.env.CACHE_BLOCKS_TTL || '300'),
      JSON.stringify(blocks)
    );

    res.status(200).json({ message: 'blocks retrieved', blocks });
  } catch (error: any) {
    logger.error({ error }, 'Get blocks error');
    res.status(500).json({ error: error.message || 'Failed to get blocks' });
  }
});

// Create new block
router.post('/create', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const blockData = {
      ...req.body,
      user_id: req.user.id,
    };

    // Validation: Page nesting rules
    // If creating a page block with a parent, the parent must also be a page
    if (blockData.block_type === 'page' && blockData.parent_id) {
      const parent = await BlockModel.getBlockById(blockData.parent_id);
      if (!parent) {
        res.status(400).json({ error: 'Parent block not found' });
        return;
      }
      if (parent.block_type !== 'page') {
        res.status(400).json({
          error: 'Page blocks can only be nested under other page blocks'
        });
        return;
      }
    }

    const id = await BlockModel.createBlock(blockData);

    // Invalidate cache
    await redisClient.del(`user:pages:${req.user.id}`);
    if (blockData.page_id) {
      await redisClient.del(`page:blocks:${blockData.page_id}`);
    }

    res.status(201).json({ message: 'Block created', id });
  } catch (error: any) {
    logger.error({ error }, 'Create block error');
    res.status(500).json({ error: error.message || 'Failed to create block' });
  }
});

// Update block
router.put('/update/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const block = await BlockModel.getBlockById(id);
    if (!block) {
      res.status(404).json({ error: 'Block not found' });
      return;
    }

    await BlockModel.updateBlock({ id, ...req.body });

    // Invalidate cache
    await redisClient.del(`user:pages:${req.user.id}`);
    if (block.page_id) {
      await redisClient.del(`page:blocks:${block.page_id}`);
    }

    res.status(200).json({ message: 'Block updated' });
  } catch (error: any) {
    logger.error({ error }, 'Update block error');
    res.status(500).json({ error: error.message || 'Failed to update block' });
  }
});

// Delete block
router.delete('/delete/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const block = await BlockModel.getBlockById(id);
    if (!block) {
      res.status(404).json({ error: 'Block not found' });
      return;
    }

    await BlockModel.deleteBlock(id);

    // Invalidate cache
    await redisClient.del(`user:pages:${req.user.id}`);
    if (block.page_id) {
      await redisClient.del(`page:blocks:${block.page_id}`);
    }

    res.status(200).json({ message: 'Block deleted' });
  } catch (error: any) {
    logger.error({ error }, 'Delete block error');
    res.status(500).json({ error: error.message || 'Failed to delete block' });
  }
});

// Reorder blocks
router.post('/reorder', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { blockIds } = req.body;

    if (!Array.isArray(blockIds)) {
      res.status(400).json({ error: 'Invalid block IDs' });
      return;
    }

    const blockUpdates = blockIds.map((id: string, index: number) => ({
      id,
      position: index,
    }));
    await BlockModel.updatePositions(blockUpdates);

    // Invalidate cache
    await redisClient.del(`user:pages:${req.user.id}`);

    res.status(200).json({ message: 'Blocks reordered' });
  } catch (error: any) {
    logger.error({ error }, 'Reorder blocks error');
    res.status(500).json({ error: error.message || 'Failed to reorder blocks' });
  }
});

// Get block by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const block = await BlockModel.getBlockById(id);

    if (!block) {
      res.status(404).json({ error: 'Block not found' });
      return;
    }

    res.status(200).json({ message: 'block retrieved', block });
  } catch (error: any) {
    logger.error({ error }, 'Get block error');
    res.status(500).json({ error: error.message || 'Failed to get block' });
  }
});

export default router;
