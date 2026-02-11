// SPEC-F-004: Routes Relations

import { Router } from 'express';
import { RelationshipController } from '../controllers/relationship.controller';

const router = Router();
const controller = new RelationshipController();

router.post('/', controller.create.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
router.get('/person/:personId', controller.getByPerson.bind(controller));

export default router;
