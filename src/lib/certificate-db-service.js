// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import PathProgress from './models/PathProgress.js';
import { COURSE_PROGRESS_STATES } from './const.js';

/**
 * Database service for certificate operations
 */
export class CertificateDBService {
  
  /**
   * Check if a user has completed a path
   * @param {string} userId - User ID
   * @param {string} pathId - Path ID
   * @returns {Promise<boolean>} True if path is completed
   */
  async checkPathCompletion(userId, pathId) {
    try {
      const progress = await PathProgress.findOne({ 
        user_id: userId, 
        path_id: pathId 
      });
      
      if (!progress) {
        return false;
      }
      
      // Check if path is completed (state is 'completed' or 'finished')
      return progress.state === COURSE_PROGRESS_STATES.COMPLETED || 
             progress.state === COURSE_PROGRESS_STATES.FINISHED ||
             progress.finished_at !== null;
             
    } catch (error) {
      console.error('Error checking path completion:', error);
      return false;
    }
  }

  /**
   * Get existing certificate information
   * @param {string} userId - User ID
   * @param {string} pathId - Path ID
   * @returns {Promise<Object|null>} Certificate info or null
   */
  async getExistingCertificate(userId, pathId) {
    try {
      const progress = await PathProgress.findOne({ 
        user_id: userId, 
        path_id: pathId 
      });
      
      if (!progress || !progress.certificate) {
        return null;
      }
      
      return {
        pdfUrl: progress.certificate.pdfUrl,
        pngUrl: progress.certificate.pngUrl,
        fileName: progress.certificate.fileName,
        generatedAt: progress.certificate.generatedAt,
        customUserName: progress.certificate.customUserName
      };
      
    } catch (error) {
      console.error('Error getting existing certificate:', error);
      return null;
    }
  }

  /**
   * Save certificate links to database
   * @param {string} userId - User ID
   * @param {string} pathId - Path ID
   * @param {Object} certificate - Certificate information
   * @returns {Promise<boolean>} Success status
   */
  async saveCertificateLinks(userId, pathId, certificate) {
    try {
      const result = await PathProgress.updateOne(
        { user_id: userId, path_id: pathId },
        { 
          $set: { 
            certificate: {
              pdfUrl: certificate.pdfUrl,
              pngUrl: certificate.pngUrl,
              fileName: certificate.fileName,
              generatedAt: new Date(),
              customUserName: null
            }
          }
        }
      );
      
      return result.modifiedCount > 0 || result.matchedCount > 0;
      
    } catch (error) {
      console.error('Error saving certificate links:', error);
      return false;
    }
  }

  /**
   * Update certificate links in database
   * @param {string} userId - User ID
   * @param {string} pathId - Path ID
   * @param {Object} certificate - New certificate information
   * @param {string} customUserName - Custom user name
   * @returns {Promise<boolean>} Success status
   */
  async updateCertificateLinks(userId, pathId, certificate, customUserName = null) {
    try {
      const result = await PathProgress.updateOne(
        { user_id: userId, path_id: pathId },
        { 
          $set: { 
            certificate: {
              pdfUrl: certificate.pdfUrl,
              pngUrl: certificate.pngUrl,
              fileName: certificate.fileName,
              generatedAt: new Date(),
              customUserName: customUserName
            }
          }
        }
      );
      
      return result.modifiedCount > 0 || result.matchedCount > 0;
      
    } catch (error) {
      console.error('Error updating certificate links:', error);
      return false;
    }
  }

  /**
   * Get all certificates for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of certificate info
   */
  async getUserCertificates(userId) {
    try {
      const progressList = await PathProgress.find({ 
        user_id: userId,
        certificate: { $exists: true, $ne: null }
      }).select('path_id certificate finished_at');
      
      return progressList.map(progress => ({
        pathId: progress.path_id,
        certificate: progress.certificate,
        completedAt: progress.finished_at
      }));
      
    } catch (error) {
      console.error('Error getting user certificates:', error);
      return [];
    }
  }

  /**
   * Delete certificate from database
   * @param {string} userId - User ID
   * @param {string} pathId - Path ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteCertificate(userId, pathId) {
    try {
      const result = await PathProgress.updateOne(
        { user_id: userId, path_id: pathId },
        { 
          $unset: { certificate: 1 }
        }
      );
      
      return result.modifiedCount > 0;
      
    } catch (error) {
      console.error('Error deleting certificate:', error);
      return false;
    }
  }
}