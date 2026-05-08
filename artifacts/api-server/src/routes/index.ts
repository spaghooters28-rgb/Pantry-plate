import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mealsRouter from "./meals";
import weeklyRouter from "./weekly";
import groceryRouter from "./grocery";
import pantryRouter from "./pantry";
import scheduleRouter from "./schedule";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mealsRouter);
router.use(weeklyRouter);
router.use(groceryRouter);
router.use(pantryRouter);
router.use(scheduleRouter);

export default router;
