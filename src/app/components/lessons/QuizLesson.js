'use client';

import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function QuizLesson({ lesson, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showExplanations, setShowExplanations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = lesson.quiz_questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    // Check if user has already completed this quiz
    const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '{}');
    if (completedQuizzes[lesson.slug]) {
      setShowResults(true);
      setScore(completedQuizzes[lesson.slug].score);
      setUserAnswers(completedQuizzes[lesson.slug].answers);
    }
  }, [lesson.slug]);

  const handleAnswerSelect = (answer) => {
    if (showResults) return; // Don't allow changes after submission

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleMultipleChoiceSelect = (selectedOption) => {
    if (showResults) return;

    const currentAnswers = userAnswers[currentQuestionIndex] || [];
    let newAnswers;

    if (currentQuestion.question_type === 'multiple_choice') {
      // For multiple choice, toggle the selected option
      if (currentAnswers.includes(selectedOption)) {
        newAnswers = currentAnswers.filter(ans => ans !== selectedOption);
      } else {
        newAnswers = [...currentAnswers, selectedOption];
      }
    } else {
      // For single choice, replace the answer
      newAnswers = [selectedOption];
    }

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: newAnswers
    }));
  };

  const handleTrueFalseSelect = (value) => {
    if (showResults) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
  };

  const handleFillBlankSubmit = (value) => {
    if (showResults) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
  };

  const handleEssaySubmit = (value) => {
    if (showResults) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    let totalPoints = 0;

    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (!userAnswer) return;

      totalPoints += question.points || 1;

      switch (question.question_type) {
        case 'single_choice':
        case 'multiple_choice':
          const correctOptions = question.options
            .filter(opt => opt.is_correct)
            .map(opt => opt.text);
          
          if (Array.isArray(userAnswer)) {
            if (userAnswer.length === correctOptions.length &&
                userAnswer.every(ans => correctOptions.includes(ans))) {
              correctAnswers += question.points || 1;
            }
          }
          break;

        case 'true_false':
          if (userAnswer === question.correct_answer) {
            correctAnswers += question.points || 1;
          }
          break;

        case 'fill_blank':
          const isCorrect = question.correct_answers.some(correct => 
            question.case_sensitive 
              ? userAnswer === correct
              : userAnswer.toLowerCase() === correct.toLowerCase()
          );
          if (isCorrect) {
            correctAnswers += question.points || 1;
          }
          break;

        case 'essay':
          // Essay questions typically need manual grading
          // For now, give partial credit if answer is provided
          if (userAnswer && userAnswer.trim().length > 0) {
            correctAnswers += (question.points || 1) * 0.5;
          }
          break;
      }
    });

    return { correctAnswers, totalPoints };
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    
    const { correctAnswers, totalPoints } = calculateScore();
    const finalScore = Math.round((correctAnswers / totalPoints) * 100);
    
    setScore(finalScore);
    setShowResults(true);
    setAttempts(prev => prev + 1);

    // Save completion to localStorage
    const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '{}');
    completedQuizzes[lesson.slug] = {
      score: finalScore,
      answers: userAnswers,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));

    // Check if passed
    const passed = finalScore >= (lesson.passing_score || 70);
    
    if (passed && onComplete) {
      onComplete(lesson.slug);
    }

    setIsSubmitting(false);
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.question_type) {
      case 'single_choice':
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = userAnswers[currentQuestionIndex]?.includes(option.text);
              const isCorrect = option.is_correct;
              const showCorrect = showResults && isCorrect;
              const showIncorrect = showResults && isSelected && !isCorrect;

              return (
                <label
                  key={optionIndex}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? showResults
                        ? showCorrect
                          ? 'bg-green-50 border-green-500'
                          : showIncorrect
                          ? 'bg-red-50 border-red-500'
                          : 'bg-blue-50 border-blue-500'
                        : 'bg-blue-50 border-blue-500'
                      : showCorrect
                      ? 'bg-green-50 border-green-500'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type={currentQuestion.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                    name={`question-${currentQuestionIndex}`}
                    value={option.text}
                    checked={isSelected}
                    onChange={() => handleMultipleChoiceSelect(option.text)}
                    disabled={showResults}
                    className="mr-3"
                  />
                  <span className="flex-1">{option.text}</span>
                  {showResults && (
                    <span className="ml-2">
                      {showCorrect && <FaCheck className="text-green-600" />}
                      {showIncorrect && <FaTimes className="text-red-600" />}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            {[true, false].map((value) => {
              const isSelected = userAnswers[currentQuestionIndex] === value;
              const isCorrect = value === currentQuestion.correct_answer;
              const showCorrect = showResults && isCorrect;
              const showIncorrect = showResults && isSelected && !isCorrect;

              return (
                <label
                  key={value}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? showResults
                        ? showCorrect
                          ? 'bg-green-50 border-green-500'
                          : showIncorrect
                          ? 'bg-red-50 border-red-500'
                          : 'bg-blue-50 border-blue-500'
                        : 'bg-blue-50 border-blue-500'
                      : showCorrect
                      ? 'bg-green-50 border-green-500'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={value}
                    checked={isSelected}
                    onChange={() => handleTrueFalseSelect(value)}
                    disabled={showResults}
                    className="mr-3"
                  />
                  <span className="flex-1">{value ? 'True' : 'False'}</span>
                  {showResults && (
                    <span className="ml-2">
                      {showCorrect && <FaCheck className="text-green-600" />}
                      {showIncorrect && <FaTimes className="text-red-600" />}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        );

      case 'fill_blank':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={userAnswers[currentQuestionIndex] || ''}
              onChange={(e) => handleFillBlankSubmit(e.target.value)}
              disabled={showResults}
              placeholder="Enter your answer..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {showResults && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Correct answers: {currentQuestion.correct_answers.join(', ')}
                </p>
              </div>
            )}
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-3">
            <textarea
              value={userAnswers[currentQuestionIndex] || ''}
              onChange={(e) => handleEssaySubmit(e.target.value)}
              disabled={showResults}
              placeholder="Write your answer here..."
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {currentQuestion.essay_guidelines && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">{currentQuestion.essay_guidelines}</p>
              </div>
            )}
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-600">No questions available for this quiz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Quiz Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.name}</h1>
          <p className="text-gray-600 mb-4">{lesson.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Questions: {questions.length}</span>
              <span>Passing Score: {lesson.passing_score || 70}%</span>
              <span>Attempts: {attempts}</span>
            </div>
            {showResults && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                score >= (lesson.passing_score || 70)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                Score: {score}%
              </div>
            )}
          </div>
        </div>

        {!showResults ? (
          <>
            {/* Question Navigation */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="flex space-x-1">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 rounded-full text-xs font-medium ${
                        index === currentQuestionIndex
                          ? 'bg-blue-500 text-white'
                          : userAnswers[index]
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Question */}
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {currentQuestion.question}
                </h2>
                {renderQuestion()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex space-x-2">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting || Object.keys(userAnswers).length < questions.length}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Results View */
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Results</h2>
              <div className={`text-4xl font-bold mb-4 ${
                score >= (lesson.passing_score || 70)
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {score}%
              </div>
              <p className={`text-lg ${
                score >= (lesson.passing_score || 70)
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {score >= (lesson.passing_score || 70) ? 'Congratulations! You passed!' : 'Keep trying! You can do better!'}
              </p>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Question {index + 1}: {question.question}
                  </h3>
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">
                      Your answer: {Array.isArray(userAnswers[index]) ? userAnswers[index].join(', ') : userAnswers[index] || 'Not answered'}
                    </p>
                  </div>
                  {showExplanations && question.options?.find(opt => opt.explanation) && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {question.options.find(opt => opt.is_correct)?.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setShowExplanations(!showExplanations)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {showExplanations ? <FaEyeSlash /> : <FaEye />}
                <span>{showExplanations ? 'Hide' : 'Show'} Explanations</span>
              </button>

              {score < (lesson.passing_score || 70) && attempts < (lesson.max_attempts || 3) && (
                <button
                  onClick={() => {
                    setShowResults(false);
                    setUserAnswers({});
                    setCurrentQuestionIndex(0);
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}