// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

export const saveStateCourseStarted = async (course) => {
    if(!course || !course._id) return null
    try {

        let payload = course.progress || {
            course_id: course._id,
            data: {},
            lessons: {}
        }

        payload.state = "in_progress"
        const res = await fetch(`/api/progress/courses/${course._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to update lesson state");
        }
        return await res.json();
    } catch (err) {
        console.error("Error saving lesson finish state:", err);
        return null;
    }
}

export const saveStateCourseCompleted = async (course) => {
    if(!course || !course._id) return null
    try {

        let payload = course.progress || {
            course_id: course._id,
            data: {},
            lessons: {}
        }

        payload.state = "completed"
        payload.finished_at = new Date()
        const res = await fetch(`/api/progress/courses/${course._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to update lesson state");
        }
        return await res.json();
    } catch (err) {
        console.error("Error saving lesson finish state:", err);
        return null;
    }
}

