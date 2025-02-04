import {Router} from "express";
import { dataScraping, fireCrawl } from "../controllers/firecrawl.controller.js";

const router = Router();

router.route('/scrap').post(fireCrawl);
router.route('/scrap-data').post(dataScraping);

export default router;