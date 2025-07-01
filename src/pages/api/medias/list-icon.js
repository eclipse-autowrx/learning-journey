// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { ICONs } from "@/lib/mock_data/media";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        let mediaList = ICONs
        res.status(200).json({ success: true, data: mediaList });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      break;
  }
}
