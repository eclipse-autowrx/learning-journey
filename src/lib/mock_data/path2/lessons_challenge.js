export const lessons_challenge = [
    {
        slug: 'challenge_introduction',
        name: "Challenge Introduction",
        description: "Introduction to the challenge",
        duration: "1 minutes",
        type: "text-markdown",
        markdown_content: `
# Introduction

In this challenge, you will be building a prototype to get a certificate.

> **Note:**  
Below are interactive lessons. In each lesson, you will see tooltips on the playground guiding you step by step.  
Follow the instructions on the tooltips to perform each action yourself.  
Each lesson consists of a sequence of actions. The number and status of actions will be displayed at the bottom of the page.


You will  go step by step to create:
- A new vehicle model
- A new prototype
- Define a customer journey
- Python app to utilize vehicle APIs to control the vehicle
- A dashboard to present the prototype
- Execute the prototype with runtime
`
    },
    {
        slug: 'create_vehicle_model',
        name: "Create Vehicle Model",
        description: "Create a new vehicle model",
        duration: "3 minutes",
        type: "interactive",
        sequence: {
            name: 'Sequence to create new vehicle model',
            description: 'This sequence guides the user through the process of creating a new vehicle model',
            auto_run_next: true,
            auto_start: true,
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
]
