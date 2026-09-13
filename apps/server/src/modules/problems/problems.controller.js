/* 
    1. create problem
    2. update problem
    3. remove problem
    4. read(get) single problem with problems id
    5. fetch multiple problem like recent 50 , using paging like something
*/

import {
  createProblemService,
  updateProblemService,
} from "./problems.services.js";

const createProblem = async (req, res) => {
  const problem = req.body.problem;

  const result = await createProblemService(problem);
  res.status(201).json(result);
};

const updateProblem = async (req, res) => {
  const problem = req.body.problem;

  const result = await updateProblemService(problem);

  res.status(201).json(result);
};

export { createProblem, updateProblem };
