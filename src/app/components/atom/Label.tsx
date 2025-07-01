// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

interface LabelProps {
    children?: any
}


export default function Label({ children }: LabelProps) {
    return (
      <label className="block text-sm font-medium text-gray-700">{children}</label>
    );
  }