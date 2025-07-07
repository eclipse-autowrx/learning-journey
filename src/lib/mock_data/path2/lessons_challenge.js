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
    },
    {
        slug: 'create_new_prototype',
        name: "Create New Prototype",
        description: "Guide to create a new prototype in the system",
        duration: "4 minutes",
        type: "interactive",
        sequence: {
            name: 'Sequence to create new prototype',
            description: 'This sequence walks the user through creating a new prototype step by step.',
            auto_run_next: true,
            auto_start: true,
            trigger_source: 'learning',
            actions: [
                {
                    name: 'Open Your Model',
                    path: `@[/model]:<css:.my_model_grid_item>[0]`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click to open model',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'location-match',
                        expectedValue: '/model/:model_id',
                    },
                    error_messeges: {
                        "path_not_found": "You have no models yet. Please create a model first."
                    }
                },
                {
                    name: 'Open Prototype Library',
                    path: `@[]:<dataid:tab-model-library>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to open Prototype Library',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: '@[]:<dataid:tab-model-library>',
                    },
                    error_messeges: {
                        "path_not_found": "Something went wrong."
                    }
                },
                {
                    name: 'Click Create New Prototype',
                    path: '@[]:<dataid:btn-create-new-prototype>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to Create a new prototype',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: '@[]:<dataid:btn-create-new-prototype>',
                    },
                    error_messeges: {
                        "path_not_found": "Create New Prototype button not found."
                    }
                },
                {
                    name: 'Enter Prototype Name',
                    path: '@[]:<dataid:prototype-name-input>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Enter a name for your new prototype',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'has-value',
                        expectedValue: '',
                        target_element_path: '@[]:<dataid:prototype-name-input>',
                    },
                    error_messeges: {
                        "path_not_found": "Prototype name input not found."
                    }
                },
                {
                    name: 'Select Prototype Language',
                    path: '@[]:<dataid:prototype-language-select>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Select a language for your prototype, prefer python for beginners',
                    delayBefore: 500,
                    delayAfter: 500,
                    error_messeges: {
                        "path_not_found": "Prototype language select not found."
                    }
                },
                {
                    name: 'Confirm Create Prototype',
                    path: '@[]:<dataid:btn-create-prototype>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to confirm and create your prototype',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: '@[]:<dataid:btn-create-prototype>',
                    },
                    error_messeges: {
                        "path_not_found": "Create Prototype button not found."
                    }
                }
            ],
        }
    },
    {
        slug: 'create_customer_journey',
        name: "Create Customer Journey",
        description: "Guide to create a customer journey",
        duration: "5 minutes",
        type: "interactive",
        sequence: {
            name: 'Sequence to create customer journey',
            description: 'This sequence walks the user through creating a customer journey step by step.',
            auto_run_next: true,
            auto_start: true,
            trigger_source: 'learning',
            actions: [
                // {
                //     name: 'Open Your Model',
                //     path: `@[/model]:<css:.my_model_grid_item>[0]`,
                //     actionType: 'show_tooltip',
                //     value: null,
                //     tooltipMessage: 'Click to open model',
                //     delayBefore: 500,
                //     delayAfter: 500,
                //     finish_condition: {
                //         type: 'location-match',
                //         expectedValue: '/model/:model_id',
                //     },
                //     error_messeges: {
                //         "path_not_found": "You have no models yet. Please create a model first."
                //     }
                // },
                // {
                //     name: 'Open Prototype Library',
                //     path: `@[]:<dataid:tab-model-library>`,
                //     actionType: 'show_tooltip',
                //     value: null,
                //     tooltipMessage: 'Click here to open Prototype Library',
                //     delayBefore: 500,
                //     delayAfter: 500,
                //     finish_condition: {
                //         type: 'element_clicked',
                //         expectedValue: '',
                //         target_element_path: '@[]:<dataid:tab-model-library>',
                //     },
                //     error_messeges: {
                //         "path_not_found": "Something went wrong."
                //     }
                // },
                // {
                //     name: 'Go to Prototype',
                //     path: `@[]:<css:.prototype-grid-item-wrapper[0]>`,
                //     actionType: 'show_tooltip',
                //     value: null,
                //     tooltipMessage: 'Click here to open the Prototype',
                //     delayBefore: 500,
                //     delayAfter: 500,
                //     finish_condition: {
                //         type: 'location-match',
                //         expectedValue: '/model/:model_id/library/prototype/:prototype_id/view',
                //     },
                // },
                // {
                //     name: 'Go to Customer Journey',
                //     path: `@[]:<dataid:prototype-overview-tab-customerJourney>`,
                //     actionType: 'show_tooltip',
                //     value: null,
                //     tooltipMessage: 'Click here to open Customer Journey',
                //     delayBefore: 500,
                //     delayAfter: 500,
                //     finish_condition: {
                //         type: 'element_clicked',
                //         expectedValue: '',
                //         target_element_path: `@[]:<dataid:prototype-overview-tab-customerJourney>`,
                //     },
                // },
                {
                    name: 'Click Edit Customer Journey',
                    path: '@[]:<dataid:prototype-edit-button>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to edit the Prototype',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: '@[]:<dataid:prototype-edit-button>',
                    },
                    error_messeges: {
                        "path_not_found": "Edit Prototype button not found."
                    }
                },
                {
                    name: 'Delete third Column',
                    path: '@[]:<css:.journey-edit-btn-delete-column[2]>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to delete the third column',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: { 
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: '@[]:<css:.journey-edit-btn-delete-column[2]>',
                    },
                    error_messeges: {
                        "path_not_found": "Delete third column button not found."
                    }
                },
                {
                    name: 'Delete second Column',
                    path: '@[]:<css:.journey-edit-btn-delete-column[1]>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to delete the second column',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: { 
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: '@[]:<css:.journey-edit-btn-delete-column[1]>',
                    },
                    error_messeges: {
                        "path_not_found": "Delete second column button not found."
                    }
                },
                {
                    name: 'Edit Step 1 What',
                    path: '@[]:<css:.journey-edit-content-cell-input[1]>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here and enter: "Driver open door"',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: { 
                        type: 'has-value',
                        expectedValue: 'Driver open door',
                        target_element_path: '@[]:<css.journey-edit-content-cell-input[1]>',
                    },
                },
                {
                    name: 'Edit Step 1 Touchpoints',
                    path: '@[]:<css:.journey-edit-content-cell-input[2]>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here and enter: "Driver door"',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: { 
                        type: 'has-value',
                        expectedValue: 'Driver door',
                        target_element_path: '@[]:<css.journey-edit-content-cell-input[2]>',
                    },
                },
                {
                    name: 'Add New Column',
                    path: '@[]:<dataid:journey-edit-add-column-btn>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to add a new column',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: { 
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: '@[]:<dataid:journey-edit-add-column-btn>',
                    },
                    error_messeges: {
                        "path_not_found": "Add new column button not found."
                    }
                },
                {
                    name: 'Edit Step 2 Who',
                    path: '@[]:<css:.journey-edit-content-cell-input[1]>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here and enter: "SDV QM App"',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: { 
                        type: 'has-value',
                        expectedValue: 'SDV QM App',
                        target_element_path: '@[]:<css.journey-edit-content-cell-input[1]>',
                    },
                },
                {
                    name: 'Edit Step 2 What',
                    path: '@[]:<css:.journey-edit-content-cell-input[3]>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here and enter: "Turn on ambient light"',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: { 
                        type: 'has-value',
                        expectedValue: 'Turn on ambient light',
                        target_element_path: '@[]:<css.journey-edit-content-cell-input[3]>',
                    },
                },
                {
                    name: 'Edit Step 2 Touchpoint',
                    path: '@[]:<css:.journey-edit-content-cell-input[5]>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here and enter: "Ambient light"',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: { 
                        type: 'has-value',
                        expectedValue: 'Ambient light',
                        target_element_path: '@[]:<css.journey-edit-content-cell-input[5]>',
                    },
                },
                {
                    name: 'Click Save Button',
                    path: '@[]:<dataid:prototype-save-button>',
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click the Save button to save your changes.',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: { 
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: '@[]:<dataid:prototype-save-button>',
                    },
                    error_messeges: {
                        "path_not_found": "Save button not found."
                    }
                },
            ]
        }
    }
]
