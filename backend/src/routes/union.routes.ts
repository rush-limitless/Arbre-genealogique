// SPEC-F-005: Routes Unions

import { Router } from 'express';
import { UnionController } from '../controllers/union.controller';

const router = Router();
const controller = new UnionController();

router.get('/', controller.getAll.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
