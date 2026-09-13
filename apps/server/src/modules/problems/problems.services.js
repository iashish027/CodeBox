/* 
    1. create problem
    2. update problem
    3. remove problem
    4. read(get) single problem with problems id
    5. fetch multiple problem like recent 50 , using paging like something
*/

import { prisma } from "@codebox/db";
import { ApiError } from "../../shared/errors/apiError.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";

//helpers

const checkTitleUnique = async (title, excludeId) => {
  const slug = generateSlug(title);

  const existing = await prisma.problem.findUnique({
    where: { slug },
  });

  if (existing && existing.id !== excludeId) {
    throw new ApiError(
      409,
      ERROR_CODES.CONFLICT,
      "Problem with this title already exists",
    );
  }

  return slug; // return the validated slug for reuse
};

export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens
};

// services

const createProblemService = async (problem) => {
  const slug = await checkTitleUnique(problem.title);

  const newProblem = await prisma.problem.create({
    data: {
      slug,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      timeLimit: problem.timeLimit, // ms
      memoryLimit: problem.memoryLimit, // mb
      sampleInput: problem.sampleInput,
      sampleOutput: problem.sampleOutput,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      constraints: problem.constraints,
    },
  });

  return newProblem;
};

const updateProblemService = async (problem) => {
  let slug = generateSlug(problem.title);

  const currentProblem = await prisma.problem.findUnique({
    where: { slug },
  });

  if (!currentProblem) {
    throw new ApiError(
      401,
      ERROR_CODES.INVALID_INPUT,
      "Problem with this title does not exist",
    );
  }
  const updatedProblem = await prisma.problem.update({
    where: { slug },
    data: {
      ...(problem.description && { description: problem.description }),
      ...(problem.difficulty && { difficulty: problem.difficulty }),
      ...(problem.timeLimit && { timeLimit: problem.timeLimit }),
      ...(problem.memoryLimit && { memoryLimit: problem.memoryLimit }),
      ...(problem.sampleInput && { sampleInput: problem.sampleInput }),
      ...(problem.sampleOutput && { sampleOutput: problem.sampleOutput }),
      ...(problem.inputFormat && { inputFormat: problem.inputFormat }),
      ...(problem.outputFormat && { outputFormat: problem.outputFormat }),
      ...(problem.constraints && { constraints: problem.constraints }),
    },
  });

  return updatedProblem;
};


export {createProblemService , updateProblemService};
