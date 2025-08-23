// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from "@/lib/mongodb";
import { CourseProgress } from "@/lib/models/index.js";
import { check_auth } from "@/lib/backend/check_auth";
import { STATE_NOT_STARTED, STATE_IN_PROGRESS, STATE_COMPLETED } from "@/lib/const";
import { updatePathsForCourse } from "@/pages/api/progress/paths/utils";
export default async function handler(req, res) {
  const { method } = req;
  const { course_id } = req.query;

  const { user_id, token } = check_auth(req, res);

  switch (method) {
    case "GET":
      try {
        await connectToDatabase();

        const dbProgress = await CourseProgress.findOne({ user_id: user_id, course_id: course_id });

        if (!dbProgress) {
          return res.status(404).json({ success: false, error: "Progress not found" });
        }

        res.status(200).json({ success: true, data: dbProgress });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "PUT":
      try {
        await connectToDatabase();

        const body = req.body || {};

        // Whitelist fields
        const allowedStates = new Set([STATE_NOT_STARTED, STATE_IN_PROGRESS, STATE_COMPLETED]);
        const nextState = body.state;
        const nextData = body.data;

        const existing = await CourseProgress.findOne({ user_id: user_id, course_id: course_id }).lean();

        const now = new Date();
        const setFields = {};

        if (nextState && allowedStates.has(nextState)) {
          setFields['state'] = nextState;
          if (nextState === STATE_IN_PROGRESS && (!existing || existing.state === STATE_NOT_STARTED)) {
            setFields['started_at'] = now;
          }
          if (nextState === STATE_COMPLETED) {
            if (!existing || !existing.finished_at) {
              setFields['finished_at'] = now;
            }
            if (!existing || !existing.started_at) {
              setFields['started_at'] = setFields['started_at'] || now;
            }
          }
        }

        if (nextData && typeof nextData === 'object') {
          setFields['data'] = nextData;
        }

        const updatedProgress = await CourseProgress.findOneAndUpdate(
          { user_id: user_id, course_id: course_id },
          { $set: setFields, $setOnInsert: { user_id: user_id, course_id: course_id } },
          { new: true, upsert: true }
        );

        try { await updatePathsForCourse({ user_id, course_id }); } catch(_) {}
        res.status(200).json({ success: true, data: updatedProgress });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: "Method not allowed" });
      break;
  }
}
