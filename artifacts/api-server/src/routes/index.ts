import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import mealsRouter from "./meals";
import aiMealsRouter from "./ai-meals";
import weeklyRouter from "./weekly";
import groceryRouter from "./grocery";
import pantryRouter from "./pantry";
import scheduleRouter from "./schedule";
import preferencesRouter from "./preferences";
import analyzeRecipeRouter from "./analyze-recipe";
import historyRouter from "./history";
import openaiRouter from "./openai/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(mealsRouter);
router.use(aiMealsRouter);
router.use(analyzeRecipeRouter);
router.use(weeklyRouter);
router.use(groceryRouter);
router.use(pantryRouter);
router.use(scheduleRouter);
router.use(preferencesRouter);
router.use(historyRouter);
router.use(openaiRouter);

export default router;
