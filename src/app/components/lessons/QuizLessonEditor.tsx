// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { useState, useMemo } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface Answer {
  label: string;
  is_correct?: boolean;
}

interface Question {
  question: string;
  answers: Answer[];
}

interface QuizLessonEditorProps {
  value: {
    quiz_questions?: Question[];
  };
  onChange: (value: any) => void;
}

interface ValidationErrors {
  [qIndex: number]: {
    question?: string;
    answers?: { [aIndex: number]: string };
    noCorrectAnswer?: string;
    noAnswers?: string;
  };
}

export default function QuizLessonEditor({ value, onChange }: QuizLessonEditorProps) {
  const [viewMode, setViewMode] = useState<'editor' | 'json'>('editor');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [jsonViewText, setJsonViewText] = useState(() => JSON.stringify(value.quiz_questions || [], null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const questions = value.quiz_questions || [];

  const errors: ValidationErrors = useMemo(() => {
    const newErrors: ValidationErrors = {};
    questions.forEach((q, qIndex) => {
      const questionErrors: ValidationErrors[number] = {};
      
      if (!q.question.trim()) {
        questionErrors.question = 'Question cannot be empty.';
      }
      
      if (!q.answers || q.answers.length === 0) {
        questionErrors.noAnswers = 'At least one answer is required.';
      } else {
        const answerErrors: { [aIndex: number]: string } = {};
        let hasCorrect = false;
        
        q.answers.forEach((ans, aIndex) => {
          if (!ans.label.trim()) {
            answerErrors[aIndex] = 'Answer cannot be empty.';
          }
          if (ans.is_correct) {
            hasCorrect = true;
          }
        });

        if (Object.keys(answerErrors).length > 0) {
          questionErrors.answers = answerErrors;
        }

        if (!hasCorrect) {
          questionErrors.noCorrectAnswer = 'One answer must be marked as correct.';
        }
      }

      if (Object.keys(questionErrors).length > 0) {
        newErrors[qIndex] = questionErrors;
      }
    });
    return newErrors;
  }, [questions]);

  const updateQuestions = (newQuestions: Question[]) => {
    onChange({ ...value, quiz_questions: newQuestions });
  };

  const handleQuestionChange = (qIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].question = text;
    updateQuestions(newQuestions);
  };

  const handleDeleteQuestion = (qIndex: number) => {
    const newQuestions = questions.filter((_, index) => index !== qIndex);
    // Adjust active index if the deleted question was the last one or before the current active one
    if (activeQuestionIndex >= newQuestions.length && newQuestions.length > 0) {
      setActiveQuestionIndex(newQuestions.length - 1);
    } else if (activeQuestionIndex > qIndex) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
    updateQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    const newQuestions = [...questions, { question: '', answers: [{ label: '', is_correct: true }] }];
    updateQuestions(newQuestions);
    setActiveQuestionIndex(newQuestions.length - 1);
  };

  const handleAnswerChange = (qIndex: number, aIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers[aIndex].label = text;
    updateQuestions(newQuestions);
  };
  
  const handleCorrectAnswerChange = (qIndex: number, aIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers.forEach((ans, index) => {
      ans.is_correct = index === aIndex;
    });
    updateQuestions(newQuestions);
  };
  
  const handleDeleteAnswer = (qIndex: number, aIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];
    const wasCorrect = question.answers[aIndex]?.is_correct;
    question.answers = question.answers.filter((_, index) => index !== aIndex);
    
    // If the deleted answer was the correct one, make the first answer correct
    if (wasCorrect && question.answers.length > 0) {
      question.answers[0].is_correct = true;
    }

    updateQuestions(newQuestions);
  };

  const handleAddAnswer = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers.push({ label: '', is_correct: false });
    updateQuestions(newQuestions);
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonViewText(text);
    try {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
            setJsonError('JSON must be an array of questions.');
            return;
        }
        updateQuestions(parsed);
        setJsonError(null);
    } catch (e: any) {
        setJsonError(`Invalid JSON: ${e.message}`);
    }
  };

  const handleSwitchToJSON = () => {
    setJsonViewText(JSON.stringify(questions, null, 2));
    setJsonError(null);
    setViewMode('json');
  };

  const activeQuestion = questions[activeQuestionIndex];
  const activeQuestionErrors = errors[activeQuestionIndex] || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center border-b border-gray-200">
          <button
              onClick={() => setViewMode('editor')}
              className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                  viewMode === 'editor'
                  ? 'bg-white border-gray-200 border-t border-l border-r -mb-px'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
          >
              Editor
          </button>
          <button
              onClick={handleSwitchToJSON}
              className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                  viewMode === 'json'
                  ? 'bg-white border-gray-200 border-t border-l border-r -mb-px'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
          >
              JSON
          </button>
      </div>

      {viewMode === 'json' && (
        <div className="p-4 border border-gray-200 rounded-lg space-y-2 bg-gray-50 border-t-0 rounded-t-none">
          <label className="block text-sm font-medium text-gray-700">Raw JSON</label>
          <textarea
            rows={10}
            className={`block w-full border rounded-md px-3 py-2 text-sm font-mono bg-white ${jsonError ? 'border-red-500' : 'border-gray-300'}`}
            value={jsonViewText}
            onChange={handleJsonChange}
            placeholder="Enter quiz questions in JSON format..."
            style={{ minHeight: '500px' }}
          />
          {jsonError && <p className="text-xs text-red-600 mt-1">{jsonError}</p>}
        </div>
      )}

      {viewMode === 'editor' && (
        <div>
          <div className="flex items-center border-b border-gray-200">
            <div className="flex-grow flex space-x-1">
              {questions.map((_, index) => {
                const hasError = !!Object.keys(errors[index] || {}).length;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveQuestionIndex(index)}
                    className={`relative px-3 py-2 text-sm font-medium rounded-t-md ${
                      activeQuestionIndex === index
                        ? 'bg-white border-gray-200 border-t border-l border-r -mb-px'
                        : 'bg-gray-50 hover:bg-gray-100'
                    } ${hasError ? 'text-red-600' : ''}`}
                  >
                    Q{index + 1}
                    {hasError && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>}
                  </button>
                )
              })}
            </div>
            <button
              onClick={handleAddQuestion}
              className="flex items-center px-3 py-1.5 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ml-2"
            >
              <FaPlus />
            </button>
          </div>

          {activeQuestion ? (
            <div className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50 border-t-0 rounded-t-none">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Question {activeQuestionIndex + 1}</label>
                <button onClick={() => handleDeleteQuestion(activeQuestionIndex)} className="text-red-500 hover:text-red-700">
                  <FaTrash />
                </button>
              </div>
              <textarea
                rows={2}
                className={`block w-full border rounded-md px-3 py-2 text-sm bg-white ${activeQuestionErrors.question ? 'border-red-500' : 'border-gray-300'}`}
                value={activeQuestion.question}
                onChange={(e) => handleQuestionChange(activeQuestionIndex, e.target.value)}
                placeholder="Enter your question here..."
              />
              {activeQuestionErrors.question && <p className="text-xs text-red-600 mt-1">{activeQuestionErrors.question}</p>}
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">Answers</label>
                {activeQuestion.answers.length === 0 && activeQuestionErrors.noAnswers && (
                  <p className="text-xs text-red-600 mt-1">{activeQuestionErrors.noAnswers}</p>
                )}
                {activeQuestion.answers.map((ans, aIndex) => {
                  const answerError = activeQuestionErrors.answers?.[aIndex];
                  return (
                    <div key={aIndex}>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct-answer-${activeQuestionIndex}`}
                          checked={ans.is_correct === true}
                          onChange={() => handleCorrectAnswerChange(activeQuestionIndex, aIndex)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <input
                          type="text"
                          className={`block w-full border rounded-md px-3 py-2 text-sm bg-white ${answerError ? 'border-red-500' : 'border-gray-300'}`}
                          value={ans.label}
                          onChange={(e) => handleAnswerChange(activeQuestionIndex, aIndex, e.target.value)}
                          placeholder={`Answer ${aIndex + 1}`}
                        />
                        <button onClick={() => handleDeleteAnswer(activeQuestionIndex, aIndex)} className="text-red-500 hover:text-red-700">
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                      {answerError && <p className="text-xs text-red-600 mt-1 ml-6">{answerError}</p>}
                    </div>
                  )
                })}
              </div>

              {activeQuestionErrors.noCorrectAnswer && (
                <p className="text-xs text-red-600 mt-1">{activeQuestionErrors.noCorrectAnswer}</p>
              )}

              <button
                onClick={() => handleAddAnswer(activeQuestionIndex)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <FaPlus className="mr-2" /> Add Answer
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No questions yet. Add one to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
