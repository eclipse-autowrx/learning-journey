export const welcome_lessons = [
    {
        slug: 'playground_introduction',
        name: "Playground introduction",
        description: "Introduction to digital.auto playground",
        duration: "5m28",
        type: "video",
        video_url: "https://www.youtube.com/embed/K3pindMCq1c?si=xpK20Y9Wyeu3C2KC",
        markdown_content: `
**Summary of the Digital Auto Playground Introduction**

The video introduces the **digital auto playground**, described as a landing page where users can find everything needed to get started. This includes an overview, getting started guide, **vehicle catalog**, top news, recent prototypes, and popular prototypes.

A key feature is the **vehicle catalog**, which allows users to explore different vehicles. For each vehicle, there is information on its high-level architecture, **vehicle signals**, and Prototype Library. The vehicle signals utilize the **COVESA Vehicle Signal Specification (VSS)**. The VSS catalog is accessible to the left. Users can explore signals for various parts of the vehicle, such as the hood, door, or something as basic as the front wiping system. Opening a system like the front wiping system reveals all actuators and sensors related to its functionality.

The playground allows users to **build prototypes** using these signals. A simple example is a prototype where turning on the wipers and then opening the vehicle's trunk automatically turns off the wipers. This requires code, often using Python mappings of the COVESA VSS vehicle APIs. The example code shows how wipers are turned off within a function. This prototype can be tested in a cloud-based dashboard where the wipers and hood signals are visualized. Executing the prototype shows the wiper turning on, and after a delay (6 seconds in the example), the hood opening, which triggers the function to power down the wipers.

More sophisticated prototypes are also possible, such as a **passenger welcome sequence**. This journey involves detecting the driver's proximity, opening the door, turning on the ambient lights, and then adjusting the seat according to user preferences. This requires a more sophisticated architecture, potentially involving customer data in the cloud to pass permissions and preferences like seat position to the vehicle onboard. The passenger welcome sequence is executed in an STV runtime and uses the COVESA VSS signal-to-service API to control actions like opening the door. These actions need to be performed safely, potentially requiring checks like camera views. The code for this prototype is more complex and uses signals like cabin door driver side, cabin light, and seat. The flow between onboard and offboard systems can be analyzed. The cloud-based dashboard visualizes the different VSS APIs used (door, light, seat, and so on). Executing this prototype demonstrates the door opening, light going on, and the seat being adjusted.

The playground serves as a **cloud-based test environment**. A significant benefit is the ability to migrate these cloud-based prototypes to test hardware or even a test vehicle in later stages. Because the **COVESA VSS is used as the hardware abstraction layer**, the core algorithm itself does not care whether it's running in the cloud, on the test hardware, or in the real vehicle. This enables a **shift-left testing strategy**, allowing for early feedback from key stakeholders, validation of high-level architecture and the APIs that are needed, and then step-by-step migration to test environments.

Users are encouraged to try the playground themselves by visiting playground.digital.auto.

Regarding your request for images from the video, I am unable to provide those based on the text transcript provided as the source. My capabilities are limited to processing and generating text from the information given to me.

`
    },
    {
        slug: 'playground_overview_text',
        name: "Playground Introduction Text",
        description: "Overview of the digitalauto playground",
        type: "text-markdown",
        markdown_content: `
# Welcome to the digitalauto Playground!

This introduction will guide you through the key features and capabilities of the digitalauto playground, a powerful environment for automotive software development and testing.

## Getting Started

Upon arriving at the landing page, you'll find everything you need to get started, including an overview, getting started guides, the vehicle catalog, top news, and both recent and popular prototypes.


![Digital Auto Playground Landing Page](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/onboard/homepage.png)


## Vehicle Catalog

The **Vehicle Catalog** is where you can explore various vehicle models. For each vehicle, you'll find its high-level architecture, vehicle signals, and a Prototype Library.

![Vehicle Catalog Screenshot](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/overview/vechile-api.png)

### COVESA Vehicle Signal Specification (VSS)

The vehicle signals within the playground utilize the **COVESA Vehicle Signal Specification (VSS)**. You can access the VSS catalog to the left, which lists various vehicle components like the hood, door, or the front wiping system. When you open a component, you'll see all the actuators and sensors related to its functionality.



## Prototype Library

The Playground allows you to build and test prototypes using these vehicle signals.

### Example 1: Simple Wiper Prototype

A simple prototype might involve a customer journey where if someone turns on the wipers and then the vehicle's trunk is opened, the wipers automatically turn off. This requires a small piece of code utilizing Python mappings of the COVESA VSS Vehicle APIs. For instance, you can define how to turn off the wipers within a specific function.

![VSS Catalog Sidebar](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/overview/python_vss.png)

You can then test this by turning on the wipers to medium speed and opening the hood.

### Cloud-Based Dashboard & Testing

The playground features a **cloud-based dashboard** that visualizes the signals you are using, such as wipers and hood status. When you start a simulation, you can observe the wiper operating, and after a set time (e.g., 6 seconds), the hood opening triggers the defined function to power down the wipers.

![Cloud-Based Dashboard Visualization](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/overview/wiper.gif)

### Example 2: Sophisticated Passenger Welcome Sequence

More complex prototypes are also possible, such as a **passenger welcome sequence**. This involves detecting the driver's proximity, then initiating a sequence to open the door, turn on ambient lights, and adjust the seat according to user preferences.

This sophisticated architecture involves customer data in the cloud, requiring the passing of permissions and preferences (like seat position) to the vehicle onboard. The passenger welcome sequence is executed in the STV runtime, using the COVESA VSS signal-to-service API to safely open the door (with camera checks for safety) and then control lights and seat adjustments. This requires more complex code involving cabin door, cabin light, and seat APIs.

![Passenger Welcome Sequence Execution](https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/overview/passenger-welcome.gif)

## Shift-Left Testing Strategy

A key benefit of the digitalauto playground is its support for a **shift-left testing strategy**. Because the playground uses **COVESA VSS as the hardware abstraction layer**, the algorithms you develop do not care whether they are running in the cloud, on test hardware, or in a real vehicle.

This enables you to:
*   Implement algorithms early in the development cycle.
*   Get early feedback from key stakeholders.
*   Validate your high-level architecture.
*   Validate the necessary APIs.
*   Step-by-step move your algorithms to different test environments and ultimately to a real vehicle.

## Get Started Today!

Try it out yourself and implement your own prototypes. Visit **playground.digital.auto** to get started and enjoy the experience!
`
    }
]