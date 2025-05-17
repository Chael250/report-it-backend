import { Router, Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const router = Router();
const prisma = new PrismaClient();

// Get all agencies
router.get('/', async (_req: Request, res: Response) => {
  try {
    const agencies = await prisma.agency.findMany();
    res.json(agencies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get agency by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const agency = await prisma.agency.findUnique({
      where: { id },
      include: { complaints: true },
    });
    
    if (!agency) {
      res.status(404).json({ error: 'Agency not found' });
      return;
    }
    
    res.json(agency);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create agency
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Agency name is required' });
      return;
    }
    
    const agency = await prisma.agency.create({ data: { name } });
    res.status(201).json(agency);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update agency
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body;

    const existingAgency = await prisma.agency.findUnique({ where: { id } });
    
    if (!existingAgency) {
      res.status(404).json({ error: 'Agency not found' });
      return;
    }

    const agency = await prisma.agency.update({
      where: { id },
      data: { name: name || existingAgency.name },
    });
    
    res.json(agency);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete agency
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const existingAgency = await prisma.agency.findUnique({
      where: { id },
      include: { complaints: true },
    });
    
    if (!existingAgency) {
      res.status(404).json({ error: 'Agency not found' });
      return;
    }

    if (existingAgency.complaints.length > 0) {
      res.status(400).json({
        error: 'Cannot delete agency with existing complaints. Transfer or delete complaints first.',
      });
      return;
    }

    await prisma.agency.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;