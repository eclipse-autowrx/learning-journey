// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

// This endpoint served mock media icons. Remove or replace with DB-backed source if needed.

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        return res.status(410).json({ success: false, error: "Deprecated: media icons are no longer served from mock data" });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      break;
  }
}
