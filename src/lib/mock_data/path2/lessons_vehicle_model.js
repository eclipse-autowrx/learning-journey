export const vehicle_model_lessons = [
    {
        slug: 'understanding_vehicle_models',
        name: "Understanding Vehicle Models",
        description: "Learn what vehicle models are and how they work in the digital.auto playground",
        duration: "8 minutes",
        type: "text-markdown",
        markdown_content: `
# Understanding Vehicle Models

## What is a Vehicle Model?

A vehicle model in the digital.auto playground represents a complete automotive platform that includes:

- **High-level Architecture** - Complete system overview and design
- **Vehicle Signals** - Standardized data points and controls (APIs)
- **Prototype Library** - Ready-to-use examples and templates

![Vehicle Model Home Screen](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/model_home_screen.png)

## ACME Car (EV) v0.1 - Your Learning Reference

The ACME Car electric vehicle serves as our primary reference model for learning, featuring:

- **Modern EV Architecture** - Electric powertrain with advanced driver assistance systems
- **Comprehensive Signal Coverage** - Over 1,278 vehicle API endpoints
- **Rich Prototype Ecosystem** - 11+ ready-to-use prototypes for learning

## Key Benefits of Vehicle Models

Vehicle models provide a structured approach to automotive development:

### **Standardization**
All models follow the COVESA Vehicle Signal Specification (VSS), ensuring consistency across different platforms.

### **Collaboration**
Teams can work together on the same vehicle model, sharing architecture and prototypes.

### **Rapid Prototyping**
Start building and testing automotive solutions immediately without physical hardware.

### **Learning Path**
Reference models like ACME Car provide examples and best practices for your own projects.

## Getting Started

When exploring a vehicle model, you'll navigate through three main areas:
1. **Overview** - General information and model details
2. **Architecture** - Visual system design and API integration points
3. **Vehicle API** - Complete signal catalog with 1,278+ endpoints
4. **Prototype Library** - Ready-to-use examples and templates

Vehicle models serve as the foundation for all your automotive software development in the playground.

`
    },
    {
        slug: 'creating_new_vehicle_model',
        name: "Creating a New Vehicle Model",
        description: "Step-by-step guide to create your own vehicle model from scratch",
        duration: "12 minutes",
        type: "text-markdown",
        markdown_content: `
# How to Create a New Vehicle Model

This guide will walk you through the step-by-step process of creating a new vehicle model on the platform.

## Visual Guide to Creating a Vehicle Model

To help you better understand the process of creating a new vehicle model, we've included a visual guide. This GIF demonstrates the steps to navigate through the platform and initiate the creation of a new model:

![Create New Model Demonstration](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/create_new_model.gif)

For a more detailed explanation of each field, please refer to the additional information provided below.


## Accessing the Vehicle Models Section

To create a new model, navigate to the **Vehicle Models** section from the main navigation. You'll see three tabs:
- **My Models** - Your personal vehicle models
- **My Contributions** - Models you've contributed to
- **Public** - Publicly available models for reference

![Vehicle Models interface](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/model_gallery.png)

## Step 1: Initiate Model Creation

Click the **"+ Create New Model"** button in the top right corner of the Vehicle Models page. This will open the "Create New Model" dialog.

## Step 2: Configure Your Model

![Create New Model dialog](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/create_model_dialog.png)

The model creation dialog requires several key pieces of information:

### Model Name
Enter a descriptive name for your vehicle model in the **Model Name** field. This should clearly identify your model's purpose or the vehicle type it represents.

### Signal Selection
The **Signal** field is crucial for defining your model's communication protocol. You can choose from several COVESA VSS (Vehicle Signal Specification) versions:

![VSS version selection](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/pic_api_version.png)

Available options include:
- COVESA VSS v4.1 (default)
- COVESA VSS v5.0
- COVESA VSS v5.0rc0
- COVESA VSS v4.2
- COVESA VSS v4.2rc0
- COVESA VSS v4.1rc0
- COVESA VSS v4.0
- COVESA VSS v3.11
- COVESA VSS v3.1
- COVESA VSS v3.0

### File Upload Option

If you have a custom signal definition, you can upload a JSON file instead of using the predefined VSS versions. The upload area accepts JSON files and supports drag-and-drop functionality.

## Step 3: Finalize Model Creation

Once you've configured all the necessary parameters:

1. **Model Name**: Enter your model's name
2. **Signal**: Select your preferred VSS version or upload a custom JSON file
3. Click the **"Create Model"** button to finalize the creation process

## Step 4: View Your Created Model

After successful creation, your new model will appear in the public models gallery.

## Best Practices for Model Creation

### **Naming Convention**
- Use descriptive names that clearly indicate the vehicle type or purpose
- Consider including version numbers for iterative development
- Avoid special characters that might cause compatibility issues

### **Signal Version Selection**
- **Latest Stable (v4.1)** - Recommended for most projects
- **Latest Version (v5.0)** - For cutting-edge features and newest signals
- **Custom JSON** - When you need specific signals not available in standard VSS

### **Planning Your Model**
Before creating your model, consider:
- **Target Use Cases** - What prototypes will you build?
- **Required Signals** - Which vehicle systems will you interact with?
- **Team Collaboration** - Who will contribute to this model?
- **Future Expansion** - How might your model evolve over time?

## What Happens After Creation

Once your model is created, you can:

1. **Design Architecture** - Create visual system diagrams
2. **Explore Vehicle APIs** - Browse and understand available signals
3. **Build Prototypes** - Develop and test automotive applications
4. **Collaborate** - Invite team members to contribute

Creating your own vehicle model is the first step toward building innovative automotive solutions in the digital.auto playground.
`
    },
    {
        slug: 'vehicle_api_navigation',
        name: "Navigating Vehicle APIs",
        description: "Master the COVESA VSS standard and learn to navigate vehicle signals effectively",
        duration: "10 minutes",
        type: "text-markdown",
        markdown_content: `
# Navigating Vehicle APIs

## COVESA VSS Standard

All vehicle APIs in the playground follow the **COVESA Vehicle Signal Specification (VSS)**, ensuring:

- **Standardization** across different vehicle models
- **Interoperability** between cloud and onboard systems
- **Scalability** for future automotive innovations

![Vehicle API View](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/model_api_view.png)

## Understanding API Types

Vehicle APIs are organized into three main categories:

### **BRANCH** - Organizational Containers
These create the hierarchical structure:
- **Vehicle** - Root container for all vehicle signals
- **Vehicle.Acceleration** - Motion and dynamics data
- **Vehicle.ADAS** - Advanced Driver Assistance Systems
- **Vehicle.ADAS.CruiseControl** - Cruise control functionality

### **SENSOR** - Data Input Points
These provide real-time data from the vehicle:
- **Vehicle.Acceleration.Lateral** - Side-to-side motion sensing
- **Vehicle.Acceleration.Longitudinal** - Forward/backward motion sensing
- **Vehicle.Acceleration.Vertical** - Up/down motion sensing
- **Vehicle.ADAS.ABS.IsEngaged** - Anti-lock braking system status

### **ACTUATOR** - Control Output Points
These allow you to control vehicle systems:
- **Vehicle.ADAS.ABS.IsEnabled** - Enable/disable ABS system
- **Vehicle.ADAS.CruiseControl.IsActive** - Activate cruise control
- **Vehicle.ADAS.CruiseControl.IsEnabled** - Enable cruise control system

## Navigation Tools

The playground provides powerful tools for exploring APIs:

### **List View**
Hierarchical display of all signals in a tree structure

### **Tree View**
Visual navigation showing parent-child relationships

### **Search Signal**
Quick search across all 1,278+ vehicle signals

### **Filter**
Advanced filtering by signal type (BRANCH, SENSOR, ACTUATOR)

### **Version Diff**
Compare different API versions to track changes

## Practical Tips

When working with vehicle APIs:

1. **Start with BRANCH signals** to understand the overall structure
2. **Use search** to quickly find specific signals you need
3. **Check signal types** to understand if it's data input or control output
4. **Explore related signals** in the same branch for comprehensive understanding

Understanding the API structure is crucial for building effective prototypes that interact with vehicle systems.
`
    },
    {
        slug: 'vehicle_architecture_design',
        name: "Vehicle Architecture Design",
        description: "Learn to view, understand, and customize vehicle architecture diagrams",
        duration: "12 minutes",
        type: "text-markdown",
        markdown_content: `
# Vehicle Architecture Design

## Understanding Sample Architecture

The ACME Car demonstrates a **sample automotive architecture** that showcases how modern vehicles can be structured with distinct layers. This architecture serves as a reference example, but **you can upload and customize your own architectures** to match your specific vehicle models or product requirements.

![Vehicle Architecture](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/architecture.png)

## Architecture Layers

### **Sample Offboard Systems**
- **Solutions Business Layer** - High-level business logic and applications
- **Services Layer** - Cloud-based services and APIs
- **Data Layer** - Information processing and storage management

### **Sample Onboard Systems**
- **Application Software** - Vehicle applications and control algorithms
- **Operating System** - Real-time vehicle operating system
- **Compute Layer** - Processing units and electronic control units
- **Embedded Electronic Units** - ECUs and specialized control modules
- **Semiconductors & Sensors** - Hardware foundation and sensor networks

## API Integration Points

This sample architecture demonstrates key API integration points:

- **DT2CS** - Digital-Twin-to-Cloud Service API
- **C2DT** - Cloud-to-Digital Twin API
- **V2C** - Vehicle-to-Cloud API
- **S2S API** - Signal-to-Service API
- **E2S API** - Embedded-to-Signal API

## Customizing Architecture

The digital.auto playground allows you to:

- **Upload custom architecture diagrams** that reflect your specific vehicle design
- **Define your own system layers** and component relationships
- **Map APIs to your architecture** according to your product specifications
- **Collaborate with teams** using architecture models that match your development goals

## Architecture Benefits

A well-designed architecture provides:

### **Visual Communication**
Clear representation of system components and their relationships

### **API Mapping**
Shows how vehicle APIs integrate with your system design

### **Team Alignment**
Helps team members understand the overall system design

### **Documentation**
Serves as living documentation for your vehicle model

### **Prototype Foundation**
Provides context and reference for prototype development

Understanding architecture design is essential for creating comprehensive vehicle models that serve as effective foundations for prototype development.
`
    },
    {
        slug: 'interactive_architecture_editing',
        name: "Interactive Architecture Editing",
        description: "Master the tools for creating interactive architecture diagrams with external links",
        duration: "15 minutes",
        type: "text-markdown",
        markdown_content: `
# Interactive Architecture Editing

## Entering Edit Mode

To customize your vehicle model's architecture:

1. **Navigate to the Architecture tab** in your vehicle model
2. **Click the "Edit" button** in the top-right corner of the architecture view
3. The interface will switch to **edit mode** with design tools and options

## Interactive Design Tools

Once in edit mode, you have access to various interactive design tools:

### **Shape Tools (Create Interactive Areas)**
- **Rectangle Tool** - Create hoverable rectangular areas that link to external modules and systems
- **Circle Tool** - Create hoverable circular areas that link to external modules and systems
- **Text Tool** - Add labels and descriptions to your architecture elements

### **Pin Icons (Create Interactive Markers)**
Choose from various pin types and markers to highlight specific components:
- **Location Pin** - Standard red location marker
- **Warning Icons** - Alert and notification markers
- **Information Icons** - Blue information and help indicators
- **Status Icons** - Success, error, and status indicators
- **Numbered Pins** - Sequential numbering (1, 2, 3, 4, 5) for step-by-step processes
- **Other Markers** - Additional specialized icons for different component types

## Tool Demonstrations

### Creating Interactive Rectangle Areas
Learn how to use the rectangle tool to create hoverable, clickable areas that open external links:

![Rectangle Tool Demonstration](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/architect-rectangle.gif)

### Using Pin Tools for External Links
See how to use pin tools to create interactive markers that open external links:

![Pin Tool Demonstration](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/architecture-pin-tool.gif)

## Uploading Architecture Images

For complex architectures or existing diagrams:

1. **Click "Upload Image"** in the edit toolbar
2. **Select your architecture diagram** from your computer
3. **Position and resize** the uploaded image as needed
4. **Add interactive elements** on top of your uploaded diagram
5. **Combine uploaded images** with drawing tools for enhanced detail

### **Supported Image Formats**
- **PNG** - Best for diagrams with transparency
- **JPG/JPEG** - Standard format for photographs and complex images
- **SVG** - Vector graphics that scale perfectly at any size

## Saving Your Work

After making changes to your architecture:

1. **Review your design** to ensure all components and connections are correct
2. **Click "Save"** in the top-right corner to preserve your changes
3. **Click "Cancel"** if you want to discard changes and return to view mode
4. Your **saved architecture** becomes the new reference for all child prototypes

## Best Practices

### **Design Guidelines**
- **Clear Labeling** - Use descriptive names for all components and layers
- **Consistent Styling** - Maintain uniform colors and shapes for similar elements
- **Logical Flow** - Arrange components to show clear data and control flow
- **Interactive Elements** - Use hoverable areas and pins to link to external systems

### **Collaboration Tips**
- **Document Changes** - Keep track of architecture modifications for team members
- **Version Control** - Save incremental versions as your architecture evolves
- **Team Review** - Share architecture changes with contributors before finalizing
- **Testing Impact** - Consider how architecture changes affect existing prototypes

Interactive architecture editing enables you to create dynamic, clickable diagrams that serve as navigation hubs for your vehicle development ecosystem.
`
    },
    {
        slug: 'prototype_development_management',
        name: "Prototype Development & Management",
        description: "Learn to work with prototypes, understand API inheritance, and manage collaborative development",
        duration: "18 minutes",
        type: "text-markdown",
        markdown_content: `
# Prototype Development & Management

## Understanding Vehicle API Inheritance

### Important: Parent-Child Relationship

> **Key Concept:** Prototypes can **only access the vehicle APIs of their parent vehicle model**. Any changes made to the vehicle APIs at the parent level will automatically affect all child prototypes that depend on those APIs.

This inheritance model ensures:
- **API Consistency** - All prototypes within a vehicle model use the same standardized signals
- **Centralized Management** - Vehicle API updates are managed at the model level
- **Version Control** - Changes propagate systematically to all dependent prototypes
- **Quality Assurance** - Modifications are tested across all related prototypes

## Virtual Prototyping for Early Validation

The **primary purpose** of the digital.auto playground is to enable developers to **create various early prototypes** that validate their ideas in a **virtual environment first**. This approach allows you to test concepts, iterate quickly, and refine your automotive solutions before investing in physical hardware or real vehicle testing.

![Prototype Library](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/prototype%20library.png)

## Learning from Reference Examples

### **Popular Prototypes** (Learning Examples)
- **Anti-Kinetosis** (200 views) - Motion sickness prevention systems
- **Passenger Welcome** (263 views) - Personalized vehicle entry experiences
- **Smart Wipers** (301 views) - Intelligent wiper control algorithms
- **Perfectly Keyless Demo** (170 views) - Advanced keyless entry systems

### **Advanced Examples** (For Deeper Learning)
- **Safeguarded OpenDoor API** (48 views) - Secure door control implementations
- **Passenger Welcome 3D** (64 views) - Enhanced 3D welcome experiences
- **Smart Wipers with AI** (48 views) - AI-powered wiper control systems
- **Replenishment Subscription** (19 views) - Automated vehicle servicing solutions

## Building Your Own Prototypes

When developing prototypes, you can:

1. **Browse the Signal Catalog** - Explore available vehicle signals
2. **Add to Wishlist** - Save frequently used signals
3. **Generate Code** - Auto-generate API integration code
4. **Test in Cloud with SDV-Runtime** - Complete distributed runtime environment with pre-packaged tools and libraries (Kuksa, Velocitas, etc.)

## Vehicle Model Management

### Model Configuration

Each vehicle model includes configurable properties:

- **Visibility** - Public (anyone can see models and prototypes) or Private (only you and invited users can access)
- **State** - Development status (Released, Draft, Blocked, etc.)
- **Contributors** - Team members with read and write permissions (can edit models and prototypes)
- **Members** - Team members with read-only permissions (can view but not modify)

### Collaborative Development

The platform supports team-based development:

- **Add User** - Invite team members to projects
- **Update Properties** - Modify vehicle configurations
- **Change State** - Manage development lifecycle
- **Edit Access** - Control permissions and visibility (only the owner can do this)

## Planning Your Vehicle Model

When creating your vehicle model, carefully consider:
- **API Scope** - Include all signals your prototypes might need
- **Future Prototypes** - Plan for potential expansion of your prototype library
- **Team Collaboration** - Ensure API changes are communicated to all prototype developers
- **Testing Impact** - Understand that API changes will require re-testing all child prototypes

## Next Steps

**Your Learning Journey:**
1. **Explore the ACME Car reference model** to understand best practices
2. **Try editing the sample architecture** to get hands-on experience
3. **Browse the prototype library** for inspiration and learning
4. **Start building your own vehicle model** and prototypes
5. **Collaborate with team members** to create comprehensive automotive solutions

Whether you're building simple sensor-based applications or complex multi-system integrations, the playground's organized approach to vehicle APIs and collaborative development environment provides the foundation for successful automotive software projects.
`
    },
    {
        slug: 'vehicle_model_understanding_quiz',
        name: "Vehicle Models & API Quiz",
        description: "This quiz evaluates your understanding of vehicle models, COVESA VSS standards, architecture design, and prototype development in the digital.auto playground.",
        type: "quiz",
        questions: [
            {
                "question": "What are the three main components that a vehicle model in the digital.auto playground includes?",
                "answers": [
                    {
                        "label": "Hardware specifications, software code, and user manuals"
                    },
                    {
                        "label": "High-level Architecture, Vehicle Signals, and Prototype Library",
                        "is_correct": true
                    },
                    {
                        "label": "Engine specifications, transmission details, and fuel efficiency"
                    },
                    {
                        "label": "Physical design, color schemes, and interior layout"
                    }
                ]
            },
            {
                "question": "Which COVESA VSS version is recommended as the default choice for most new vehicle model projects?",
                "answers": [
                    {
                        "label": "COVESA VSS v5.0"
                    },
                    {
                        "label": "COVESA VSS v3.0"
                    },
                    {
                        "label": "COVESA VSS v4.1",
                        "is_correct": true
                    },
                    {
                        "label": "COVESA VSS v4.2rc0"
                    }
                ]
            },
            {
                "question": "What are the three main API types in the COVESA Vehicle Signal Specification?",
                "answers": [
                    {
                        "label": "INPUT, OUTPUT, and CONTROL"
                    },
                    {
                        "label": "BRANCH, SENSOR, and ACTUATOR",
                        "is_correct": true
                    },
                    {
                        "label": "HARDWARE, SOFTWARE, and NETWORK"
                    },
                    {
                        "label": "READ, WRITE, and EXECUTE"
                    }
                ]
            },
            {
                "question": "According to the parent-child relationship concept, what happens when vehicle APIs are changed at the parent vehicle model level?",
                "answers": [
                    {
                        "label": "Only new prototypes are affected"
                    },
                    {
                        "label": "Changes must be manually applied to each prototype"
                    },
                    {
                        "label": "All child prototypes automatically inherit the changes",
                        "is_correct": true
                    },
                    {
                        "label": "Changes are ignored by existing prototypes"
                    }
                ]
            },
            {
                "question": "What is the primary purpose of pin icons in interactive architecture editing?",
                "answers": [
                    {
                        "label": "To add decorative elements to the architecture"
                    },
                    {
                        "label": "To create hoverable areas that link to external modules and systems",
                        "is_correct": true
                    },
                    {
                        "label": "To mark errors in the architecture design"
                    },
                    {
                        "label": "To indicate the physical location of components"
                    }
                ]
            },
            {
                "question": "Which image formats are supported for uploading custom architecture diagrams?",
                "answers": [
                    {
                        "label": "Only PNG files"
                    },
                    {
                        "label": "PNG, JPG/JPEG, and SVG",
                        "is_correct": true
                    },
                    {
                        "label": "Only SVG files"
                    },
                    {
                        "label": "PNG and GIF only"
                    }
                ]
            },
            {
                "question": "What does SENSOR type APIs provide in the vehicle signal specification?",
                "answers": [
                    {
                        "label": "Control commands to vehicle systems"
                    },
                    {
                        "label": "Organizational structure for other signals"
                    },
                    {
                        "label": "Real-time data from the vehicle",
                        "is_correct": true
                    },
                    {
                        "label": "Historical logs of vehicle performance"
                    }
                ]
            },
            {
                "question": "In vehicle model management, what is the difference between Contributors and Members?",
                "answers": [
                    {
                        "label": "Contributors have read-only access, Members have full access"
                    },
                    {
                        "label": "Contributors have read and write permissions, Members have read-only permissions",
                        "is_correct": true
                    },
                    {
                        "label": "There is no difference between Contributors and Members"
                    },
                    {
                        "label": "Contributors can only view prototypes, Members can view architecture"
                    }
                ]
            },
            {
                "question": "What is the main benefit of virtual prototyping in the digital.auto playground?",
                "answers": [
                    {
                        "label": "It eliminates the need for any physical testing"
                    },
                    {
                        "label": "It allows testing concepts and iterating quickly before investing in physical hardware",
                        "is_correct": true
                    },
                    {
                        "label": "It automatically generates production-ready code"
                    },
                    {
                        "label": "It provides real vehicle data for testing"
                    }
                ]
            },
            {
                "question": "Which API integration point connects the vehicle to cloud services?",
                "answers": [
                    {
                        "label": "E2S API (Embedded-to-Signal API)"
                    },
                    {
                        "label": "S2S API (Signal-to-Service API)"
                    },
                    {
                        "label": "V2C API (Vehicle-to-Cloud API)",
                        "is_correct": true
                    },
                    {
                        "label": "C2DT API (Cloud-to-Digital Twin API)"
                    }
                ]
            }
        ]
    }
]
