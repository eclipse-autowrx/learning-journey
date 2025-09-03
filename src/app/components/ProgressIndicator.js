// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client'

const ProgressIndicator = ({ steps = 5, completedSteps = 0, activeStep = 1 }) => {
    const renderStep = (stepIndex) => {
        const stepNumber = stepIndex + 1;
        const isCompleted = stepNumber <= completedSteps;
        const isActive = stepNumber === activeStep;
        const isPending = stepNumber > activeStep;

        return (
            <div key={stepIndex} className="flex items-center w-full m-0 p-0">
                {/* Step Circle */}
                <div className="w-4 h-4 m-0 p-0 rounded-full border-2 flex items-center justify-center" style={{
                    backgroundColor: isCompleted ? 'var(--progress-completed)' : 'transparent',
                    borderColor: isCompleted ? 'var(--progress-completed)' : isActive ? 'var(--progress-completed)' : 'var(--progress-line-inactive)'
                }}>
                    {/* Checkmark for completed steps */}
                    {isCompleted && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                    {/* Active step dot */}
                    {isActive && !isCompleted && (
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'var(--progress-completed)'}}></div>
                    )}
                    {/* Pending step dot */}
                    {isPending && (
                        <div className="w-2 h-2 rounded-full bg-transparent"></div>
                    )}
                </div>
                
                {/* Connecting Line */}
                {stepIndex < steps - 1 && (
                    <div className="w-[14px] h-0.5" style={{
                        backgroundColor: stepNumber <= completedSteps || (stepNumber === activeStep && stepNumber <= completedSteps + 1)
                            ? 'var(--progress-completed)' 
                            : 'var(--progress-line-inactive)'
                    }}></div>
                )}
            </div>
        );
    };

    return (
        <div className="flex items-center space-x-1">
            {Array.from({ length: steps }, (_, index) => renderStep(index))}
        </div>
    );
};

export default ProgressIndicator;
