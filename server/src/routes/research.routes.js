import { Router } from "express";
import { verifyJwt } from '../middlewares/auth.middleware.js'
import { deleteResearch, getMeta, getResearch, listResearches, startResearch } from "../controllers/research.controller.js";

const router = Router();

// every research belongs to a logged-in user
router.use(verifyJwt);

router.route('/meta').get(getMeta);
router.route('/').get(listResearches).post(startResearch);
router.route('/:id').get(getResearch).delete(deleteResearch);


export default router;
