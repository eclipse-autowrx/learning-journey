// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

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
                {
                    name: 'Go to Customer Journey',
                    path: `@[]:<dataid:prototype-overview-tab-customerJourney>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to open Customer Journey',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: `@[]:<dataid:prototype-overview-tab-customerJourney>`,
                    },
                },
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
    },
    {
        slug: 'collect-requirements',
        name: "Collect Requirements",
        description: "Guide to collect requirements",
        duration: "5 minutes",
        type: "interactive",
        sequence: {
            name: 'Sequence to collect requirements',
            description: 'This sequence walks the user through collecting requirements step by step.',
            auto_run_next: true,
            auto_start: true,
            trigger_source: 'learning',
            actions: [
                {
                    name: 'Go to Requirements',
                    path: `@[]:<dataid:prototype-overview-tab-requirement>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to open Requirements',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: `@[]:<dataid:prototype-overview-tab-requirement>`,
                    },
                },
                {
                    name: 'Click Run new Scan',
                    path: `@[]:<dataid:btn-run-new-scan>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to run a new scan',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: `@[]:<dataid:btn-run-new-scan>`,
                    },
                    error_messeges: {
                        "path_not_found": "Run new scan button not found."
                    }
                }
            ]
        }
    },
    {
        slug: 'write-python-app',
        name: "Write Python App",
        description: "Guide to write a python app",
        duration: "5 minutes",
        type: "interactive",
        sequence: {
            name: 'Sequence to write python app',
            description: 'This sequence walks the user through writing a python app step by step.',
            auto_run_next: true,
            auto_start: true,
            trigger_source: 'learning',
            actions: [
                {
                    name: 'Go to Python App',
                    path: `@[]:<dataid:tab-code>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to open Python App',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: `@[]:<dataid:tab-code>`,
                    },
                    error_messeges: {
                        "path_not_found": "Python App tab not found."
                    }
                },
                {
                    name: 'Remove placeholder code',
                    path: `@[]:<css:.line-numbers[16]>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Delete call code inside while loop',
                    delayBefore: 500,
                    delayAfter: 500,
                },
                {
                    name: 'Open all signals',
                    path: `@[]:<dataid:all-signals-tab>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to open all signals',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: `@[]:<dataid:all-signals-tab>`,
                    },
                    error_messeges: {
                        "path_not_found": "All signals tab not found."
                    }
                },
                {
                    name: 'Search for signal',
                    path: `@[]:<dataid:search-signal-input>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Enter "Door" in the search input',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: `@[]:<dataid:search-signal-input>`,
                    },
                    error_messeges: {
                        "path_not_found": "Search signal input not found."
                    }
                },
                {
                    name: 'Select signal',
                    path: `@[]:<css:.signal-list-item-name[5]>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click on signal IsOpen',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: `@[]:<css:.signal-list-item-name[5]>`,
                    },
                    error_messeges: {
                        "path_not_found": "Signal not found."
                    }
                },
                {
                    name: 'Copy code',
                    path: `@[]:<css:.btn-copy-get-code>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to Copy code snippet',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: `@[]:<css:.btn-copy-get-code>`,
                    },
                    error_messeges: {
                        "path_not_found": "Copy code snippet button not found."
                    }
                },
                {
                    name: 'Paste copied code here',
                    path: `@[]:<css:.line-numbers[17]>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Paste copied code here',
                    delayBefore: 500,
                    delayAfter: 500,
                },
                {
                    name: 'Search for signal',
                    path: `@[]:<dataid:search-signal-input>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Enter "Ambient" in the search input',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: `@[]:<dataid:search-signal-input>`,
                    },
                    error_messeges: {
                        "path_not_found": "Search signal input not found."
                    }
                },
                {
                    name: 'Select signal',
                    path: `@[]:<css:.signal-list-item-name[6]>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click on signal IsOpen',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: `@[]:<css:.signal-list-item-name[6]>`,
                    },
                    error_messeges: {
                        "path_not_found": "Signal not found."
                    }
                },
                {
                    name: 'Copy code',
                    path: `@[]:<css:.btn-copy-set-code>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to Copy code snippet',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: `@[]:<css:.btn-copy-set-code>`,
                    },
                    error_messeges: {
                        "path_not_found": "Copy code snippet button not found."
                    }
                },
                {
                    name: 'Paste copied code here',
                    path: `@[]:<css:.line-numbers[18]>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Paste copied code here',
                    delayBefore: 500,
                    delayAfter: 500,
                },
                {
                    name: 'Save code',
                    path: `@[]:<css:.line-numbers[16]`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Base on these two API, write turn on ambient light when door is opened',
                    delayBefore: 500,
                    delayAfter: 500,
                }
            ],
        }
    },
    {
        slug: 'design-dashboard',
        name: "Configure Dashboard",
        description: "Guide to configure a dashboard",
        duration: "5 minutes",
        type: "interactive",
        sequence: {
            name: 'Sequence to configure dashboard',
            description: 'This sequence walks the user through configuring a dashboard step by step.',
            auto_run_next: true,
            auto_start: true,
            trigger_source: 'learning',
            actions: [
                {
                    name: 'Go to Dashboard',
                    path: `@[]:<dataid:tab-dashboard>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to open Dashboard',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: '',
                        target_element_path: `@[]:<dataid:tab-dashboard>`,
                    },
                    error_messeges: {
                        "path_not_found": "Dashboard tab not found."
                    }
                },
                {
                    name: 'Enter Dashboard Edit Mode',
                    path: `@[]:<dataid:dashboard-edit-button>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click to enter Dashboard Edit Mode',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: null,
                        target_element_path: '@[]:<dataid:dashboard-edit-button>',
                    },
                    error_messeges: {
                        "element_not_found": "Some thing went wrong. Dashboard Edit button not found."
                    }
                },
                {
                    name: 'Delete all widgets',
                    path: `@[]:<dataid:dashboard-delete-all-widgets>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Delete all widgets',
                    delayBefore: 500,
                    delayAfter: 500,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: null,
                        target_element_path: '@[]:<dataid:dashboard-delete-all-widgets>',
                    },
                    error_messeges: {
                        "element_not_found": "Some thing went wrong. Dashboard Delete all widgets button not found."
                    }
                },
                {
                    name: 'Pick cells to place widget',
                    path: `@[]:<css:.widget-grid-cell-empty[0]>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Pick cells to place widget',
                    delayBefore: 200,
                    delayAfter: 200,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: null,
                        target_element_path: '@[]:<css:.widget-grid-cell-empty[0]>',
                    },
                    error_messeges: {
                        "element_not_found": "Some thing went wrong. Widget cell not found"
                    }
                },
                {
                    name: 'Pick cells to place widget',
                    path: `@[]:<css:.widget-grid-cell-empty[0]>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Pick cells to place widget',
                    delayBefore: 200,
                    delayAfter: 200,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: null,
                        target_element_path: '@[]:<css:.widget-grid-cell-empty[0]>',
                    },
                    error_messeges: {
                        "element_not_found": "Some thing went wrong. Widget cell not found"
                    }
                },
                {
                    name: 'Pick cells to place widget',
                    path: `@[]:<css:.widget-grid-cell-empty[0]>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Pick cells to place widget',
                    delayBefore: 200,
                    delayAfter: 200,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: null,
                        target_element_path: '@[]:<css:.widget-grid-cell-empty[0]>',
                    },
                    error_messeges: {
                        "element_not_found": "Some thing went wrong. Widget cell not found"
                    }
                },
                {
                    name: 'Click Add Widget Button',
                    path: `@[]:<dataid:dashboard-add-widget-button>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click add widget button',
                    delayBefore: 200,
                    delayAfter: 200,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: null,
                        target_element_path: '@[]:<dataid:dashboard-add-widget-button>',
                    },
                    error_messeges: {
                        "element_not_found": "Some thing went wrong. Element not found"
                    }
                },
                {
                    name: 'Search for Widget',
                    path: `@[]:<dataid:widget-search-input>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Enter: 3d car unity',
                    delayBefore: 200,
                    delayAfter: 200,
                    finish_condition: {
                        type: 'text_contains',
                        expectedValue: '3d car unity',
                        target_element_path: '@[]:<dataid:widget-search-input>',
                    },
                    error_messeges: {
                        "element_not_found": "Some thing went wrong. Element not found"
                    }
                },
                {
                    name: 'Select widget',
                    path: `@[]:<css:.widget-list-item[0]>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Select "3d car unity" widget',
                    delayBefore: 200,
                    delayAfter: 200,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: null,
                        target_element_path: '@[]:<css:.widget-list-item[0]>',
                    },
                    error_messeges: {
                        "element_not_found": "Some thing went wrong. Element not found"
                    }
                },
                {
                    name: 'Click add widget',
                    path: `@[]:<dataid:btn-add-widget-in-widget-library>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to add widget to dashboard',
                    delayBefore: 200,
                    delayAfter: 200,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: null,
                        target_element_path: '@[]:<dataid:btn-add-widget-in-widget-library>',
                    },
                    error_messeges: {
                        "element_not_found": "Some thing went wrong. Element not found"
                    }
                },
                {
                    name: 'Click Save',
                    path: `@[]:<dataid:dashboard-save-button>`,
                    actionType: 'show_tooltip',
                    value: null,
                    tooltipMessage: 'Click here to save',
                    delayBefore: 200,
                    delayAfter: 200,
                    finish_condition: {
                        type: 'element_clicked',
                        expectedValue: null,
                        target_element_path: '@[]:<dataid:dashboard-save-button>',
                    },
                    error_messeges: {
                        "element_not_found": "Some thing went wrong. Element not found"
                    }
                },
            ]
        }
    }
]
