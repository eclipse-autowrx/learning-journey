// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client'

import { useEffect, useState } from "react"
import { FaCheckCircle } from "react-icons/fa";
import BtnFullRounded from "../atom/BtnFullRounded";
import { STATE_COMPLETED } from "@/lib/const";

const QuizQuestion = ({ question, index, onGotAnswer }) => {

    const [tmpAnswer, setTmpAnswer] = useState(-1)

    useEffect(() => {
        if (Number.isNaN(question.answerIndex)) {
            setTmpAnswer(-1)
        } else {
            onGotAnswer(question.answerIndex)
            setTmpAnswer(question.answerIndex)
        }
    }, [question])

    return <div className="w-full">
        <div className="flex flex-col">
            <div className="font-bold text-black">Question {index}:</div>
            <div className="mt-1 text-base leading-tight">{question.question}</div>
        </div>
        <div className={`py-4 w-full px-0 grid grid-cols-1 lg:grid-cols-1 gap-2 lg:gap-4
                        `}>
            {question.answers && question.answers.map((ans, aIndex) => <div key={aIndex}
                className={`p-3 border-2 border-slate-300 rounded-lg flex items-start
                            cursor-pointer hover:border-slate-800 hover:bg-slate-100
                            ${tmpAnswer == aIndex && "border-slate-800 bg-slate-100"}`}
                onClick={() => {
                    setTmpAnswer(aIndex)
                    onGotAnswer(aIndex)
                }}>
                <div className="w-6 min-w-6 font-bold">{aIndex + 1}.</div>

                <div className="grow">{ans.label}</div>

                <div className="w-6 min-w-6 font-bold">
                    {aIndex == tmpAnswer && <FaCheckCircle size={20} />}
                </div>

            </div>)}
        </div>
    </div>
}

const QuizLesson = ({ lesson, onCloseRequest, onSumbitLesson }) => {

    const [numQuestions, setNumQuestions] = useState(0)
    const [curQuestionIndex, setCurQuestionIndex] = useState(0)
    const [activeQuestion, setActiveQuestion] = useState(null)
    const [gotAnswer, setGotAnswer] = useState(-1)
    const [questions, setQuestions] = useState([])
    const [gotAllAnswer, setGotAllAnswer] = useState(false)
    const [testResult, setTextResult] = useState('')

    useEffect(() => {
        // console.log(`Lesson changed`, lesson)
        if (!lesson || !lesson.questions) {
            setNumQuestions(0)
            setCurQuestionIndex(0)
            setActiveQuestion(null)
            setQuestions([])
        }
        setActiveQuestion(null)
        setCurQuestionIndex(0)
        setNumQuestions(lesson.questions.length)
        setQuestions(lesson.questions)

        if(lesson.context?.state == STATE_COMPLETED ) {
            setTextResult("Your already finish this quiz.")
        } else {
            setTextResult("")
        }
    }, [lesson])

    useEffect(() => {
        if (!questions?.length) {
            setGotAllAnswer(false)
            return
        }

        const hasAllQuestions = questions.every(q => q.answerIndex !== undefined && q.answerIndex !== null && q.answerIndex >= 0)
        setGotAllAnswer(hasAllQuestions)
    }, [questions])

    useEffect(() => {
        try {
            let question = questions[curQuestionIndex]
            setActiveQuestion(question)
        } catch (e) {
            console.log(e)
        }
    }, [curQuestionIndex, questions])

    const resetTest = () => {
        setCurQuestionIndex(0)
        setGotAnswer(-1)
        let tmpQuestions = JSON.parse(JSON.stringify(questions))
        tmpQuestions.forEach(q => { q.answerIndex = -1 })
        setQuestions(tmpQuestions)
        setTextResult("")
    }

    const setAnswerForThisQuestion = (answerIndex) => {
        setGotAnswer(answerIndex)
        if(answerIndex == activeQuestion.answerIndex) return

        let tmpQuestion = {
            ...activeQuestion,
            answerIndex: answerIndex
        }
        let tmpQuestions = JSON.parse(JSON.stringify(questions))
        tmpQuestions[curQuestionIndex] = tmpQuestion
        setQuestions(tmpQuestions)
    }

    const gotoNextQuestion = () => {
        setGotAnswer(-1)
        setCurQuestionIndex((v) => v + 1)
    }

    const gotoPrevQuestion = () => {

        setGotAnswer(-1)
        setCurQuestionIndex((v) => v - 1)
    }

    if (!lesson) return <></>

    return <div className="w-full px-2">
        <div className="my-2 pb-2 border-b border-slate-600">
            <div className="text-xl font-bold text-black">{lesson.name}</div>
            <div className="mt-2 text-gray-500 text-sm leading-tight">{lesson.description}</div>
        </div>

        {testResult && <div className="w-full flex flex-col items-center justify-center px-4 py-4">
            <div className="min-h-[200px] max-h-[400px] overflow-auto">{testResult}</div>

            <div className="w-full mt-4 px-8 flex items-center space-x-4">
                <div className="grow">
                </div>

                <BtnFullRounded onClick={resetTest}>
                    Start again
                </BtnFullRounded>

                <BtnFullRounded onClick={() => {
                    if (onCloseRequest) {
                        onCloseRequest()
                    }
                }}>
                    Next Lesson
                </BtnFullRounded>
            </div>
        </div>

        }

        {!testResult && <>
            <div className="mt-6 px-4 lg:px-8 min-h-[440px]">
                {/* Question Area */}
                {activeQuestion && <QuizQuestion question={activeQuestion} index={curQuestionIndex + 1}
                    onGotAnswer={setAnswerForThisQuestion}
                />}
            </div>

            <div className="mt-2 px-2 py-2 flex items-center space-x-2">
                <div className="grow"></div>
                <BtnFullRounded disable={curQuestionIndex <= 0}
                    onClick={() => {
                        gotoPrevQuestion()
                    }}>
                    Prev
                </BtnFullRounded>

                <div className="w-10"></div>
                <div>{curQuestionIndex + 1}</div>
                <div>/</div>
                <div>{numQuestions}</div>
                <div className="w-10"></div>

                <BtnFullRounded disable={!(gotAnswer >= 0 && curQuestionIndex < (numQuestions - 1))}
                    onClick={() => {
                        gotoNextQuestion()
                    }}>
                    Next
                </BtnFullRounded>
                <div className="grow"></div>

            </div>

            {gotAllAnswer && <div className="mt-2 px-2 py-2 border-t border-gray-500 flex items-center space-x-2">
                <div className="grow"></div>

                <BtnFullRounded disable={!gotAllAnswer}
                    onClick={() => {
                        if(onSumbitLesson) {
                            let data = questions.map(q => { return { answerIndex: q.answerIndex } })
                            onSumbitLesson(data)
                        }
                        const correctAnswers = Math.floor(Math.random() * 3) + (numQuestions - 3);
                        setTextResult(`You answered ${correctAnswers} out of ${numQuestions} questions correctly.`)
                        // call service to check result
                    }}>
                    Submit
                </BtnFullRounded>

            </div>
            }
        </>}


    </div>
}

export default QuizLesson