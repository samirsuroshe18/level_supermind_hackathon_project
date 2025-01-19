import {Router} from "express";
import { fireCrawl, insetData } from "../controllers/firecrawl.controller.js";

const router = Router();

router.route('/scrap').post(fireCrawl);
router.route('/insert').get(insetData);

export default router;