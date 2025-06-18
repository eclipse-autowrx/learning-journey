# Smart Ambient Light Prototype: A Complete Guide

## Introduction

Welcome to this comprehensive tutorial on prototype development using the `playground.digital.auto` platform. This hands-on guide will walk you through creating a complete "Smart Ambient Light" feature that automatically illuminates your vehicle's interior lighting when a door is opened.

### What You'll Learn

This tutorial is designed for automotive software development students and professionals who want to gain practical experience with:

- **Vehicle Signal Integration**: Working with real-time vehicle data through the COVESA Vehicle API
- **Event-Driven Programming**: Implementing reactive logic using Python and asynchronous programming
- **User Experience Design**: Creating customer journey maps for automotive features  
- **Prototype Visualization**: Building interactive dashboards with 3D vehicle models
- **End-to-End Development**: From concept to working prototype in a professional automotive development environment

### About the Smart Ambient Light Feature

The Smart Ambient Light prototype demonstrates a common automotive comfort feature where:
1. The system monitors the driver's door status
2. When the door opens, ambient lighting automatically activates
3. The lights provide visual feedback and enhance the user experience

This seemingly simple feature showcases the power of modern Software-Defined Vehicles (SDV), where different vehicle systems (body control, lighting, user interfaces) work together seamlessly through standardized APIs.

### Prerequisites

- Basic understanding of Python programming
- Familiarity with asynchronous programming concepts
- Access to a `playground.digital.auto` account

## Table of Contents

### Part 1: Project Setup
1. [Vehicle Model Configuration](#step-1-vehicle-model-configuration)
2. [Prototype Initialization](#step-2-prototype-initialization)

### Part 2: Design and Planning
3. [Customer Journey Mapping](#step-3-customer-journey-mapping)

### Part 3: Development
4. [Python Code Implementation](#step-4-python-code-implementation)
   - 4.1 Setting Up the Development Environment
   - 4.2 Initializing the Application Entry Point
   - 4.3 Vehicle Signal Discovery and Subscription
   - 4.4 Event Handler Implementation
   - 4.5 Ambient Light Control Logic
   - 4.6 Complete Code Integration

### Part 4: Testing and Visualization
5. [Dashboard Configuration](#step-5-dashboard-configuration)
6. [Prototype Execution and Testing](#step-6-prototype-execution-and-testing)

### Part 5: Additional Resources
7. [Runtime Management and Debugging](#additional-information)
8. [Next Steps and Advanced Features](#conclusion)

---

## Step-by-Step Implementation Guide

### Step 1: Vehicle Model Configuration

**Objective**: Establish the foundation for your prototype by setting up a vehicle model that provides access to the necessary vehicle signals.

The vehicle model serves as your digital twin, containing all the standardized signals defined by the COVESA Vehicle API. These signals represent real vehicle data points like door status, lighting controls, engine parameters, and more.

**Implementation Steps**:

1. **Access Vehicle Models**: Navigate to the "Vehicle Models" section in your `playground.digital.auto` workspace
2. **Model Selection**: 
   - If you have an existing model compatible with COVESA Vehicle API, select it
   - For new projects, create a fresh model using the latest COVESA standards for optimal signal compatibility
3. **Verification**: Ensure your selected model includes the required signals:
   - `Vehicle.Cabin.Door.Row1.DriverSide.IsOpen` (door status detection)
   - `Vehicle.Cabin.Light.AmbientLight.Row1.*` (lighting control)

![Creating or Selecting a Vehicle Model](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/create_new_model.gif)

*Navigate to Vehicle Models and either select an existing model or create a new one with COVESA Vehicle API compatibility*

### Step 2: Prototype Initialization

**Objective**: Create a dedicated workspace for your Smart Ambient Light feature development.

**Implementation Steps**:

1. **Access Prototype Library**: Open the Prototype Library interface within `playground.digital.auto`
2. **Create New Prototype**: Click the "+ Create New Prototype" button
3. **Project Naming**: Name your prototype "Smart Ambient Light" for clear identification
4. **Workspace Setup**: The platform will initialize your development environment with all necessary tools

![Creating a New Prototype](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/1.0_create_prototype.gif)

*Create a new prototype workspace specifically for the Smart Ambient Light feature*

### Step 3: Customer Journey Mapping

**Objective**: Design the user experience flow and define system behavior for your prototype.

Customer journey mapping helps you visualize the complete user interaction sequence, ensuring your prototype addresses real-world scenarios effectively.

**Implementation Steps**:

1. **Navigate to Journey Tab**: Switch to the **Journey** tab in your prototype interface
2. **Journey Planning**: Create or modify the customer journey to include:
   - **User Action**: "Driver approaches and opens vehicle door"
   - **System Detection**: "Door sensor triggers open event"
   - **System Response**: "Ambient lighting activates automatically"
   - **User Experience**: "Enhanced visibility and welcoming atmosphere"
3. **Flow Customization**: Add, remove, or modify journey steps to match your specific use case

![Defining the Customer Journey](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/2.0_customer_journey.gif)

*Map out the complete user experience flow from door opening to ambient light activation*

### Step 4: Python Code Implementation

**Objective**: Develop the core logic that transforms vehicle signals into intelligent behavior.

This section covers the heart of your prototype - the Python code that listens for door events and controls the ambient lighting system.

#### 4.1 Setting Up the Development Environment

**Implementation Steps**:

1. **Navigate to SDV Code Tab**: Switch to the **SDV Code** tab for access to the integrated development environment
2. **Environment Preparation**: Clear any existing sample code to start with a clean slate
3. **Development Framework**: The environment provides full Python support with vehicle API integration

![Initializing on_start function](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/4.1_navigate_to_code_and_remove_sample.gif)

*Access the development environment and prepare for coding*

#### 4.2 Initializing the Application Entry Point

The `on_start` function serves as your application's initialization point, where you establish connections to vehicle signals.

**Key Concepts**:
- Asynchronous programming enables real-time signal processing
- Signal subscriptions create event-driven responses
- Proper initialization ensures reliable prototype operation

#### 4.3 Vehicle Signal Discovery and Subscription

**Implementation Steps**:

1. **Signal Search**: Use the signal browser (typically on the right side of the code editor)
2. **Target Signal**: Search for "driver" to locate `Vehicle.Cabin.Door.Row1.DriverSide.IsOpen`
3. **Signal Understanding**: This boolean signal indicates door state (True = open, False = closed)

![Searching for relevant vehicle signals](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/4.2_search_driver_door_signal_and_subscribe.gif)

*Discover and understand the vehicle signals needed for door detection*

#### 4.4 Event Handler Implementation

Create the callback function that processes door state changes:

```python
async def on_driver_door_opened(self, data: DataPointReply):
    value = data.get(self.Vehicle.Cabin.Door.Row1.DriverSide.IsOpen).value
    # Logic implementation continues...
```

**Key Components**:
- **Asynchronous Function**: Enables non-blocking event processing
- **DataPointReply**: Contains the latest signal state information
- **Signal Value Extraction**: Retrieves the current door status

![Writing the door event handler function](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/4.3_receive_door_open_event.gif)

*Implement the event handler that responds to door state changes*

#### 4.5 Ambient Light Control Logic

**Implementation Steps**:

1. **Conditional Logic**: Check if the door is open (`value == True`)
2. **Light Activation**: Set ambient light properties when door opens
3. **Color Configuration**: Apply cyan color (#00FFFF) for visual appeal
4. **Bilateral Control**: Activate lights on both driver and passenger sides

![Setting ambient light when door opens](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/4.4_turn_on_ambient_light_if_door_open.gif)

*Configure ambient lighting to activate when door opens*

#### 4.6 Complete Code Integration

**Final Implementation**:

```python
import time
import asyncio
import signal

from sdv.vdb.reply import DataPointReply
from sdv.vehicle_app import VehicleApp
from vehicle import Vehicle, vehicle

class TestApp(VehicleApp):
    """Smart Ambient Light Vehicle Application
    
    This application demonstrates event-driven vehicle feature development
    by automatically activating ambient lighting when the driver door opens.
    """

    def __init__(self, vehicle_client: Vehicle):
        super().__init__()
        self.Vehicle = vehicle_client

    async def on_driver_door_opened(self, data: DataPointReply):
        """Handle driver door state changes
        
        This callback function is triggered whenever the driver door
        IsOpen signal changes state, enabling real-time response.
        """
        print("Driver door event received")
        
        # Extract current door state from signal data
        value = data.get(self.Vehicle.Cabin.Door.Row1.DriverSide.IsOpen).value
        print(f"Driver door state: {'Open' if value else 'Closed'}")

        if value:  # Door is open
            print("Activating ambient lighting...")
            
            # Configure ambient lighting for enhanced user experience
            await self.Vehicle.Cabin.Light.AmbientLight.Row1.DriverSide.Color.set("#00FFFF")
            await self.Vehicle.Cabin.Light.AmbientLight.Row1.DriverSide.IsLightOn.set(True)
            await self.Vehicle.Cabin.Light.AmbientLight.Row1.PassengerSide.Color.set("#00FFFF")
            await self.Vehicle.Cabin.Light.AmbientLight.Row1.PassengerSide.IsLightOn.set(True)
            
            print("Ambient lighting activated successfully")

    async def on_start(self):
        """Application initialization and signal subscription setup"""
        print("Smart Ambient Light application starting...")
        
        # Establish subscription to driver door status
        await self.Vehicle.Cabin.Door.Row1.DriverSide.IsOpen.subscribe(
            self.on_driver_door_opened
        )
        
        print("Door monitoring active - Smart Ambient Light ready")

# Application execution framework
async def main():
    """Main application entry point"""
    vehicle_app = TestApp(vehicle)
    await vehicle_app.run()

# Event loop configuration for signal handling
LOOP = asyncio.get_event_loop()
LOOP.add_signal_handler(signal.SIGTERM, LOOP.stop)
LOOP.run_until_complete(main())
LOOP.close()
```

**Code Architecture Understanding**:

The implementation follows a clean, event-driven architecture with two primary components:

1. **Application Entry Point (`on_start`)**: Initializes the application and establishes signal subscriptions
2. **Event Handler (`on_driver_door_opened`)**: Processes door state changes and controls ambient lighting

This pattern is fundamental to vehicle application development, enabling responsive, real-time features.

### Step 5: Dashboard Configuration

**Objective**: Create an interactive interface for testing and visualizing your prototype's functionality.

The dashboard provides a professional testing environment with visual feedback and manual control capabilities.

**Dashboard Architecture**:
- **Grid System**: 5 columns × 2 rows (10 total cells)
- **Widget Marketplace**: Pre-built components for rapid dashboard development  
- **Custom Layouts**: Merge cells to create custom widget arrangements

**Implementation Steps**:

1. **Environment Setup**:
   - Navigate to the **Dashboard** tab
   - Clear existing sample widgets for a clean workspace

   ![Navigate to dashboard and clear widgets](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.1_navigate_to_dashboard_clear_all.gif)

2. **3D Vehicle Model Integration**:
   - Merge 6 cells to create a primary display area
   - Install the 3D car widget for visual prototype interaction
   - Configure the model to respond to your vehicle signals

   ![Add 3D car model to dashboard](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.2_merge_6_cells_and_put_car.gif)

3. **Signal Monitoring Setup**:
   - Merge 2 cells for the signal control panel
   - Add a Signal Table widget
   - Configure to display all signals used in your Python code

   ![Add signal table widget](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.3_add_table_widget_and_signals.gif)

4. **Interactive Testing**:
   - Test manual signal manipulation through the signal table
   - Interact directly with the 3D car model (door handles, etc.)
   - Use the signal table to manually modify signal values for testing
   - Click on signal values to edit and trigger prototype responses
   - Validate that manual changes produce expected lighting behavior
   - Verify real-time visual feedback

   ![Interact with 3D car model](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.4_play_around_3d_car.gif)

   ![Manual signal manipulation through table](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.4_play_around_table.gif)

   *Test your prototype by manually changing signal values through the interactive table and interacting with the 3D car model*

### Step 6: Prototype Execution and Testing

**Objective**: Execute your complete prototype and validate the Smart Ambient Light functionality.

**Final Testing Process**:

1. **Code Execution**: Run your Python application
2. **Functional Validation**: Test door opening triggers ambient light activation
3. **System Integration**: Verify seamless communication between signals and actuators

![Complete prototype demonstration](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/6.result.gif)

*Final result: Automatic ambient light activation triggered by door opening, demonstrating successful vehicle API integration*

---

## Additional Information

### Runtime Management and Debugging

**Runtime Requirements**: 
- Select an appropriate `sdv-runtime` to enable code execution
- The runtime provides the execution environment for your Python application

**Debugging Tools**:
- **Application Logs**: Real-time feedback during development and testing
- **Signal Monitoring**: Track signal state changes and application responses  
- **Error Reporting**: Detailed error messages for troubleshooting

![Runtime selection and logging](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/7.runtime_and_log.gif)

*Configure runtime and access debugging logs for prototype development*

**Advanced Resources**:
- **3D Car Widget Documentation**: [Complete widget reference](https://github.com/eclipse-autowrx/widget-3d-car-unity/blob/main/README.md)
- **Runtime Deep Dive**: Advanced courses available for custom runtime development

---

## Conclusion

### Achievement Summary

Congratulations! You have successfully implemented a complete Smart Ambient Light prototype that demonstrates professional automotive software development practices. Your prototype showcases:

**Technical Skills Acquired**:
- ✅ Vehicle signal integration using COVESA Vehicle API
- ✅ Event-driven programming with Python and asyncio
- ✅ Real-time system communication and control
- ✅ Professional dashboard design and testing
- ✅ End-to-end prototype development workflow

**System Integration Demonstrated**:
- ✅ Body control system integration (door sensors)
- ✅ Lighting system control (ambient lighting)
- ✅ Cross-domain vehicle system communication


**Happy prototyping!** Your journey into Software-Defined Vehicle development has just begun, and the skills you've learned here form the foundation for building the next generation of automotive experiences.
