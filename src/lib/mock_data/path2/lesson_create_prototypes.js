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

![Creating or Selecting a Vehicle Model](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/vehicle_model/create_new_model.gif)

## Step 2: Create Prototype Workspace

**Objective**: Set up your development environment.

### Actions:
1. Open **Prototype Library**
2. Click **"+ Create New Prototype"**
3. Name it: **"Smart Ambient Light"**
4. Add description: **"Automatic ambient lighting when door opens"**
5. Set visibility (public/private)

![Creating a New Prototype](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/1.0_create_prototype.gif)

## Step 3: Design User Journey

**Objective**: Map out what happens when the user opens the car door.

### Actions:
1. Go to **Journey** tab
2. Create new journey or use template
3. Define simple flow:
   - User approaches car
   - Opens driver door (trigger)
   - Ambient lights turn on automatically
   - User gets enhanced visibility

![Defining the Customer Journey](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/2.0_customer_journey.gif)

## Required Signals

Your prototype will use these signals:
- **Input**: \`Vehicle.Cabin.Door.Row1.DriverSide.IsOpen\` (detects door opening)
- **Output**: \`Vehicle.Cabin.Light.AmbientLight.Row1.*.Color\` (sets light color)
- **Output**: \`Vehicle.Cabin.Light.AmbientLight.Row1.*.IsLightOn\` (turns lights on/off)

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

## Step 1: Setup Development Environment

**Objective**: Prepare your coding environment.

### Actions:
1. Go to **SDV Code** tab
2. Clear any existing sample code
3. Start with clean workspace

![Initializing on_start function](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/4.1_navigate_to_code_and_remove_sample.gif)

## Step 2: Find Required Signals

**Objective**: Discover the exact signal paths you need.

### Actions:
1. Use **Signal Browser** (right panel)
2. Search for **"driver"** to find door signal
3. Find: \`Vehicle.Cabin.Door.Row1.DriverSide.IsOpen\`
4. Note the signal path for your code

![Searching for relevant vehicle signals](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/4.2_search_driver_door_signal_and_subscribe.gif)

## Step 3: Write Event Handler

**Objective**: Create function that responds to door opening.

### Actions:
1. Write the door event handler function
2. Extract door state from signal data
3. Add logic to activate lights when door opens

![Writing the door event handler function](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/4.3_receive_door_open_event.gif)

## Step 4: Add Light Control

**Objective**: Control ambient lighting when door opens.

### Actions:
1. Set light color to cyan (#00FFFF)
2. Turn on lights for both driver and passenger sides
3. Add console logging for debugging

![Setting ambient light when door opens](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/4.4_turn_on_ambient_light_if_door_open.gif)

## Complete Code

Here's the complete working code:

\\\`\\\`\\\`python
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
\\\`\\\`\\\`

## Key Components

- **Event Handler**: \`on_driver_door_opened()\` responds to door changes
- **Signal Subscription**: \`subscribe()\` connects door signal to handler
- **Light Control**: \`set()\` commands control ambient lighting
- **Async Pattern**: All functions use \`async/await\` for real-time response

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

## Dashboard Overview

Build an interactive testing interface with 3D visualization and manual signal controls.

## Step 1: Setup Dashboard Layout

**Objective**: Create clean workspace for your widgets.

### Actions:
1. Go to **Dashboard** tab
2. Clear all existing widgets
3. Prepare 5×2 grid layout (10 cells total)

![Navigate to dashboard and clear widgets](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.1_navigate_to_dashboard_clear_all.gif)

## Step 2: Add 3D Car Model

**Objective**: Add interactive vehicle visualization.

### Actions:
1. **Merge 6 cells** (3×2 area) for main display
2. Add **3D Car Widget** from marketplace
3. Configure to show your vehicle model
4. Test door interaction (clicking door handle)

![Add 3D car model to dashboard](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.2_merge_6_cells_and_put_car.gif)

## Step 3: Add Signal Control Table

**Objective**: Create manual testing controls.

### Actions:
1. **Merge 2 cells** for control panel
2. Add **Signal Table Widget**
3. Add these signals for monitoring and control:
   - \`Vehicle.Cabin.Door.Row1.DriverSide.IsOpen\`
   - \`Vehicle.Cabin.Light.AmbientLight.Row1.DriverSide.Color\`
   - \`Vehicle.Cabin.Light.AmbientLight.Row1.DriverSide.IsLightOn\`
   - \`Vehicle.Cabin.Light.AmbientLight.Row1.PassengerSide.Color\`
   - \`Vehicle.Cabin.Light.AmbientLight.Row1.PassengerSide.IsLightOn\`

![Add signal table widget](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/5.3_add_table_widget_and_signals.gif)

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

## Final Testing

Execute your complete Smart Ambient Light prototype and verify it works as designed.

## Step 1: Run Your Application

**Objective**: Start your Python application.

### Actions:
1. Make sure your **Python code is complete**
2. Select appropriate **SDV Runtime**
3. **Run your application** using the execute button
4. **Watch console logs** for startup messages
5. **Verify** "Smart Ambient Light ready" message appears

## Step 2: Test Door Opening Event

**Objective**: Verify door opening triggers ambient lighting.

### Testing Methods:

**Method A - 3D Model Interaction**:
1. **Click door handle** on 3D car model
2. **Watch door open** visually
3. **See ambient lights** activate automatically
4. **Check signal table** values update

**Method B - Manual Signal Control**:
1. **Find door signal** in signal table
2. **Click signal value** to edit
3. **Change to "true"** (door open)
4. **Watch lights activate** in 3D model

![Complete prototype demonstration](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/6.result.gif)

## Step 3: Validate Complete Functionality

**Objective**: Confirm all components work together.

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

**If lights don't activate**:
- Check console for error messages
- Verify signal paths in code match your model
- Ensure door signal subscription is working

**If 3D model doesn't respond**:
- Refresh dashboard
- Check widget configuration
- Verify signals are connected properly

**If manual signals don't work**:
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

## What's Next

✅ **Working prototype** complete  
✅ **End-to-end functionality** validated  
✅ **Professional demonstration** ready  

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
\\\`\\\`\\\`python
if value:  # Door opened
    await self.activate_lights()
else:  # Door closed
    await self.deactivate_lights()
\\\`\\\`\\\`

### Multiple Door Support:
\\\`\\\`\\\`python
# Subscribe to all doors
await self.Vehicle.Cabin.Door.Row1.PassengerSide.IsOpen.subscribe(
    self.on_passenger_door_opened
)
await self.Vehicle.Cabin.Door.Row2.DriverSide.IsOpen.subscribe(
    self.on_rear_door_opened
)
\\\`\\\`\\\`

### Dynamic Color Control:
\\\`\\\`\\\`python
import datetime

def get_ambient_color(self):
    hour = datetime.datetime.now().hour
    if 6 <= hour < 18:  # Daytime
        return "#87CEEB"  # Light blue
    else:  # Nighttime
        return "#FF6600"  # Warm orange
\\\`\\\`\\\`

## Troubleshooting Guide

### Common Issues:

**Application won't start**:
- Check Python syntax and indentation
- Verify all import statements
- Ensure vehicle model compatibility

**Signals not responding**:
- Confirm signal paths match your vehicle model
- Check COVESA VSS version compatibility
- Verify subscription syntax

**Dashboard not updating**:
- Refresh browser page
- Check widget configuration
- Verify signal selection in table

**3D model issues**:
- Clear browser cache
- Check network connectivity
- Try different browser

## Learning Path Continuation

### Next Recommended Topics:
1. **Advanced Signal Processing** - Multi-signal event correlation
2. **Performance Optimization** - Efficient signal handling patterns
3. **User Interface Design** - Custom dashboard widgets
4. **System Integration** - Cloud connectivity and external APIs
5. **Production Deployment** - Scaling prototypes for real vehicles

### Professional Development:
- **COVESA Standards** - Deep dive into Vehicle Signal Specification
- **Automotive Architecture** - Software-defined vehicle concepts
- **Safety Standards** - ISO 26262 and automotive safety
- **Real Vehicle Testing** - Hardware-in-the-loop testing methods

## Community and Support

### Getting Help:
- **Documentation** - Platform documentation and API references
- **Community Forums** - Connect with other automotive developers
- **Sample Projects** - Explore more complex prototype examples
- **Tutorials** - Additional hands-on learning content

### Sharing Your Work:
- **Portfolio Project** - Add to your development portfolio
- **Team Collaboration** - Share with colleagues and stakeholders
- **Open Source** - Contribute to automotive development community
- **Professional Network** - Demonstrate skills to potential employers

## Congratulations!

You've completed a comprehensive automotive software development project that demonstrates:

🚗 **Technical Skills**: Real vehicle signal processing and control  
🛠️ **Development Tools**: Professional automotive development environment  
🎨 **User Experience**: Interactive visualization and testing  
📊 **Project Management**: Complete development lifecycle execution  

Your Smart Ambient Light prototype showcases the core competencies needed for modern automotive software development roles.

## Ready for Production?

While this prototype demonstrates the core concepts, production-ready features would require:
- **Safety validation** and compliance testing
- **Performance optimization** for real-time constraints
- **Error handling** for edge cases and failure modes
- **Security implementation** for vehicle cybersecurity
- **Integration testing** with actual vehicle hardware

Keep building, keep learning, and welcome to the exciting world of Software-Defined Vehicles! 🚗✨
`
    }
]