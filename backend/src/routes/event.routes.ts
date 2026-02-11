import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all events for a person
router.get('/person/:personId', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { personId: req.params.personId },
      orderBy: { eventDate: 'asc' }
    });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
});

// Get all events (timeline)
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { person: true },
      orderBy: { eventDate: 'desc' }
    });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
});

// Create event
router.post('/', async (req, res) => {
  try {
    const event = await prisma.event.create({
      data: req.body
    });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to create event' });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete event' });
  }
});

export default router;
