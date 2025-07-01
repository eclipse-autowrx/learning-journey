// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { PATHS } from "@/lib/mock_data/paths";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        let dbPaths = PATHS
        res.status(200).json({ success: true, data: dbPaths });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      break;
  }
}
