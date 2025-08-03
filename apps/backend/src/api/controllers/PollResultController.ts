// src/api/controllers/PollResultController.ts
import type { NextFunction, Request, Response } from "express";

import PollResultService from "../services/PollResultService";
import catchAsync from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";

/** POST /api/polls/:pollId/vote */
export const voteOnPoll = catchAsync(
  async (req: Request<{ pollId: string }, {}, { optionId: string }>, res: Response, _next: NextFunction) => {
    const { pollId } = req.params;
    const { optionId } = req.body;
    const userId = req.user!.id;

    await PollResultService.vote(pollId, optionId, userId);
    sendResponse(res, 200, true, "Vote recorded");
  }
);

/** GET /api/polls/:pollId/results */
export const getPollResults = catchAsync(
  async (req: Request<{ pollId: string }>, res: Response) => {
    const { pollId } = req.params;
    const results = await PollResultService.getResults(pollId);
    sendResponse(res, 200, true, "Poll results fetched", { results });
  }
);
