// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

// PDF dimensions from our template
const pdfWidth = 842.25;
const pdfHeight = 595.5;

// Your measurements
const pageHeightCm = 30;
const userNameYCm = 9.72;
const courseNameYCm = 13.29;
const dateYCm = 14.52;

// Convert cm to points (1 cm = 28.3465 points)
const cmToPoints = 28.3465;

// Calculate positions
const userNameY = userNameYCm * cmToPoints;
const courseNameY = courseNameYCm * cmToPoints;
const dateY = dateYCm * cmToPoints;

console.log('📏 PDF Positioning Calculations:');
console.log(`📄 PDF dimensions: ${pdfWidth} x ${pdfHeight} points`);
console.log(`📏 Page height: ${pageHeightCm} cm = ${pageHeightCm * cmToPoints} points`);
console.log('');
console.log('📍 Calculated positions:');
console.log(`👤 User Name Y: ${userNameYCm} cm = ${userNameY.toFixed(2)} points`);
console.log(`📚 Course Name Y: ${courseNameYCm} cm = ${courseNameY.toFixed(2)} points`);
console.log(`📅 Date Y: ${dateYCm} cm = ${dateY.toFixed(2)} points`);
console.log('');
console.log('🎯 Percentage positions (for reference):');
console.log(`👤 User Name: ${((userNameY / pdfHeight) * 100).toFixed(1)}%`);
console.log(`📚 Course Name: ${((courseNameY / pdfHeight) * 100).toFixed(1)}%`);
console.log(`📅 Date: ${((dateY / pdfHeight) * 100).toFixed(1)}%`);

// Export the values for use in other scripts
export const positioning = {
  userNameY: userNameY,
  courseNameY: courseNameY,
  dateY: dateY,
  centerX: pdfWidth / 2
};