// SPEC-F-001: Routes Personnes

import { Router } from 'express';
import { PersonController } from '../controllers/person.controller';

const router = Router();
const controller = new PersonController();

router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
