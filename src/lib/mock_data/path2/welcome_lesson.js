// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

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
        slug: 'overview',
        name: "Overview",
        description: "",
        type: "text-markdown",
        markdown_content: `
### What is playground.digital.auto?

The playground.digital.auto is a cloud-based, rapid prototyping environment for new, SDV-enabled features. The prototypes are built against real-world vehicle APIs and can be seamlessly migrated to automotive runtimes, such as Eclipse Velocitas. The playground is open and free to use at [playground.digital.auto](https://digitalauto.netlify.app/).

The playground is designed to foster continuous, customer-centric digital innovation. By supporting the new way of thinking and working digital first, digital.auto enables developers to deliver fast tangible results and early validation. Prototypes are developed in Python. To interact with vehicle sensors and actuators, the COVESA [Vehicle Signal Specification (VSS)](https://wiki.covesa.global/display/WIK4/VSS+-+Vehicle+Signal+Specification) is used. In the browser environment of the playground, the vehicle sensors and actuators are mocked, using simple test values. Access to VSS in Python is provided via the emerging VSS Python mapping, as defined by the [Eclipse Velocitas](https://projects.eclipse.org/projects/automotive.velocitas) project (part of Eclipse SdV). As we will discuss in the following, access to more sophisticated vehicle simulation environments or even real sensors and actuators is possible via a cloud bridge mechanism.

Also, please check out the following additional resources:

- [Overview video](https://drive.google.com/file/d/1qYfakx6E592PWBtPzAc_m_LrmBsvaI9K/view) of digital.auto playground
- [Introduction](https://drive.google.com/file/d/1Z-tv5COhmX-lQGtHMSUZWLuvv5PoFAFR/view) to digital.auto playground plugin development
- digital.auto playground [widget documentation](https://playground-plugins.netlify.app/)

![playground.digital.auto](https://docs.digital.auto/docs/_v1_archive/basics/intro/HomePage.png)

### Why playground.digital.auto?
The playground.digital.auto enables early prototyping which has two main benefits:
- **Customer-centric innovation from the start:** Early customer feedback helps to learn which ideas have highest potential for customer value creation. This helps minimizing investments in unpopular features. Fine-tuning the customer journey design early is key for customer acceptance. Of course this does not mean that the software should not constantly be improved later on, even after the start of production. After all, this is why DevOps pipelines with OTA for remote vehicle updates are currently being established.

- **Fast delivery of tangible, validated results:** Doing early prototyping also has many benefits from the development perspective: Having a functional mockup early on in the development cycle helps improving transparency between business/IT, across regional and organizational boundaries. It also helps to validate architecture decisions early on, as well as to have a consistent enterprise architecture across all features. Finally, being able to identify API requirements as early as possible is key, because providing an API which encapsulates hardware usually has a very long lead time. This is especially true for hardware and APIs coming from external suppliers.

![value_of_early_prototype](https://docs.digital.auto/docs/_v1_archive/basics/intro/Value_of_early_prototyping.png)

### Value streams

The following is looking at both, **the digital and physical value stream** in digital.auto, followed by a discussion of the evolution of code in the digital value stream.

### Digital and physical value stream

The digital.auto playground is designed to support the general philosophy of digital.auto, which is assuming two distinct value streams, moving at different speeds: The physical and the digital value stream. These two value streams are de-coupled via a Hardware Abstraction Layer (HAL), which is encapsulating the complexities of vehicle physics, embedded systems, and bus systems. Software components developed in the digital value stream are accessing vehicle functions via well defined interfaces (e.g. VSS). This de-coupling allows components north and south of the API to be (more or less) seamlessly interchanged. For example, a prototype in the playground can first run against simple test values provided by VSS mock implementations in the playground. Next, one might plug in a real vehicle simulation, running south of the API, and providing a more realistic system behavior. Finally, the simulation will be replaced by hardware with real sensors and actuators - starting with a breadboard, and eventually the final vehicle.

![value](https://docs.digital.auto/docs/_v1_archive/basics/intro/Value_Streams.png)

Similarly, north of the API, new SdV features can initially be developed in Python in the playground. Next, the SdV prototype code can be deployed to a professional development environment - as provided, for example, by [Eclipse Velocitas](https://projects.eclipse.org/projects/automotive.velocitas). In this environment, the new SdV feature can first be tested in the cloud, before finally being deployed on a vehicle computer.

### Code evolution in the digital value stream

In order for the SdV code not to break when moving from the playground to the real development environment, the VSS Python APIs are currently being standardized by the Eclipse community. This allows to migrate code more easily between different environments. For example, as described in the figure below, an SdV function might initially be implemented as a prototype in the digital.auto playground. After the initial customer validation, the decision is made to migrate the code from the prototyping environment to the professional development environment, including proper support for CI/CD. This can be done easily because of the standardization of the Python APIs. In fact, the next release of the playground will have built-in support to deploy into Eclipse Velocitas by creating a complete Velocitas project in GitHub, based on the initial prototype.

![value](https://docs.digital.auto/docs/_v1_archive/basics/intro/Deployment_and_code_evolution.png)

> One important note: Even if the final target language for the production system is not Python - but maybe C++ or Rust - having a Python prototype for early vehicle tests is extremely valuable, because it helps getting an end-to-end implementation done quickly, and stabilizing the APIs between the distributed components.



### Summary

The following provides an overview of all elements involved: A vehicle model in the playground includes one instance of a VSS catalogue (e.g. the YAML definition file with all the VSS definitions), n number of plugin implementations, and n number of SdV prototypes.

The VSS catalogue can be extended to use VSS Wishlist items, defined ad-hoc by different prototypes. digital.auto and COVESA are currently working on a way to submit items from the VSS Wishlist to the COVESA process for standardization of VSS.

Plugins are defining simulators and widgets. Widgets are providing the UX for simulators (defined in the same of other plugins). In the future, each plugin will be associated with one SdV prototype for documentation purposes, as well as for defining the VSS wishlist APIs which might be required by the plugin.

SdV prototypes are using plugins. In order to use a plugin, the configuration will have to state where exactly the required widgets should be played on the prototype-specific version of the playground grid.

![Playground_Element](https://docs.digital.auto/docs/_v1_archive/basics/intro/All_Playground_Elements.png)
`
    }
]