// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { PathService } from "../../../lib/services/dataService.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const dbPaths = await PathService.getAll();
        const transformedPaths = dbPaths.map(path => ({
          ...path,
          total_courses: path.courses ? path.courses.length : 0
        }));
        res.status(200).json({ success: true, data: transformedPaths });
      } catch (error) {
        console.error('Error fetching paths:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "POST":
      try {
        const pathData = req.body;
        const newPath = await PathService.create(pathData);
        res.status(201).json({ success: true, data: newPath });
      } catch (error) {
        console.error('Error creating path:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
