export const create_prototype_lessons = [
    {
        slug: 'setup_model_and_prototype',
        name: "Setup Model & Create Prototype",
        description: "Set up vehicle model, create prototype workspace, and design user journey",
        duration: "8 minutes",
        type: "text-markdown",
        markdown_content: `
# Setup Model & Create Prototype

## Quick Start Guide

Follow these steps to set up your Smart Ambient Light prototype that automatically turns on ambient lighting when the driver door opens.

## Step 1: Vehicle Model Setup

**Objective**: Create or select a vehicle model with the signals you need.

### Actions:
1. Go to **Vehicle Models** section
2. Either select an existing model or create a new one
3. Choose **COVESA VSS v4.1** for stability (recommended for learning)
4. Ensure your model includes door and lighting signals

<details>
<summary>The following signals will be used in this prototype:</summary>

- <small> <em>Vehicle.Cabin.Door.Row1.DriverSide.IsOpen</em>  Detects when driver door opens</small>
- <small> <em>Vehicle.Cabin.Light.AmbientLight.DriverSide.IsLightOn</em>  Controls driver side ambient light</small>
- <small> <em>Vehicle.Cabin.Light.AmbientLight.PassengerSide.IsLightOn</em>  Controls passenger side ambient light</small>
- <small> <em>Vehicle.Cabin.Light.AmbientLight.DriverSide.Color</em>  Sets driver side ambient light color</small>
- <small> <em>Vehicle.Cabin.Light.AmbientLight.PassengerSide.Color</em>  Sets passenger side ambient light color</small>
</details>


![Creating or Selecting a Vehicle Model](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/create_new_model.gif)


## Step 2: Create Prototype Workspace

**Objective**: Set up your development environment.

### Actions:
1. Open **Prototype Library**
2. Click **"+ Create New Prototype"**
3. Name it: **"Smart Ambient Light"**

![Creating a New Prototype](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/1.0_create_prototype.gif)

## Step 3: Design User Journey

**Objective**: Map out what happens when the user opens the car door.

### Why Customer Journey Matters

The customer journey is the backbone of any successful prototype - it defines the **real-world problem** your solution solves and the **user experience** you're creating. By mapping out each step from the user's perspective (approaching the car, opening the door, experiencing automatic lighting), you ensure your technical implementation serves a genuine need rather than just demonstrating technology. This journey becomes your north star, guiding every coding decision and helping stakeholders understand the practical value of your smart vehicle feature.


### Actions:
1. Go to **Journey** tab
2. Modify the sample journey template
3. Define simple flow:
   - User approaches car
   - Opens driver door (trigger)
   - Ambient lights turn on automatically
   - User gets enhanced visibility

![Defining the Customer Journey](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/2.0_customer_journey.gif)


## What's Next

✅ Vehicle model ready  
✅ Prototype workspace created  
✅ User journey mapped  

Now you're ready to write the Python code that makes it work!
`
    },
    {
        slug: 'write_python_code',
        name: "Write Python Code",
        description: "Implement the Smart Ambient Light functionality with Python",
        duration: "12 minutes",
        type: "text-markdown",
        markdown_content: `
# Write Python Code

## Implementation Overview

Write Python code that listens for door opening events and automatically activates ambient lighting.

<details>
<summary>Understanding the Python Code Structure</summary>

The Python code you'll write follows the **Eclipse Velocitas framework** - an industry-standard template for developing vehicle applications. This framework utilizes the [Vehicle App Python SDK](https://github.com/eclipse-velocitas/vehicle-app-python-sdk) which provides a standardized **Vehicle object** that gives you direct access to all vehicle signals and actuators. Instead of dealing with complex automotive protocols, you simply use intuitive Python methods like **Vehicle.Cabin.Door.Row1.DriverSide.IsOpen.get()** to read door status or **Vehicle.Body.Lights.AmbientLight.set(color)** to control lighting. This abstraction layer handles all the underlying communication, letting you focus on building innovative features rather than wrestling with vehicle networking protocols.

</details>


## Step 1: Setup Development Environment

**Objective**: Prepare your coding environment.

### Actions:
1. Go to **SDV Code** tab
2. Clear any existing sample code from the **on_start** function
3. Start with clean workspace

![Initializing on_start function](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/4.1_navigate_to_code_and_remove_sample.gif)

## Step 2: Find Required Signals

**Objective**: Discover the exact signal paths you need.

### Actions:
1. Use **Signal Browser** (right panel)
2. Search for **"driver"** to find door signal
3. Find: **Vehicle.Cabin.Door.Row1.DriverSide.IsOpen**
4. Click on signal name, copy subscribe code snippet


<details>
<summary>💡 Signal Browser Code Snippets</summary>

When you click on any signal name in the Signal Browser, a dialog box will appear with ready-to-use code snippets. These snippets provide three types of operations:

- **Get**: Read current signal value once
- **Set**: Update signal value (for actuators)  
- **Subscribe**: Listen for signal changes continuously

Simply copy the appropriate snippet and paste it into your code. This saves time and ensures you use the correct signal paths.

</details>



![Searching for relevant vehicle signals](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/4.2_search_driver_door_signal_and_subscribe.gif)

## Step 3: Write Event Handler

**Objective**: Create function that responds to door opening.

### Actions:
1. Write the door event handler function
2. Extract door state from signal data
3. Print door state value for debugging purposes

![Writing the door event handler function](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/4.3_receive_door_open_event.gif)

## Step 4: Add Light Control

**Objective**: Control ambient lighting when door opens.

### Actions:
1. Check if door is open
2. If open, set light color to cyan (#00FFFF)
3. Turn on lights for both driver and passenger sides
4. Add console logging for debugging

![Setting ambient light when door opens](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/4.4_turn_on_ambient_light_if_door_open.gif)

## Complete Code

Here's the complete working code:

\`\`\`python
import time
import asyncio
import signal

from sdv.vdb.reply import DataPointReply
from sdv.vehicle_app import VehicleApp
from vehicle import Vehicle, vehicle

class TestApp(VehicleApp):
    def __init__(self, vehicle_client: Vehicle):
        super().__init__()
        self.Vehicle = vehicle_client

    async def on_driver_door_opened(self, data: DataPointReply):
        """Handle driver door state changes"""
        print("Driver door event received")
        
        # Get door state
        value = data.get(self.Vehicle.Cabin.Door.Row1.DriverSide.IsOpen).value
        print(f"Driver door state: {'Open' if value else 'Closed'}")

        if value:  # Door is open
            print("Activating ambient lighting...")
            
            # Set light color and turn on
            await self.Vehicle.Cabin.Light.AmbientLight.Row1.DriverSide.Color.set("#00FFFF")
            await self.Vehicle.Cabin.Light.AmbientLight.Row1.DriverSide.IsLightOn.set(True)
            await self.Vehicle.Cabin.Light.AmbientLight.Row1.PassengerSide.Color.set("#00FFFF")
            await self.Vehicle.Cabin.Light.AmbientLight.Row1.PassengerSide.IsLightOn.set(True)
            
            print("Ambient lighting activated successfully")

    async def on_start(self):
        """Application initialization"""
        print("Smart Ambient Light application starting...")
        
        # Subscribe to door signal
        await self.Vehicle.Cabin.Door.Row1.DriverSide.IsOpen.subscribe(
            self.on_driver_door_opened
        )
        
        print("Door monitoring active - Smart Ambient Light ready")

# Application execution
async def main():
    vehicle_app = TestApp(vehicle)
    await vehicle_app.run()

LOOP = asyncio.get_event_loop()
LOOP.add_signal_handler(signal.SIGTERM, LOOP.stop)
LOOP.run_until_complete(main())
LOOP.close()
\`\`\`

## Key Components

- **Event Handler**: *on_driver_door_opened()* responds to door changes
- **Signal Subscription**: *subscribe()* connects door signal to handler
- **Light Control**: *set()* commands control ambient lighting
- **Async Pattern**: All functions use *async/await* for real-time response

## What's Next

✅ Python code written  
✅ Event handling implemented  
✅ Light control logic added  

Now create the dashboard to test your prototype!
`
    },
    {
        slug: 'create_dashboard',
        name: "Create Interactive Dashboard",
        description: "Build dashboard with 3D car model and signal controls for testing",
        duration: "10 minutes",
        type: "text-markdown",
        markdown_content: `
# Create Interactive Dashboard


## What is Dashboard?

The dashboard provides a professional testing environment with visual feedback, manual control capabilities, and real-time display of your prototype's code execution results.

**Key Features**:
- **Grid System**: 5 columns x 2 rows (10 total cells) for flexible layout design
- **Widget Marketplace**: Pre-built components for rapid dashboard development
- **Custom Layouts**: Merge cells to create custom widget arrangements
- **Real-time Testing**: Interactive controls for manual signal manipulation and validation

## Dashboard Overview

Now you'll create a visual testing environment to validate your Smart Ambient Light prototype. The dashboard combines 3D car visualization with real-time signal monitoring, enabling you to simulate door opening events and observe your code's lighting responses without physical hardware.


## Step 1: Setup Dashboard Layout

**Objective**: Create clean workspace for your widgets.

### Actions:
1. Go to **Dashboard** tab
2. Clear all existing widgets

![Navigate to dashboard and clear widgets](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.1_navigate_to_dashboard_clear_all.gif)

## Step 2: Add 3D Car Model

**Objective**: Add interactive vehicle visualization.

### Actions:
1. Click **Edit Mode** button to enable layout changes
2. **Select and merge 6 cells** in a 3x2 grid arrangement for the main display area
3. Click **Add Widget** and select **3D Car Unity** from the widget marketplace
4. Click **Save** to preserve your dashboard configuration



![Add 3D car model to dashboard](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.2_merge_6_cells_and_put_car.gif)

## Step 3: Add Signal Control Table

**Objective**: Create manual testing controls and real-time signal monitoring.

### Actions:
1. **Merge 2 cells** for control panel
2. Add **Signal Table Widget**
3. Add these signals for monitoring and control:
\`\`\`
Vehicle.Cabin.Door.Row1.DriverSide.IsOpen
Vehicle.Cabin.Light.AmbientLight.Row1.DriverSide.Color
Vehicle.Cabin.Light.AmbientLight.Row1.DriverSide.IsLightOn
Vehicle.Cabin.Light.AmbientLight.Row1.PassengerSide.Color
Vehicle.Cabin.Light.AmbientLight.Row1.PassengerSide.IsLightOn
\`\`\`


![Add signal table widget](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.3_add_table_widget_and_signals.gif)

<details>
<summary><strong> Signal Selection Flexibility</strong></summary>

The Signal Table widget is highly customizable - you can monitor and control **any vehicle signal** by adding it to the APIs configuration list. The signals listed above are specific to our Smart Ambient Light prototype, but you're free to:

- **Add additional signals** for expanded testing capabilities
- **Remove unnecessary signals** to simplify your testing interface  
- **Modify signal paths** to match your specific vehicle model or use case

Simply add any signal path to the widget configuration, and it will automatically appear in your control table with real-time monitoring and manual override capabilities.

</details>

## Step 4: Test Dashboard Interaction

**Objective**: Verify dashboard responds to manual input.

### Actions:
1. **Click on door handle** in 3D model
2. **Watch door open** visually
3. **Check signal table** for value changes
4. **Manually edit signals** in table
5. **Verify 3D model responds** to manual changes

![Interact with 3D car model](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.4_play_around_3d_car.gif)

![Manual signal manipulation through table](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.4_play_around_table.gif)

## Dashboard Layout

**Final layout should have**:
- **Large 3D car model** (6 cells) - main interaction area
- **Signal control table** (2 cells) - testing controls
- **Remaining space** - available for additional widgets

## Testing Capabilities

Your dashboard now provides:
- **Visual interaction** - Click car parts to trigger events
- **Manual signal control** - Edit signal values directly
- **Real-time feedback** - See immediate visual changes
- **Debugging support** - Monitor all signal states

## What's Next

✅ Dashboard layout created  
✅ 3D car model added  
✅ Signal control table configured  
✅ Interactive testing ready  

Now run your application and test the complete functionality!
`
    },
    {
        slug: 'run_and_test_app',
        name: "Run & Test Application",
        description: "Execute your prototype and validate the Smart Ambient Light functionality",
        duration: "8 minutes",
        type: "text-markdown",
        markdown_content: `
# Run & Test Application

Execute your complete **Smart Ambient Light** prototype and verify it works as designed.


## Run Your Application and Test Door Opening Event

**Objective**: Verify door opening triggers ambient lighting.

### Start Your Application

Hit the **run button**, button with white play icon on the right bar


### Testing Methods:


#### **Method A** - 3D Model Interaction:
1. **Click door handle** on 3D car model
2. **Watch door open** visually
3. **See ambient lights** activate automatically
4. **Check signal table** values update


#### **Method B** - Manual Signal Control:
1. **Find door signal** in signal table
2. Click **ON** button to set signal to true
3. **Watch door open** visually
4. **Watch lights activate** in 3D model

> **Remember**: Our code logic triggers on signal **changes**, not just values. So toggling OFF→ON creates the change event that activates the lights. You can play with the signal value in the table to see how it works.


![Complete prototype demonstration](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/6.result.gif)


### Validation Checklist:

✅ **Python app starts** without errors  
✅ **Door signal subscription** works  
✅ **Door opening detected** (console logs)  
✅ **Ambient lights activate** automatically  
✅ **Correct color applied** (cyan #00FFFF)  
✅ **Both sides illuminate** (driver + passenger)  
✅ **3D model shows changes** visually  
✅ **Signal table updates** in real-time  

## Troubleshooting Quick Fixes

#### **If run button is disabled** (grayed out):
- It means no **sdv-runtime** is selected. Your Python code needs a runtime environment to execute. Make sure you have selected an appropriate sdv-runtime from the runtime selector before attempting to run your application.

![Runtime selection and execution log](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/7.runtime_and_log.gif)


#### **If lights don't activate**:
- Check console for error messages
- Verify signal paths in code match your model
- Ensure door signal subscription is working

#### **If 3D model doesn't respond**:
- Refresh dashboard
- Check widget configuration
- Verify signals are connected properly

#### **If manual signals don't work**:
- Check signal table configuration
- Verify you're editing the correct signals
- Ensure signal paths are correct

## Success Indicators

**Your prototype is working when**:
1. **Door opens** → **Lights turn on** automatically
2. **Console shows** event processing messages
3. **3D visualization** reflects real-time changes
4. **Signal monitoring** shows correct values
5. **Manual testing** produces expected responses

## Performance Expectations

- **Response time**: Lights should activate within 500ms
- **Reliability**: 100% success rate on door opening
- **Visual feedback**: Immediate lighting changes in 3D model
- **Signal accuracy**: Real-time signal value updates

## What You've Built

🚗 **Smart Ambient Light Feature**:
- Detects driver door opening automatically
- Activates ambient lighting instantly
- Controls both driver and passenger side lights
- Provides professional visual feedback
- Demonstrates real vehicle software patterns

Your Smart Ambient Light prototype is now complete and demonstrates core automotive software development skills!
`
    },
    {
        slug: 'additional_resources',
        name: "Additional Resources & Next Steps",
        description: "Explore advanced features, troubleshooting, and enhancement opportunities",
        duration: "5 minutes",
        type: "text-markdown",
        markdown_content: `
# Additional Resources & Next Steps

## What You've Accomplished

Congratulations! You've successfully built a complete Smart Ambient Light prototype that demonstrates professional automotive software development practices.

### Skills Gained:
✅ Vehicle model configuration and signal discovery  
✅ Event-driven Python programming for vehicles  
✅ Real-time signal processing and control  
✅ Interactive dashboard design and testing  
✅ Complete prototype development lifecycle  

## Enhancement Ideas

### Easy Improvements:
- **Door closing detection** - Turn off lights when door closes
- **Different colors** - Use different colors for different times of day
- **Fade effects** - Gradual light activation/deactivation
- **Multiple doors** - Extend to all vehicle doors

### Advanced Features:
- **User preferences** - Remember user's preferred lighting settings
- **Context awareness** - Adjust based on ambient light conditions
- **Integration** - Connect with other vehicle systems
- **Animation patterns** - Create dynamic lighting sequences

## Code Examples for Enhancements

### Turn Off Lights When Door Closes:
\`\`\`python
if value:  # Door opened
    await self.activate_lights()
else:  # Door closed
    await self.deactivate_lights()
\`\`\`

### Multiple Door Support:
\`\`\`python
# Subscribe to all doors
await self.Vehicle.Cabin.Door.Row1.PassengerSide.IsOpen.subscribe(
    self.on_passenger_door_opened
)
await self.Vehicle.Cabin.Door.Row2.DriverSide.IsOpen.subscribe(
    self.on_rear_door_opened
)
\`\`\`

### Dynamic Color Control:
\`\`\`python
import datetime

def get_ambient_color(self):
    hour = datetime.datetime.now().hour
    if 6 <= hour < 18:  # Daytime
        return "#87CEEB"  # Light blue
    else:  # Nighttime
        return "#FF6600"  # Warm orange
\`\`\`

## Troubleshooting Guide

### Common Issues:

#### **Application won't start**:
- Check Python syntax and indentation
- Verify all import statements
- Ensure vehicle model compatibility

#### **Signals not responding**:
- Confirm signal paths match your vehicle model
- Check COVESA VSS version compatibility
- Verify subscription syntax

#### **Dashboard not updating**:
- Refresh browser page
- Check widget configuration
- Verify signal selection in table

#### **3D model issues**:
- Clear browser cache
- Check network connectivity
- Try different browser

## Congratulations!

You've completed a comprehensive automotive software development project that demonstrates:

🚗 **Technical Skills**: Real vehicle signal processing and control  
🛠️ **Development Tools**: Professional automotive development environment  
🎨 **User Experience**: Interactive visualization and testing  
📊 **Project Management**: Complete development lifecycle execution  

Keep building, keep learning, and welcome to the exciting world of Software-Defined Vehicles! 🚗✨
`
    },
    {
        slug: 'prototype_creation_quiz',
        name: "Smart Ambient Light Prototype Quiz",
        description: "This quiz evaluates your understanding of prototype creation, Python vehicle app development, dashboard design, and testing in the digital.auto playground.",
        type: "quiz",
        questions: [
            {
                "question": "What signals are required for the Smart Ambient Light prototype to detect when the driver door opens?",
                "answers": [
                    {
                        "label": "Vehicle.Cabin.Door.Row1.DriverSide.IsOpen",
                        "is_correct": true
                    },
                    {
                        "label": "Vehicle.Body.Door.DriverSide.Status"
                    },
                    {
                        "label": "Vehicle.Cabin.Seat.Row1.DriverSide.IsOccupied"
                    },
                    {
                        "label": "Vehicle.Engine.IsRunning"
                    }
                ]
            },
            {
                "question": "Which COVESA VSS version is recommended for learning and stability when creating a new vehicle model?",
                "answers": [
                    {
                        "label": "COVESA VSS v5.0"
                    },
                    {
                        "label": "COVESA VSS v4.1",
                        "is_correct": true
                    },
                    {
                        "label": "COVESA VSS v3.0"
                    },
                    {
                        "label": "COVESA VSS v4.2rc0"
                    }
                ]
            },
            {
                "question": "What is the primary purpose of the customer journey step in prototype development?",
                "answers": [
                    {
                        "label": "To create technical documentation"
                    },
                    {
                        "label": "To define the real-world problem and user experience being created",
                        "is_correct": true
                    },
                    {
                        "label": "To test the Python code"
                    },
                    {
                        "label": "To configure the vehicle signals"
                    }
                ]
            },
            {
                "question": "In the Python code, what method is used to listen for changes to vehicle signals?",
                "answers": [
                    {
                        "label": "get()"
                    },
                    {
                        "label": "set()"
                    },
                    {
                        "label": "subscribe()",
                        "is_correct": true
                    },
                    {
                        "label": "listen()"
                    }
                ]
            },
            {
                "question": "What Eclipse framework does the Python vehicle app development follow?",
                "answers": [
                    {
                        "label": "Eclipse Che"
                    },
                    {
                        "label": "Eclipse Velocitas",
                        "is_correct": true
                    },
                    {
                        "label": "Eclipse IDE"
                    },
                    {
                        "label": "Eclipse Mosquitto"
                    }
                ]
            },
            {
                "question": "What color code is used for the ambient light in the Smart Ambient Light prototype?",
                "answers": [
                    {
                        "label": "#FF0000 (Red)"
                    },
                    {
                        "label": "#00FF00 (Green)"
                    },
                    {
                        "label": "#00FFFF (Cyan)",
                        "is_correct": true
                    },
                    {
                        "label": "#FFFF00 (Yellow)"
                    }
                ]
            },
            {
                "question": "How many cells should be merged for the 3D car model widget in the dashboard layout?",
                "answers": [
                    {
                        "label": "4 cells"
                    },
                    {
                        "label": "6 cells",
                        "is_correct": true
                    },
                    {
                        "label": "8 cells"
                    },
                    {
                        "label": "10 cells"
                    }
                ]
            },
            {
                "question": "What are the two main testing methods described for validating the Smart Ambient Light prototype?",
                "answers": [
                    {
                        "label": "Code debugging and signal monitoring"
                    },
                    {
                        "label": "3D Model Interaction and Manual Signal Control",
                        "is_correct": true
                    },
                    {
                        "label": "Hardware testing and software simulation"
                    },
                    {
                        "label": "Unit testing and integration testing"
                    }
                ]
            },
            {
                "question": "Why might the run button be disabled (grayed out) when trying to execute the Python application?",
                "answers": [
                    {
                        "label": "The Python code has syntax errors"
                    },
                    {
                        "label": "No sdv-runtime is selected",
                        "is_correct": true
                    },
                    {
                        "label": "The dashboard is not configured properly"
                    },
                    {
                        "label": "The vehicle model is missing signals"
                    }
                ]
            },
            {
                "question": "According to the code logic, what triggers the ambient light activation?",
                "answers": [
                    {
                        "label": "When the door signal value is true"
                    },
                    {
                        "label": "When the door signal changes from false to true",
                        "is_correct": true
                    },
                    {
                        "label": "When the car engine starts"
                    },
                    {
                        "label": "When a passenger enters the vehicle"
                    }
                ]
            }
        ]
    }
]