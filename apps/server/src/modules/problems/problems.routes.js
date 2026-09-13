/* 
    1. create problem
    2. update problem
    3. remove problem
    4. read(get) single problem with problems id
    5. fetch multiple problem like recent 50 , using paging like something
*/

import { Router } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { createProblem , updateProblem } from "./problems.controller.js";
const router = Router();


router.post("/create_problem",asyncHandler(createProblem));
router.post("/update_problem",asyncHandler(updateProblem));
// router.get("/get_problem_list")
// router.get("/get_problem");
// router.delete("/remove-problem");

export default router;