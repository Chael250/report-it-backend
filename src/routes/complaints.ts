import { Router, Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const router = Router();
const prisma = new PrismaClient();

// Get all complaints
router.get('/', async (_req: Request, res: Response) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        agency: true,
      },
    });
    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get complaint by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const complaintId = parseInt(req.params.id);
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { agency: true },
    });

    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    res.json(complaint);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create complaint
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, category, agencyId } = req.body;

    if (!title || !description || !category || !agencyId) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const agency = await prisma.agency.findUnique({
      where: { id: parseInt(agencyId) },
    });

    if (!agency) {
      res.status(404).json({ error: 'Agency not found' });
      return;
    }

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category,
        agencyId: parseInt(agencyId),
      },
    });

    res.status(201).json(complaint);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update complaint
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const complaintId = parseInt(req.params.id);
    const { title, description, category, status, agencyId } = req.body;

    const existingComplaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!existingComplaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        title: title ?? existingComplaint.title,
        description: description ?? existingComplaint.description,
        category: category ?? existingComplaint.category,
        status: status ?? existingComplaint.status,
        agencyId: agencyId ? parseInt(agencyId) : existingComplaint.agencyId,
      },
    });

    res.json(complaint);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete complaint
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const complaintId = parseInt(req.params.id);

    const existingComplaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!existingComplaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    await prisma.complaint.delete({
      where: { id: complaintId },
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;