// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import PathProgress from './models/PathProgress.js';
import CourseProgress from './models/CourseProgress.js';
import { COURSE_PROGRESS_STATES } from './const.js';

/**
 * Database service for certificate operations
 */
export class CertificateDBService {
  
  /**
   * Check if a user has completed a path
   * @param {string} userId - User ID
   * @param {string} pathId - Path ID
   * @param {Array} requiredCourseIds - Array of required course IDs for this path
   * @returns {Promise<boolean>} True if path is completed
   */
  async checkPathCompletion(userId, pathId, requiredCourseIds = null) {
    try {
      const progress = await PathProgress.findOne({ 
        user_id: userId, 
        path_id: pathId 
      });
      
      if (!progress) {
        console.log('No progress record found for user:', userId, 'path:', pathId);
        return false;
      }
      
      console.log('Path progress state:', progress.state, 'finished_at:', progress.finished_at);
      console.log('Path progress courses map:', progress.courses);
      
      // First check if path is explicitly marked as completed
      const isExplicitlyCompleted = progress.state === COURSE_PROGRESS_STATES.COMPLETED || 
                                   !!progress.finished_at;
      
      if (isExplicitlyCompleted) {
        console.log('Path explicitly marked as completed');
        return true;
      }
      
      // If not explicitly completed, check course completion
      if (requiredCourseIds && requiredCourseIds.length > 0) {
        console.log('Checking course completion for required courses:', requiredCourseIds);
        const courseCompletion = await this.checkCourseCompletion(userId, requiredCourseIds);
        console.log('Course completion result:', courseCompletion);
        return courseCompletion;
      }
      
      console.log('No required courses specified, path not completed');
      return false;
             
    } catch (error) {
      console.error('Error checking path completion:', error);
      return false;
    }
  }

  /**
   * Check if user has completed all required courses
   * @param {string} userId - User ID
   * @param {Array} courseIds - Array of course IDs to check
   * @returns {Promise<boolean>} True if all courses are completed
   */
  async checkCourseCompletion(userId, courseIds) {
    try {
      console.log('Checking course completion for user:', userId, 'courses:', courseIds);
      
      const courseProgresses = await CourseProgress.find({
        user_id: userId,
        course_id: { $in: courseIds }
      });
      
      console.log('Found course progress records:', courseProgresses.length);
      
      for (const courseProgress of courseProgresses) {
        console.log(`Course ${courseProgress.course_id}: state=${courseProgress.state}, finished_at=${courseProgress.finished_at}`);
        
        const isCompleted = courseProgress.state === COURSE_PROGRESS_STATES.COMPLETED || 
                           !!courseProgress.finished_at;
        
        if (!isCompleted) {
          console.log(`Course ${courseProgress.course_id} not completed`);
          return false;
        }
      }
      
      // Check if we found progress for all required courses
      if (courseProgresses.length !== courseIds.length) {
        console.log(`Missing progress records. Found: ${courseProgresses.length}, Required: ${courseIds.length}`);
        return false;
      }
      
      console.log('All required courses completed');
      return true;
      
    } catch (error) {
      console.error('Error checking course completion:', error);
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
      console.log('Looking for certificate - User ID:', userId, 'Path ID:', pathId);
      
      const progress = await PathProgress.findOne({ 
        user_id: userId, 
        path_id: pathId 
      });
      
      console.log('Found progress record:', progress);
      
      if (!progress) {
        console.log('No progress record found');
        return null;
      }
      
      if (!progress.certificate) {
        console.log('No certificate in progress record');
        return null;
      }
      
      console.log('Certificate data from DB:', progress.certificate);
      
      const certificateData = {
        pdfUrl: progress.certificate.pdfUrl,
        pngUrl: progress.certificate.pngUrl,
        fileName: progress.certificate.fileName,
        generatedAt: progress.certificate.generatedAt,
        customUserName: progress.certificate.customUserName
      };
      
      console.log('Processed certificate data:', certificateData);
      
      // Check if certificate has valid data
      if (!certificateData.pdfUrl && !certificateData.pngUrl) {
        console.log('Certificate data is invalid (no URLs), returning null');
        return null;
      }
      
      return certificateData;
      
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