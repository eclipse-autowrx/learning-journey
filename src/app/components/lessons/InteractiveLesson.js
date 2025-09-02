// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client'

import { useEffect, useState } from "react"
import BtnFullRounded from "../atom/BtnFullRounded"
import { STATE_COMPLETED, STATE_IN_PROGRESS } from "@/lib/const";

/* Sample interactive lesson data
lesson = {
    slug: 'create_vehicle_model',
    name: "Create Vehicle Model",
    description: "Create a new vehicle model",
    duration: "3 minutes",
    type: "interactive",
    sequence: {
        name: 'Sequence to create new vehicle model',
        description: 'This sequence guides the user through the process of creating a new vehicle model',
        auto_run_next: true,
        trigger_source: 'learning',
        actions: [
            {
                name: 'Open Model Gallery',
                path: `@[/]:<dataid:btn-launch-vehicle-models>`,
                actionType: 'show_tooltip',
                value: null,
                tooltipMessage: 'Click here to launch the Model Gallery',
                delayBefore: 500,
                delayAfter: 500,
                finish_condition: {
                    type: 'location-match',
                    expectedValue: '/model',
                },
            },
            {
                name: 'Click on Create New Model',
                path: `@[]:<dataid:btn-open-form-create>`,
                actionType: 'show_tooltip',
                value: null,
                tooltipMessage: 'Click here to open the Create dialog',
                delayBefore: 500,
                delayAfter: 500,
                finish_condition: {
                    type: 'element_visible',
                    target_element_path: '@[]:<dataid:form-create-model>',
                    expectedValue: '',
                },
            },
            {
                name: 'Enter model name',
                path: `@[]:<dataid:form-create-model-input-name>`,
                actionType: 'show_tooltip',
                value: null,
                tooltipMessage: 'Enter the name of the new vehicle model',
                delayBefore: 500,
                delayAfter: 500,
                finish_condition: {
                    type: 'has-value',
                    target_element_path: '@[]:<dataid:form-create-model-input-name>',
                    expectedValue: '',
                },
            },
            {
                name: 'Select Vehicle API version',
                path: `@[]:<dataid:form-create-model-select-api>`,
                actionType: 'show_tooltip',
                value: null,
                tooltipMessage: 'Select the Vehicle API version if needed',
                delayBefore: 500,
                delayAfter: 2000
            },
            {
                name: 'Submit the form',
                path: `@[]:<dataid:form-create-model-btn-submit>`,
                actionType: 'show_tooltip',
                value: null,
                tooltipMessage: 'Click here to submit',
                delayBefore: 500,
                delayAfter: 200,
                finish_condition: {
                    type: 'element_clicked',
                    target_element_path: '@[]:<dataid:form-create-model-btn-submit>',
                    expectedValue: '',
                },
            },
        ],
    }
}

*/
const InteractiveLesson = ({ lesson, onCloseRequest, onSumbitLesson, showNextButton = true }) => {

    const [hasParentWindow, setHasParentWindow] = useState(window && window.parent && window.parent !== window)
    const [isSequenceFinished, setIsSequenceFinished] = useState(false)
    const [isCompleted, setIsCompleted] = useState(lesson?.state == STATE_COMPLETED)
    const [actions, setActions] = useState(lesson?.sequence?.actions || [])
    const [isSequenceRunning, setIsSequenceRunning] = useState(false)

    useEffect(() => {
        // console.log('lesson', lesson)
        if(lesson?.context?.state == STATE_COMPLETED) {
            let tmpActions = lesson?.sequence?.actions || []
            // get last record of lesson.context.progress.records
            let lastRecord = lesson.context.progress.records[lesson.context.progress.records.length - 1]
            if(lastRecord?.data.actions) {
                let lastActions = lastRecord.data.actions
                // console.log('lastActions', lastActions)
                for(let action of lastActions) {
                    let tmpAction = tmpActions.find(a => a.name == action.name)
                    if(tmpAction) {
                        tmpAction.status = action.status
                    }
                }
            }
            setActions(tmpActions)
            setIsCompleted(true)
            return
        }
        setActions(lesson?.sequence?.actions || [])
        setIsCompleted(false)
    }, [lesson])

    useEffect(() => {
        if (isCompleted) {
            setIsSequenceFinished(true)
        }
    }, [isCompleted])

    useEffect(() => {
        startListenMessage()
    }, [])

    const startSequence = async () => {
        setIsSequenceRunning(true)
        // console.log('startSequence')
        // console.log('lesson.sequence', lesson.sequence)
        let sequence = JSON.parse(JSON.stringify(lesson.sequence))
        for (let action of sequence.actions) {
            action.status = ''
        }
        let payload = {
            type: 'automation_control',
            cmd: 'run_sequence',
            sequence: sequence,
        }
        if (hasParentWindow) {
            window.parent.postMessage(payload, '*');
        }
    }

    const startListenMessage = () => {
        window.addEventListener('message', (event) => {
            // console.log('message', event)
            try {
                let payload = JSON.parse(event.data)
                // console.log('received payload', payload)
                if (payload.cmd === 'update-from-host') {
                    handleUpdateFromHost(payload)
                }
            } catch (e) { }
        })
    }

    const handleUpdateFromHost = (data) => {
        if (data.isShowedAutomationControl == false) {
            console.log('hide automation control')
            let sequence = data.automationSequence
            if (sequence && sequence.actions && sequence.actions.length > 0) {
                let _actions = [...actions]
                for (let action of sequence.actions) {
                    let _action = _actions.find(a => a.name == action.name)
                    if (_action) {
                        _action.status = action.status
                    }
                }
                setActions(_actions)
                const lastAction = sequence.actions[sequence.actions.length - 1];
                if (lastAction.status == 'finished') {
                    if (!isSequenceFinished) {
                        setIsSequenceRunning(false)
                        setIsSequenceFinished(true)
                        onSumbitLesson({
                            actions: sequence.actions.map(a => {
                                return {
                                    name: a.name,
                                    status: a.status
                                }
                            })
                        })
                    }
                }
            }
        }

    }

    return <div className="w-full py-2 px-2 lg:px-4">
        {/* <div className="my-2">
            <div className="text-xl font-bold text-black">{lesson.name}</div>
            <div className="mt-0 text-gray-500 text-sm leading-tight">{lesson.description}</div>
        </div> */}
        {lesson.sequence && <>
            <div className="text-xl font-bold text-neutral-900">{lesson.sequence.name}</div>
            <div className="mt-0 text-neutral-500 text-base leading-tight">{lesson.sequence.description}</div>
            <div className="mt-4 bg-white">
                <div className="text-lg text-neutral-500">Actions you need to perform:</div>
                {Array.isArray(actions) && actions.map((action, index) => {
                    return <div key={index} className="w-full px-2 py-1">
                        <div className="w-full flex items-center">
                            <span className="flex w-6 items-center justify-center">
                                {action.status == 'finished' && <img src="/imgs/bare/icon_checked.svg" className="w-5 h-5 mr-2 align-middle" />}
                                {action.status !== 'finished' && <span className="inline-block w-2 h-2 rounded-full bg-neutral-400 mr-2 align-middle"></span>}
                            </span>
                            {action.name}
                        </div>
                    </div>
                })}
            </div>

            <div className="mt-4 flex justify-end space-x-4">
                <BtnFullRounded
                    onClick={() => {
                        startSequence()
                    }}>
                    {isSequenceFinished ? 'Restart' : 'Start'}
                </BtnFullRounded>

                {(isCompleted || isSequenceFinished) && showNextButton && <BtnFullRounded
                    onClick={() => {
                        onCloseRequest()
                    }}>
                    Next Lesson
                </BtnFullRounded>}
            </div>

            {lesson.context && <div className="mt-4 space-x-4">
                <div className="flex items-center">
                    <span className="text-neutral-500 text-sm w-20">Finished at:</span>
                    <span className="text-neutral-500 text-sm" >
                        {new Date(lesson.context?.progress?.finished_at).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }).replace(',', '')}
                    </span>
                </div>

                {/* <div className="text-gray-500 text-sm">Learning History</div>
                {Array.isArray(lesson.context?.progress?.records) && lesson.context?.progress?.records.map((record, index) => {
                    return <div key={index} className="text-gray-500 text-sm">
                        <span className="text-gray-500 text-sm w-[200px]"  >
                            {new Date(record.at).toLocaleString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }).replace(',', '')}
                        </span>
                        <span className="text-gray-500 text-sm w-20" >
                            {record.action}
                        </span>
                    </div>
                })} */}
            </div>}
        </>
        }

    </div>
}

export default InteractiveLesson