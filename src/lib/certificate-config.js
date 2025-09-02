// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import fs from 'fs';
import path from 'path';

/**
 * Load certificate generation configuration from config file
 * @returns {Object} Configuration object
 */
export function loadCertificateConfig() {
  try {
    const configPath = path.join(process.cwd(), 'certificate_gen.cfg');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const config = {};
    
    // Parse the configuration file
    configContent.split('\n').forEach(line => {
      line = line.trim();
      
      // Skip comments and empty lines
      if (line.startsWith('#') || line === '') {
        return;
      }
      
      // Parse key = value pairs
      const [key, value] = line.split('=').map(s => s.trim());
      if (key && value) {
        // Convert numeric values
        if (!isNaN(value)) {
          config[key] = parseFloat(value);
        } else {
          config[key] = value;
        }
      }
    });
    
    return config;
    
  } catch (error) {
    console.error('Error loading certificate config:', error);
    // Return default configuration if file doesn't exist
    return getDefaultConfig();
  }
}

/**
 * Get default configuration (fallback)
 * @returns {Object} Default configuration
 */
function getDefaultConfig() {
  return {
    template_height_cm: 21.01,
    user_name_y_cm: 11.0,
    path_name_y_cm: 13.5,
    issue_date_y_cm: 15,
    user_name_x_shift_cm: 0.0,
    path_name_x_shift_cm: 0.0,
    issue_date_x_shift_cm: 1.0,
    user_name_font_size: 24,
    path_name_font_size: 18,
    issue_date_font_size: 14,
    user_name_font_multiplier: 1.4,
    path_name_font_multiplier: 1.2,
    issue_date_font_multiplier: 1.0,
    png_dpi: 300,
    png_quality: 95
  };
}

/**
 * Calculate positioning values based on configuration
 * @param {Object} config - Configuration object
 * @param {number} height - Document height in points
 * @returns {Object} Calculated positioning values
 */
export function calculatePositions(config, height) {
  const conversionFactor = height / config.template_height_cm;
  
  return {
    // Y positions (inverted for PDF coordinate system)
    userNameY: height - (config.user_name_y_cm * conversionFactor),
    pathNameY: height - (config.path_name_y_cm * conversionFactor),
    issueDateY: height - (config.issue_date_y_cm * conversionFactor),
    
    // X shifts
    userNameXShift: config.user_name_x_shift_cm * conversionFactor,
    pathNameXShift: config.path_name_x_shift_cm * conversionFactor,
    issueDateXShift: config.issue_date_x_shift_cm * conversionFactor,
    
    // Font sizes
    userNameFontSize: config.user_name_font_size * config.user_name_font_multiplier,
    pathNameFontSize: config.path_name_font_size * config.path_name_font_multiplier,
    issueDateFontSize: config.issue_date_font_size * config.issue_date_font_multiplier,
    
    // PNG settings
    pngDpi: config.png_dpi,
    pngQuality: config.png_quality
  };
}