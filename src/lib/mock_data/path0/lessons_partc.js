// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

export const lessons_partc = [
    {
        slug: 'overview',
        name: "Overview",
        description: "",
        type: "text-markdown",
        markdown_content: `

In this section, we explore the foundational components that enable Software-Defined Vehicles (SDVs) to transform the automotive industry. At the heart of this transformation lies the intricate interdependency between the Electrical/Electronic (E/E) Architecture and SDV.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FW3j7oXYEkkGGYxw1jZqF%252Fimage.png%3Falt%3Dmedia%26token%3De137b204-2bd3-4d70-aea7-854499d57294&width=768&dpr=4&quality=100&sign=95dda74a&sv=2)

E/E Architecture serves as the bridge connecting the mechanical systems of the vehicle, its power distribution network, and connectivity infrastructure with the software layers. It ensures that these traditionally hardware-dominated domains can support the dynamic, real-time demands of modern automotive software systems.

Meanwhile, SDVs build on this foundation by introducing software-enabled vehicle experiences, creating a seamless blend of hardware capabilities and advanced digital services. Together, E/E Architecture and SDVs form the backbone of the next generation of connected, intelligent vehicles.

In this chapter, we delve into the key building blocks of software-defined vehicles (SDVs), exploring the critical integration of modern E/E architectures, such as domain-centralized and zonal high-performance computing (HPC) systems, with SDV-enabling technologies. These include service-oriented architectures (SOA), container runtimes, vehicle APIs, functional safety measures, over-the-air (OTA) updates, and the transformative potential of vehicle app stores—all built on robust modern tech stacks.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FZ8Vpg2ri4ynGEhiDNZYR%252Fimage.png%3Falt%3Dmedia%26token%3Dc5204a60-7fe6-4c79-8364-5872d1a166b5&width=768&dpr=4&quality=100&sign=25f4730c&sv=2)
`
    },
    {
        slug: 'foundation-e-e-architecture',
        name: "Foundation: E/E Architecture",
        description: "",
        type: "text-markdown",
        markdown_content: `
# Foundation: E/E Architecture

E/E Architecture stands for Electrical and Electronic Architecture, forming the backbone of modern vehicles by integrating power systems with advanced computing.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FRByXyeUFTKg45OwFFbA9%252Fimage.png%3Falt%3Dmedia%26token%3D394b95a3-3a5e-4f4d-b415-e6e1a4154efd&width=768&dpr=4&quality=100&sign=3e771f9c&sv=2)

The **electrical** components manage the transmission and distribution of power throughout the vehicle. This includes the wiring harness, battery, power distribution units, electrical connectors, and fuses. On the other hand, the **electronics** process information and execute functions through circuits and microcontrollers, ranging from lower-level endpoint ECUs (Electronic Control Units) to high-performance compute ECUs designed to run complex algorithms for AD (Automated Driving), ADAS (Advanced Driver Assistance Systems), sensors, and actuators.

## Key Elements of the E/E Architecture

Traditionally, the E/E Architecture is structured hierarchically:

1.  **Domain Level**: Encompasses functional areas such as powertrain, chassis, and infotainment.
2.  **System Level**: Defines individual systems, for example, engine management and brake control systems.
3.  **Component Level**: Contains specific hardware and software components to form the complete system.

### Components

Key components of the E/E Architecture include:

-   **Control Units (ECUs)**: Manage specific vehicle functions. They process data and control various systems.
-   **Sensors**: Gather real-time data from the vehicle's environment or interior. They provide crucial input for system operations.
-   **Actuators**: Convert electrical signals into mechanical actions. They execute commands from control units.
-   **Communication Networks**: They enable seamless communication between components.

### E/E Communication Networks

Networks like CAN, LIN, and FlexRay facilitate data exchange and enable seamless communication between components like ECUs, sensors, and actuators.

-   **CAN (Controller Area Network)**: A widely established, robust protocol for high-speed communication, predominantly used in powertrain and chassis systems.
-   **LIN (Local Interconnect Network)**: A cost-effective, efficient solution for non-critical applications, commonly used in body electronics.
-   **FlexRay**: A high-speed, deterministic protocol used in safety-critical systems like drive-by-wire and brake-by-wire.
-   **Automotive Ethernet**: Adapted from Internet Ethernet technology, automotive Ethernet is increasingly used for high-bandwidth applications in modern vehicles.

By tying together these components and communication networks, E/E Architecture enables the seamless interaction of mechanical, electrical, and software systems, laying the foundation for the evolution of Software-Defined Vehicles.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FWrb0TBxvD2Y685F5ftFY%252Fimage.png%3Falt%3Dmedia%26token%3D567cf4e0-4df4-4252-97b7-c9bc50009c1d&width=768&dpr=4&quality=100&sign=16ce37ee&sv=2)


# Today's E/E Architectures

Currently, in most modern vehicles, Electrical/Electronic (E/E) architectures feature a very large number of highly specialized ECUs and extremely complex wiring harnesses.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252Ftp8Oe4TD65zoYtSMlqko%252Fimage.png%3Falt%3Dmedia%26token%3D212d7aa7-1db2-4099-ace7-f407d11b70a6&width=768&dpr=4&quality=100&sign=11a521ad&sv=2)

For example, compact cars today may contain up to 70 ECUs, while high-end cars can include up to 150 ECUs. Similarly, the wiring harness in high-end cars can span up to 5 kilometers, weighing as much as 30 kilograms.

## Challenges in Today's E/E Architectures

The high number of ECUs and the complexity of the wiring harness present several challenges:

-   **Engineering Complexity**: Managing such intricate systems becomes increasingly difficult, particularly when coordinating multiple stakeholders, teams, and suppliers.
-   **Testing Difficulties**: The sheer number of components and connections makes comprehensive testing a significant challenge.
-   **Weight**: The weight of the wiring harness contributes to overall vehicle inefficiency.
-   **Manufacturing Complexity**: Building and testing vehicles with such elaborate architectures adds layers of difficulty to the production process.
-   **Maintenance and Repair**: Troubleshooting and fixing issues in these tightly coupled systems becomes progressively more complicated.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252Frrjn7BuuuP3YDRlSxaKZ%252Fimage.png%3Falt%3Dmedia%26token%3Dd356a41a-14fa-4505-b759-1894d6da1823&width=768&dpr=4&quality=100&sign=d42927a0&sv=2)

## Message Exchange in E/E Architectures

Modern vehicles feature dozens of ECUs exchanging thousands of messages, typically via the CAN protocol. For example:

-   **Engine Control and Diagnostics**: The engine control unit shares engine speed data with the transmission ECU to optimize gear shifting and with the dashboard for display.
-   **ASIL Examples**: Anti-lock braking systems use data from wheel speed sensors.
-   **QM Examples**: Climate control sensors collect cabin data and share it with the climate control ECU.

In a typical vehicle, there can be between 250 and 2,500 different CAN message types, with 500 to 5,000 messages exchanged per second when the car is operational.

## Tightly Coupled Architectures and Their Drawbacks

The CAN bus system creates an inherently tightly coupled system architecture, which introduces several technical limitations:

1.  **Direct Message Identification**: Hard-coded message IDs create direct dependencies between senders and receivers.
2.  **Fixed Network Topology**: A shared bus structure requires reconfiguration for changes, reinforcing tight coupling.
3.  **Dependency on Timing and Bandwidth**: Prioritized message arbitration limits flexibility and creates potential bottlenecks.
4.  **Limited Scalability**: Low bandwidth and static design hinder the addition of new ECUs or features.
5.  **Lack of Modular Abstraction**: The absence of dynamic addressing or abstraction layers impedes flexibility and future upgrades.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252F6d6dpMSY3SNNd5zI8Cp1%252Fimage.png%3Falt%3Dmedia%26token%3Dfd69a67a-97df-4811-9f07-38bd15035296&width=768&dpr=4&quality=100&sign=9f6618d1&sv=2)

## Organizational Consequences

The tight coupling imposed by CAN and similar architectures on a technical level has severe consequences on the organizational level. The increased cost and extended delivery times for new vehicle features or entire vehicle generations result from the additional overhead required to align multiple teams and organizations. These challenges make innovation slower and more expensive, highlighting the need for a shift toward more modular and scalable architectures.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FMBBJ7cfN0QP7AYPtpVP5%252Fimage.png%3Falt%3Dmedia%26token%3Dc1951c82-7ce3-499e-8818-f5fc41f00acd&width=768&dpr=4&quality=100&sign=13b9b0a1&sv=2)


# Evolving Trends in E/E Architecture

As automotive OEMs strive to address the challenges of traditional E/E architectures, several transformative trends are emerging to reshape the landscape. These trends aim to simplify complexity, enhance scalability, and future-proof vehicles for the software-defined era.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252F8lZbTpECKagtj7tTTUlN%252Fimage.png%3Falt%3Dmedia%26token%3D15dce370-d772-41eb-8d02-2eb6568409c4&width=768&dpr=4&quality=100&sign=6c63cd39&sv=2)

The first major trend is the **introduction of domain controllers**, which consolidate the functions of multiple specialized ECUs into fewer, more powerful domain-specific units. This approach streamlines vehicle design and reduces the overall complexity of hardware systems.

The second trend is **centralized computing**, where high-performance computing units manage diverse software and AI workloads across multiple domains. Centralized compute enables faster, more flexible software updates and supports advanced functionalities such as ADAS and infotainment.

Lastly, **zonal architectures** are gaining traction. These architectures organize the E/E system based on the physical layout of the vehicle, significantly reducing wiring complexity. Zone controllers handle the functionality of specific vehicle zones, interlinking with a central compute unit for coordination. This shift introduces hardware abstraction layers, allowing domain-oriented software to operate independently of the physical vehicle layout.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FnfclPGjWCdhr3VlKPVXN%252Fimage.png%3Falt%3Dmedia%26token%3D560ef77b-547c-4454-8a6e-dc61bfc95e41&width=768&dpr=4&quality=100&sign=f101ecf&sv=2)

## The Shift North: Decoupling Software from Hardware

The concept of the **shift north** marks a transformative approach in E/E architecture evolution, especially in the context of zonal designs with central computing. While traditional **domain-centralized architectures** focus on hardware-level clustering of functions, zonal architectures take a fundamentally different path. They create a **physical layout-based design** to significantly reduce wiring complexity, grouping functionality according to the physical zones of the vehicle.

In a zonal setup, **zone controllers** handle a wide variety of functions from multiple domains within their specific physical areas. This approach simplifies the vehicle's hardware by decoupling domain functionality from its physical organization. The **functional clustering**, traditionally tied to hardware, shifts upwards into the software domain.

This shift north relies on **hardware abstraction layers (HALs)**, which create a critical buffer between software and hardware. HALs ensure that software components are shielded from the specifics of the physical layout. As a result, developers can work in a **domain-oriented approach**, unaware of the underlying zonal structure. This abstraction fosters **scalability, flexibility, and maintainability**, enabling faster updates and easier integration of new features, independent of hardware constraints.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252Fd7c9OlJGYp08Wdtv59hp%252Fimage.png%3Falt%3Dmedia%26token%3D402d7bca-b8e8-40fc-83ca-0280d174f054&width=768&dpr=4&quality=100&sign=1680fca6&sv=2)

The shift north is a key enabler for modern software-defined vehicles, unlocking the potential of **zonal architectures** while maintaining the domain-focused design needed for complex vehicle systems.

## Comparing E/E Architectures

Different E/E architectures offer distinct advantages and trade-offs. Domain-centralized architectures cluster functionality at the hardware level, while zonal architectures with central compute shift functional clustering to software.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FCZD7NIy0UfNSED4pLQe1%252Fimage.png%3Falt%3Dmedia%26token%3D70630151-97d8-4e1f-b1af-76ad06cbad47&width=768&dpr=4&quality=100&sign=2d85ee2c&sv=2)

For instance, in a zonal setup, each vehicle zone operates independently with isolated wiring harnesses and a dedicated zone controller. Central compute handles higher-level functions, with high-resolution sensors directly connected to it. This design fosters modularity and loose coupling, laying the foundation for scalability, maintainability, and agility.

## Benefits and Challenges of Modern E/E Architectures

Modern E/E architectures offer several advantages while presenting notable challenges. On the benefits side, they reduce costs by minimizing the number of ECUs and simplifying wiring, which lowers manufacturing expenses. Scalability and flexibility improve, making upgrades easier and designs more future-proof. Modular designs enable parallel development, shortening time to market, while central computing supports advanced software features like over-the-air updates. Reliability is enhanced through simplified architectures, which streamline diagnostics and reduce failures. Additionally, standardized interfaces improve collaboration with suppliers and the broader ecosystem.

However, challenges persist. Transitioning to these architectures involves high costs, as overhauling legacy systems requires substantial investment. Organizational barriers complicate adapting processes like development, approval, and procurement. Integration risks arise from combining new and legacy technologies, requiring careful coordination. Economic pressures and regulatory demands can delay projects, while established OEMs may hesitate to adopt bold changes, opting instead for incremental adjustments to mitigate risks.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252F2dL87Zwz8Qj8ogIJ1bH1%252Fimage.png%3Falt%3Dmedia%26token%3D3a88752f-7d3c-496a-8e1a-591fa86581e8&width=768&dpr=4&quality=100&sign=a8b4c45&sv=2)

## Adoption Trends in the Automotive Industry

The automotive industry is currently witnessing varied adoption patterns across OEMs. **Traditional E/E architectures** dominate today but are gradually declining in favor of **domain-centralized** and **vehicle-centralized architectures**. Domain-centralized systems are already prominent, while vehicle-centralized setups, though less common in 2024, are expected to grow steadily in the coming years. Predictions suggest a significant shift toward these modern architectures as OEMs balance innovation with the costs of legacy system overhauls.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FBLd5rBmxURUqhO7rK4pj%252Fimage.png%3Falt%3Dmedia%26token%3D3d3434f7-2836-417e-98d7-a60afc72b897&width=768&dpr=4&quality=100&sign=a9447432&sv=2)

## The Path Forward

Evolving E/E architectures represent the foundation for software-defined vehicles, bridging hardware efficiency with software-driven innovation. While the transition poses challenges, the potential for cost savings, enhanced functionality, and faster innovation cycles underscores the importance of embracing these new paradigms. OEMs must carefully navigate the trade-offs to ensure a successful transformation.


# Case Study: Rivian

Rivian, a California-based EV startup specializing in adventure-oriented electric vehicles, provides an insightful example of innovation in E/E architecture. With strong partnerships, including Amazon and Volkswagen, Rivian has made remarkable progress in reducing the complexity of its vehicle architecture, as shared during their Investor Day 2024.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FFF3mI0mBAyxqWdt5HPVt%252Fimage.png%3Falt%3Dmedia%26token%3D0d1e3ec7-8385-4f98-8915-32a9ae5e588b&width=768&dpr=4&quality=100&sign=71df3f8b&sv=2)

In their first-generation vehicles, Rivian managed to reduce the number of ECUs to just 17, a stark contrast to the dozens typically used by incumbent OEMs. Currently, Rivian is working on its second-generation vehicles, further streamlining the design to only seven in-house developed ECUs.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FJIAPvbsenQWpXTioi0dI%252Fimage.png%3Falt%3Dmedia%26token%3D103fa6bd-c86e-47b9-98b5-821717d52b20&width=768&dpr=4&quality=100&sign=e0c974fc&sv=2)

This architecture employs a region-oriented zonal design, including east, west, and south zonal controllers, complemented by a few specialized ECUs for key functions such as infotainment, AD and ADAS, vehicle access control, and battery management.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FbzXNxZFpMSsidVqcMc0y%252Fimage.png%3Falt%3Dmedia%26token%3Da688fb4a-ea4c-4892-8249-5e7df74c0212&width=768&dpr=4&quality=100&sign=6f82f8a6&sv=2)

The benefits Rivian reports from their Gen 2 architecture are striking:

-   A 60% reduction in the number of ECUs compared to their first-generation vehicles.
-   A 1.6-mile reduction in harness length, significantly reducing vehicle complexity.
-   A weight reduction of 44 pounds per vehicle.
-   A 40% cost reduction in the electrical Bill of Materials (BOM).

This case study underscores how Rivian and other EV startups are embracing zonal E/E architectures, central computing, and software-defined vehicle principles, achieving tangible benefits in cost, complexity, and efficiency. It highlights the competitive edge startups can gain by adopting cutting-edge approaches to E/E systems.




`
    },
    {
        slug: 'standards-for-software-defined-vehicles-and-e-e-architectures',
        name: "Standards for Software-Defined Vehicles and E/E Architectures",
        description: "",
        type: "text-markdown",
        markdown_content: `
# Standards for Software-Defined Vehicles and E/E Architectures

Standards play a crucial role in shaping the development and interoperability of **Software-Defined Vehicles (SDVs)** and **E/E architectures**. In this chapter, we explore three key standards: **AUTOSAR**, **COVESA**, and **SOAFEE**, which have become foundational in modern automotive engineering. In addition, we will be looking at Eclipse SDV as an open source alliance, building on open standards.

## AUTOSAR: A De Facto Industry Standard

The **AUTOSAR (Automotive Open System Architecture)** standard is a widely adopted architecture that has been implemented by numerous OEMs and suppliers across millions of vehicles. Developed by the **AUTOSAR partnership**, an alliance of OEMs, Tier 1 suppliers, and other industry players, it aims to decouple hardware and software through a standardized layer.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FrXsdqRN59ed2dzFlWsrg%252Fimage.png%3Falt%3Dmedia%26token%3D18fc0b98-f007-4eef-83c3-0d5bb2cc4f40&width=768&dpr=4&quality=100&sign=c4521ee0&sv=2)

This architecture supports key functionalities such as **adaptive cruise control** and **lane departure warnings**, typically in applications with high **ASIL ratings**. It also provides standardization for communication, diagnostics, and integration with vehicle networks.

-   **Advantages**:
    -   Strong standardization and interoperability.
    -   Scalability for diverse systems integration.
    -   Proven safety and reliability for critical applications.
-   **Challenges**:
    -   High complexity and a steep learning curve.
    -   Limited flexibility for rapid innovation.
    -   Potentially higher development costs.

Despite its limitations, AUTOSAR remains a cornerstone in ensuring reliable and scalable automotive systems.

[![Logo](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2Fmiro.medium.com%2Fv2%2Fresize%3Afill%3A304%3A304%2F10fd5c419ac61637245384e7099e131627900034828f4f386bdaa47a74eae156&width=20&dpr=4&quality=100&sign=b49244d3&sv=2)The reality of AUTOSAR and the way forwardVolvo Cars Engineering](https://medium.com/volvo-cars-engineering/the-reality-of-autosar-and-the-way-forward-36af39ec4099)

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252F5y4z1KD3l5bNvTIniV7O%252Fimage.png%3Falt%3Dmedia%26token%3D51fb2c23-6ccd-42b7-ae33-f257fb377db5&width=768&dpr=4&quality=100&sign=6d47527&sv=2)

## COVESA: Vehicle Signal Specification (VSS)

**COVESA (Connected Vehicle Systems Alliance)**, formerly known as GENIVI, is an open alliance that promotes interoperability in **connected vehicle solutions**. A key contribution from COVESA is the **Vehicle Signal Specification (VSS)**, a standard for structuring and accessing vehicle data.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FctjGO7eWBEVRF8umw8hl%252Fimage.png%3Falt%3Dmedia%26token%3D07fa2546-33b2-4ab8-bdd1-4bde8c25d232&width=768&dpr=4&quality=100&sign=856bb97&sv=2)

COVESA VSS provides a **tree-structured data model** that organizes vehicle domains and their associated sensors and actuators. This standard essentially realizes the **signal-to-service transformation** discussed earlier in **Service-Oriented Architectures (SOA)**.

-   **Key Features**:
    -   Standardized vehicle signal definitions.
    -   Simplified data access for applications.
    -   Strong alignment with modern SOA principles.

The adoption of COVESA VSS ensures seamless data handling and accelerates development for connected and software-defined vehicles.

## SOAFEE: Scalable Open Architecture for Embedded Edge

The **SOAFEE (Scalable Open Architecture for Embedded Edge)** standard, spearheaded by **ARM** and supported by a wide range of OEMs, Tier 1s, hyperscalers, and other industry players, introduces **cloud-native principles** to the automotive industry.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252F0aNdqcMT9WD5zYWPyop7%252Fimage.png%3Falt%3Dmedia%26token%3Ddbdb03d2-5b0a-4de5-b6e1-7b27145731b4&width=768&dpr=4&quality=100&sign=f4bb8d0e&sv=2)

SOAFEE integrates both **on-board** and **off-board** environments to handle mixed-criticality services efficiently.

-   **On-Board Architecture**:
    -   Differentiates between **high-compute CPUs** for performance and **high-safety CPUs** for critical functions.
    -   Provides separate **QM** and **ASIL** environments.
    -   Features a **hardware abstraction layer (HAL)** to support both high and low-safety services.
-   **Off-Board Architecture**:
    -   Executes cloud-based microservices in a mixed-criticality environment.
    -   Ensures seamless interaction with on-board systems via orchestrators.

SOAFEE's **mixed-criticality orchestrators** and modular design enable greater flexibility and efficiency in managing SDV services. It bridges the gap between automotive-grade safety requirements and the agility of cloud-native architectures.

## Eclipse SDV: Driving Open-Source Innovation

The **Eclipse SDV Working Group**, hosted by the **Eclipse Foundation**, plays a pivotal role in advancing open-source development for **Software-Defined Vehicles (SDVs)**. Its mission is to create an open-source platform supporting tools, frameworks, and runtime environments that align with modern industry standards such as **AUTOSAR**, **COVESA**, and **SOAFEE**.

Key contributions from Eclipse SDV include **reference implementations**, **open development models**, and the promotion of **standardized APIs**. This enables faster, collaborative development and ensures interoperability between different SDV components. By embracing an open-source approach, Eclipse SDV accelerates the deployment of cutting-edge automotive technologies while fostering a global developer community focused on the future of mobility.

## Summary: Standards and Alliances Shaping SDVs

Together, **AUTOSAR**, **COVESA**, **SOAFEE**, and **Eclipse SDV** address the evolving demands of **Software-Defined Vehicles**, balancing **safety**, **scalability**, and **innovation**. These standards empower OEMs and suppliers to build **interoperable** and **future-ready** vehicle platforms by standardizing hardware-software integration and promoting cloud-native, service-oriented architectures.

Complementing these technical standards, the **SDV Alliance** serves as a global initiative fostering industry collaboration. By uniting automotive manufacturers, technology companies, and software developers, the alliance defines **best practices** and **standards** for SDV ecosystems, ensuring a cohesive and innovative approach across the automotive industry.

Together, these standards and alliances create a solid foundation for the automotive industry's **software-driven transformation**, supporting cutting-edge technologies while ensuring **functional safety**, **data-driven intelligence**, and **service-oriented designs** that define the future of mobility.


        `
    },
    {
        slug: 'building-blocks-of-an-sdv',
        name: "Building Blocks of an SDV",
        description: "",
        type: "text-markdown",
        markdown_content: `
# Building Blocks of an SDV

The **building blocks** for an **SDV** include **Service-Oriented Architectures (SOA)**, the **SDV TechStack**, **Over-the-Air (OTA) Updates**, and the **Vehicle App Store**. These components form the core technological framework enabling seamless software integration, real-time updates, and enhanced in-vehicle services.

# Service-Oriented Architecture

**Service-Oriented Architectures (SOA)** leverage vehicle hardware abstraction layers to enable agile application development. SOA represents a critical evolution in vehicle architecture, enabling seamless integration of hardware and software through modular and scalable services.

# The SOA Framework for SDVs

The SOA framework for SDVs encompasses both **on-board** and **off-board** environments, integrating **QM** (Quality Management) environments for agile application development and **ASIL** (Automotive Safety Integrity Level) environments for first-time-right safety-critical applications.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FAI8rQGyyXymO4aJ6k8xn%252Fimage.png%3Falt%3Dmedia%26token%3D182b8e91-a2e6-4c42-8b71-e3dda5644271&width=768&dpr=4&quality=100&sign=67e3b55e&sv=2)

Here's how the SOA Framework for SDVs is structured:

**1. Cloud Runtime**

At the heart of the off-board system, the **cloud runtime** enables scalable and agile development for microservices. It ensures seamless integration with on-board systems, allowing continuous updates, data processing, and application enhancement in a centralized environment.

**2. Vehicle-to-Cloud API**

The **vehicle-to-cloud API** acts as a bridge between on-board and off-board environments. It facilitates communication between vehicle systems and cloud platforms, ensuring that data and functionalities flow bidirectionally in a secure and efficient manner.

**3. Container Runtime**

To execute SDV functions on-board, a **container runtime** is essential. It provides the modular infrastructure needed for running microservices independently, ensuring scalability, fault tolerance, and agility. The container runtime supports parallel development and efficient deployment, allowing for quicker updates and testing.

**4. Signal-to-Service APIs**

At the core of SOA, **signal-to-service APIs** transform raw signals from sensors, actuators, and ECUs into higher-level services. This abstraction layer simplifies interaction with complex vehicle systems, enabling application developers to focus on creating functionalities without worrying about the underlying hardware complexity.

**5. Signal-Oriented Embedded Runtimes**

Embedded runtimes leverage signal-oriented designs to optimize real-time performance and ensure smooth operation of on-board systems. These runtimes interact with the signal-to-service APIs and containerized microservices, orchestrating critical processes in SDVs with minimal latency and high reliability.

## On-Board SOA Building Blocks

-   **Endpoint ECUs**: These lower-level control units connect to sensors and actuators through local bus networks. They transmit data to zonal controllers.
-   **Zonal Controllers**: Higher-end ECUs that host **signal-to-service APIs**, creating a bridge between hardware and software services.
-   **Microservices**: SOA enables the development of lightweight microservices:
    -   **Basic Microservices**: Simple, standalone services performing specific tasks.
    -   **Composite Microservices**: Higher-order services that combine multiple basic services into more complex functionalities.

## End-to-End Service Chains

SOA supports the creation of **end-to-end service chains** that span on-board and off-board environments:

-   In the **cloud**, microservices can access vehicle functions through vehicle-to-cloud APIs, interacting with sensors and actuators at the signal level via signal-to-service APIs.
-   On-board, these APIs enable agile development for QM functionalities, with future support planned for ASIL A and B functionalities.

## The Future of SOA

SOA enables seamless communication across the vehicle, cloud, and external ecosystems, driving flexibility, scalability, and safety. As the architecture evolves, signal-to-service APIs will increasingly support safety-critical applications, pushing the boundaries of **software-defined vehicles**. This convergence of on-board and off-board services is central to building robust and future-proof SOA frameworks.

# Container Runtimes

Container runtimes form the operational backbone of **Software-Defined Vehicles (SDVs)**, extending principles from internet infrastructure into the automotive domain. While containers already power modern cloud services, adapting them for automotive applications comes with unique challenges and requirements.

## Key Requirements for Automotive Container Runtimes

Key Requirements for Automotive Container Runtimes include Fast and Deterministic Startup Times, Resource Optimization and Enhanced Security and Efficient Updates:

1.  **Fast and Deterministic Startup Times**: In vehicles, startup delays are unacceptable. Imagine unlocking a car and waiting several seconds for critical services like the vehicle experience interface to boot. Automotive-grade container runtimes must ensure near-instant responses, supporting real-time or near-real-time applications even within QM environments.
2.  **Resource Optimization**: Onboard compute systems face hardware constraints despite using high-performance processors. Unlike cloud environments, onboard systems cannot scale elastically. Therefore, efficient resource allocation is essential, ensuring that containerized services run smoothly within limited computational resources.
3.  **Enhanced Security and Efficient Updates**: Automotive containers require robust security measures, such as isolation between services, secure boot mechanisms, and protection against cyber threats. Efficient update mechanisms must support seamless over-the-air (OTA) updates with minimal downtime.

## Container Runtimes in Automotive E/E Architecture

In an automotive **E/E architecture**, container runtimes fit within the broader system structure, enabling flexible and scalable service deployment:

-   **Central Compute Unit**: This unit hosts multiple instances of operating systems, often using virtualization technologies like hypervisors.
-   **Virtual OS Instances**: Inside these virtual machines, container runtimes manage microservice deployment.
-   **Container Runtimes**: Lightweight and modular, these environments host one or more microservices, creating a service-oriented architecture.
-   **Microservices**: Each microservice runs independently, providing modular vehicle functionalities. Multiple containerized services can run simultaneously, ensuring robust and scalable performance.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252Fpsh4cCcEVSWFAFQNrzH8%252Fimage.png%3Falt%3Dmedia%26token%3D5519092d-f3f7-4fba-b31b-8faa5b406393&width=768&dpr=4&quality=100&sign=61100817&sv=2)

By integrating container runtimes, **Software-Defined Vehicles** achieve the scalability, modularity, and reliability needed for modern automotive functions while ensuring seamless interaction with **off-board cloud services**. This combination enables **real-time applications**, **over-the-air updates**, and **enhanced service delivery**, forming the technological backbone of next-generation automotive platforms.

# Vehicle APIs

**Vehicle APIs** play a central role in modern **Software-Defined Vehicles (SDVs)** by enabling standardized access to vehicle data and functions. They simplify development, enhance interoperability, and support new services, driving innovation within the automotive ecosystem.

## Why Vehicle APIs Matter

Vehicle APIs matter because the offer Standardized Data and Function Access, Seamless Developer Integration, and Service Enablement and New Business Models:

1.  **Standardized Data and Function Access**: Vehicle APIs allow developers to access essential vehicle data, such as sensor readings (e.g., vehicle speed or battery state of charge) and control actuators (e.g., moving mirrors, opening windows) in a consistent and standardized way.
2.  **Seamless Developer Integration**: APIs abstract the complexities of underlying **E/E architectures** and automotive networks, enabling application developers to focus on creating features without requiring in-depth automotive engineering expertise.
3.  **Service Enablement and New Business Models**: By facilitating easy access to vehicle functions, APIs unlock opportunities for **on-board** and **off-board services**, enhancing the vehicle experience and enabling ecosystem-driven business models such as personalized apps, remote diagnostics, and connected services.

## Key API Standards in the Automotive Domain

There are a number of key API standards emerging in the automotive domain, including:

1.  **COVESA VSS (Vehicle Signal Specification)**: A signal-to-service API standard defining how vehicle signals are structured, enabling seamless data access and control through a tree-structured model.
2.  **Android Automotive HAL (Hardware Abstraction Layer)**: Developed by Google, this API standard defines hardware abstraction for Android-based infotainment systems, ensuring consistent integration across different automotive hardware platforms.
3.  **ISO 23150**: An international standard aimed at standardizing interfaces for **automated driving functions**, ensuring reliable communication between systems in the context of autonomous vehicle development.

Vehicle APIs are a key enabler for **connected services**, **software-defined platforms**, and **automotive innovation**, bridging the gap between complex vehicle systems and application developers while supporting scalable and interoperable automotive ecosystems.

## Example: digital.auto VSS Browser

The digital.auto VSS Browser is an open source, free to use tool to explore the COVESA VSS API catalogue. For example, in the following we show a part of the API catalogue in its original tree structure.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252F3mz4RkwCPjBMIdD7HAVc%252Fimage.png%3Falt%3Dmedia%26token%3D7d6665e4-47ea-413a-ae42-1fc6497cc0b0&width=768&dpr=4&quality=100&sign=9b9632c9&sv=2)

The VSS browser also allows for navigation of the COVESA VSS tree along the VSS catalogue structure. The following shows the catalogue root:

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FFLc6lRm2T8D6BzMb2AqS%252Fimage.png%3Falt%3Dmedia%26token%3D5aba5cc2-b8dd-4a3e-b5e7-c052a82f761a&width=768&dpr=4&quality=100&sign=6e4b3814&sv=2)

When selecting a particular VSS signal, the details will be shown as follows:

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FWoshVAlZEDXo1xJdmmW3%252Fimage.png%3Falt%3Dmedia%26token%3D78609c4a-b20b-40fe-b7ec-2d644d2b3bc2&width=768&dpr=4&quality=100&sign=5310ef1d&sv=2)

Use the following link to try it out yourself:

[playground.digital.auto](https://playground.digital.auto/)


# Example: Real-World Application of SDV Concepts

So how does all of this play together? How are **container runtimes** and **vehicle APIs** helping us build a **service-oriented architecture (SOA)** for **Software-Defined Vehicles (SDVs)**?

In the following, we will be looking at two use cases: An app for a mobile mechanic performing repairs on-site, and a passenger welcome app. Both will share an API to open the vehicle door, i.e. first unlocking the door and then physically opening the door via a motor.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252Fx5lpZCdHq5EkccESqGNS%252Fimage.png%3Falt%3Dmedia%26token%3Df71b4dfa-2e69-4a3f-a833-a8ed794760b6&width=768&dpr=4&quality=100&sign=f4e853a8&sv=2)

Let’s see how the components interact. We have an **off-board cloud runtime**, an **on-board edge container runtime**, and deeply embedded **signal-oriented environments** in the vehicle. Connecting these elements are two key API layers: the **vehicle-to-cloud API** for external communications and the **on-board hardware abstraction layer (HAL)**, possibly utilizing standards like **COVESA VSS**.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FJ5BMvpiQmLCd2oHRywxs%252Fimage.png%3Falt%3Dmedia%26token%3D5f1f4edc-ba56-4b73-b26d-4d5fd1dea9cf&width=768&dpr=4&quality=100&sign=4d804a40&sv=2)

Now, consider a real-world use case involving mobile maintenance or repair services, similar to what Tesla and other EV startups offer. Suppose a service technician needs to access a vehicle for maintenance, even when the owner is not present. Using a mobile app, the technician can send a request to unlock the car remotely. The cloud runtime processes the request through the **vehicle-to-cloud API**, which relays the command to the **on-board container runtime**. The appropriate service is triggered, and the car door unlocks and opens.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FjQKYZ7Njr6lbubGaN0t2%252Fimage.png%3Falt%3Dmedia%26token%3D1a25c578-9b8d-495a-908b-8e791b5061b7&width=768&dpr=4&quality=100&sign=87a71d39&sv=2)

Next, consider another use case: a **passenger welcome sequence** designed to enhance the emotional connection between the car and its owner. When the driver approaches the vehicle, the car recognizes the owner through an on-board app. Using stored driver preferences, the vehicle automatically adjusts the seat, triggers a light sequence, and opens the door—all through the same **on-board API**.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FtbE9vyjOmeOkkUJWuDy8%252Fimage.png%3Falt%3Dmedia%26token%3D8531f950-8278-4a25-97b2-44df3ed1de00&width=768&dpr=4&quality=100&sign=116baf4d&sv=2)

What makes this architecture efficient is that both use cases reuse the same **door control API**. In the first scenario, the API is accessed externally by the service technician’s mobile app, while in the second, it’s triggered internally by the on-board application running the welcome sequence. This demonstrates the power of **modularity**, **service reusability**, and **API-driven development** in building scalable and feature-rich SDV platforms.

# Ensuring Functional Safety

The next big question is: **Is it actually safe to open the vehicle door via an API?** The answer is **no**, unless critical safety measures are in place. In a service-oriented SDV architecture, safety depends on implementing proper checks within the **API for door control**.

## Ensuring Functional Safety

To make the door control API safe, several precautions must be built into its implementation:

1.  **Check Vehicle Motion Status:** Before initiating the door-opening sequence, the API must verify that the vehicle is completely stationary. Opening the door while the vehicle is moving could lead to hazardous situations.
2.  **Rear Camera Verification:** The API must also check the **rear camera feed** to detect approaching vehicles or obstacles in the vehicle’s path. If any danger is detected, the door-opening process must be blocked.
3.  **Side Camera Obstacle Detection:** Using the **side camera**, the system must ensure that the vehicle door can open without hitting an obstacle like a wall, post, or another vehicle parked nearby.
4.  **Regulatory Compliance:** All these checks must comply with relevant automotive safety standards, such as **ISO 26262** and applicable **UNECE regulations**, ensuring that the door-opening process follows industry best practices.

The following diagram shows how this is implemented in our SOA architecture.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FHYBol3cL3RgZThXSoCy1%252Fimage.png%3Falt%3Dmedia%26token%3Dc006475b-c75c-4575-9d78-0feb15c7f8a8&width=768&dpr=4&quality=100&sign=ce7ed001&sv=2)

## Testing: Ensuring Safety and Resilience

Finally, we return to the critical topic of **testing** in the context of **Software-Defined Vehicles (SDVs)**. Recall our earlier discussion about testing loosely coupled systems and the **Simeon Army with Chaos Monkeys**. In the case of the **open-door API** with multiple use cases, testing needs to balance structured, deterministic methods from **ISO 26262** with more chaotic, resilience-focused methods inspired by the **Chaos Monkeys**.

### Structured Testing: ISO 26262 Approach

ISO 26262 mandates **highly structured and deterministic testing** aimed at ensuring **functional safety**, **reliability**, and **regulatory compliance**. This approach involves thorough documentation, rigorous reproducibility, and a time-consuming certification process. Essential testing techniques include:

-   **Fault Injection Testing:** Simulating hardware faults such as sensor failures or intermittent ECU connections.
-   **Software Fault Injection:** Introducing issues like memory overflows or corrupt data in communication protocols (e.g., CAN bus).
-   **Power Fault Simulation:** Testing power stability by simulating voltage fluctuations or power interruptions.

### Resilience Testing: Chaos Monkeys Approach

To evaluate how the system performs under unexpected conditions, **resilience testing** follows a more chaotic, exploratory path:

-   **Fault Injection at Scale:** Injecting large-scale, unexpected failures, including network outages or system misconfigurations.
-   **Boundary Testing:** Pushing the system to its operational limits. For the open-door API, this could mean simulating 10,000 rapid open-close requests per minute.
-   **Signal Range Testing:** Verifying the system’s response when input values exceed design specifications, such as extreme brake pressure or abnormal steering inputs.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FHE4anlkvvtt9RVnU3fKt%252Fimage.png%3Falt%3Dmedia%26token%3Da6e2e79c-eeed-4788-853f-8f135cfaa0a1&width=768&dpr=4&quality=100&sign=1c4e3ebf&sv=2)

### Comprehensive System Validation

Finally, **system validation** ensures that all interconnected components—hardware, software, and external environments—work seamlessly. This includes end-to-end testing of:

-   **Functional Correctness:** Ensuring the system works as intended under expected conditions.
-   **Integration Testing:** Confirming that subsystems interact correctly.
-   **Environmental Simulation:** Testing system responses to external factors like weather, road conditions, and driver behavior.

By combining these diverse testing approaches, SDV developers can build robust, safe, and resilient systems that comply with automotive standards while being prepared for real-world challenges.

## Homologation for the Open-Door API

Ensuring **functional safety** for every API introduced in a **Software-Defined Vehicle (SDV)** is critical. This requirement ties directly into the process of **homologation**, where APIs must comply with relevant technical regulations before deployment.

### Why Homologation Matters

Homologation ensures that the **open-door API** meets **legal** and **safety standards** defined by international and regional authorities. Compliance is mandatory to certify that the vehicle is safe, secure, and road-legal across different markets.

### How It’s Done

To achieve homologation for the open-door API, developers can query a **regulatory database** like **Certivity**, which provides detailed technical regulations relevant to vehicle systems. For door-related APIs, several key standards apply, including:

-   **UNR 11**: Governs door latches and hinges, ensuring mechanical integrity and secure closure.
-   **UNR 97**: Focuses on vehicle alarm systems, ensuring anti-theft capabilities and safe vehicle access.

By referencing these standards, the development team can align the open-door API’s implementation with industry regulations, ensuring that **technical compliance** is met early in the development process. This approach reduces **regulatory risk**, supports **continuous homologation**, and accelerates product certification for global markets.

The following shows an example for a prototype combining COVESA VSS in the digital.auto VSS browser with the Certivity RegDB.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FOlkUKAvwh4VFinnnFEdW%252Fimage.png%3Falt%3Dmedia%26token%3D1e7839e1-811a-44f8-9819-5dc72a2d9d50&width=768&dpr=4&quality=100&sign=4460c652&sv=2)

## Conclusion

By integrating these safety mechanisms into the API, we ensure that the door-opening process becomes secure, compliant, and failsafe. This highlights how **functional safety** in **SDV architectures** is not just a technical feature but a critical system requirement that supports safety, reliability, and regulatory compliance.

# Event Chains in Vehicle SOAs

## Event Chains in Vehicle SOA

In traditional automotive systems, event chains are typically viewed from an embedded perspective, focusing solely on on-board systems deeply integrated with hardware components. These event chains involve tightly coupled ECUs (Electronic Control Units) that execute functions based on sensor inputs and actuator commands within the vehicle's hardware boundaries.

In contrast, Service-Oriented Architectures (SOA) in Software-Defined Vehicles (SDVs) extend the concept of event chains beyond the vehicle, incorporating both on-board and off-board components. This creates an end-to-end event processing framework where microservices in the cloud interact with microservices on the vehicle, enabling features such as remote diagnostics, over-the-air updates, and cloud-enhanced functionalities. These interconnected event chains are critical for enabling dynamic, scalable, and flexible vehicle services.

## System Models in Automotive Microservices

So how are events processed by microservices in a vehicle SOA? Automotive microservices can be built using various system models, including:

-   **Mathematical Models:** These models simulate complex systems and are translated into executable code.
-   **State Models:** They describe state transitions using structured tools, ideal for handling systems like vehicle doors or power management.
-   **Handcrafted Code:** Developers write custom code to implement specific features.
-   **AI Models:** These models perform inference tasks, enabling advanced features such as image recognition and predictive maintenance.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FmDE5UIN9oAMyh9KUSZMV%252Fimage.png%3Falt%3Dmedia%26token%3D99eed70b-358b-4ba0-88fc-c3997f321f38&width=768&dpr=4&quality=100&sign=89bee59a&sv=2)

## Event Chains and Call Chains

Interactions between microservices in an SOA environment occur through event chains or call chains:

-   **Event Chains:** Microservices interact asynchronously, triggering events without waiting for responses.
-   **Call Chains:** Microservices invoke one another synchronously, waiting for responses before proceeding.

These chains allow complex functionalities, such as a passenger welcome sequence, to be built by orchestrating several microservices.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FWCQyklJy98tmCopnZG9s%252Fimage.png%3Falt%3Dmedia%26token%3D870e1ed9-2ca2-4fab-8e4e-3f0ad82a0259&width=768&dpr=4&quality=100&sign=875677cc&sv=2)

## Mapping Models to Execution Environments

Microservices in SDVs rely on different execution environments, such as:

-   **Microcontrollers:** Low-cost, real-time processors used for safety-critical tasks like braking and airbag deployment.
-   **Microprocessors:** High-performance CPUs used for AI tasks, image processing, and infotainment.
-   **FPGAs:** Programmable logic arrays for specialized tasks requiring high-speed processing.

Each execution environment can have a dedicated, specific operating systems and middleware, such as real-time OS for microcontrollers and Linux-based systems for microprocessors.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FLNuyLFkIPsIorHbAy26G%252Fimage.png%3Falt%3Dmedia%26token%3D9c67869b-a7df-41d2-abfc-a79fab534a3f&width=768&dpr=4&quality=100&sign=1683cf3d&sv=2)

## Concrete Implementation Example: Open Door

Microservices in vehicle SOA can be implemented using several distinct models, depending on the nature of the required functionality. One straightforward approach is using handcrafted code, where a developer writes custom code to implement the desired service. For example, a microservice could access a vehicle’s internal database, perform computations based on retrieved data, and return results such as processing sensor inputs or managing user preferences.

Another implementation model involves AI-powered microservices. In this case, a trained AI model is integrated into a microservice that performs inferences using real-world data. Consider the passenger welcome sequence: the system could employ an AI-based microservice to analyze video data from rear-view cameras, detect incoming bicycles, and identify potential hazards.

Mathematical models provide another means of implementation. These models handle complex computations, such as projecting a bicycle's trajectory based on image analysis data. An AI model would first detect and track the bicycle’s movement through a series of video frames. The corresponding mathematical model would then calculate the future trajectory, helping determine whether opening the vehicle door would be safe.

State models are particularly useful for managing finite state transitions within the vehicle. For example, a microservice could handle the various states of the vehicle’s door, including locked, unlocked, open, and closed. This state management ensures that logical combinations of door and window positions are consistent and safe during vehicle operation.

By combining these models—handcrafted code, AI inferences, mathematical computations, and state management—vehicle SOA systems can support complex functionalities like the passenger welcome sequence. Each implementation type plays a specific role, creating a robust, modular, and scalable system capable of handling sophisticated automotive tasks.

### Embedded Part

To understand how the open-door functionality is implemented within the embedded environment, let’s examine an Autosar Classic-based architecture. At its core lies the microcontroller, a hardware component that includes the CPU, memory, and various peripherals essential for running the vehicle’s embedded software. This microcontroller serves as the execution platform for the embedded system.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FqBB6StoxOZ17cMAFXQyN%252Fimage.png%3Falt%3Dmedia%26token%3Da9d1066d-8bbb-4619-bff8-0fb8dce4e86a&width=768&dpr=4&quality=100&sign=8bd83d76&sv=2)

To ensure the software remains portable and adaptable across different microcontrollers, the Microcontroller Abstraction Layer (MCAL) standardizes the interface between the hardware and the higher-level software layers. This abstraction layer simplifies hardware access by encapsulating low-level hardware details, enabling software portability.

The ECU Abstraction Layer sits above the MCAL, providing a unified interface to ECU-specific hardware components like door sensors and actuators. This layer abstracts hardware-specific implementations, making it easier for higher software layers to interact with various components regardless of their unique technical details.

Above the ECU Abstraction Layer is the Service Layer, which offers system-wide services such as communication protocols, diagnostics, and memory management. This layer ensures seamless interaction across various ECU functions, independent of the specific hardware involved.

Specialized hardware components like LiDAR or battery management systems may require custom drivers known as complex device drivers. These extend the standard Autosar framework by supporting specialized hardware functions beyond what Autosar natively provides.

At the top of the software stack are the Runtime Environment and the Application Layer. The Runtime Environment acts as middleware, facilitating communication between user-defined applications and the underlying software components. The Application Layer contains vehicle-specific functionality, such as managing door locks, windows, and mirrors.

For the open-door example, a state model in the Application Layer could manage different door states such as locked, unlocked, open, and closed. This model would coordinate interactions with lower software layers, ensuring that door operations comply with defined safety and operational rules. This structured approach, supported by Autosar Classic’s modular architecture, makes managing complex vehicle functionalities both scalable and maintainable.

### End-to-End Perspective

To illustrate the end-to-end architecture of a vehicle system, let’s consider a typical use case involving a smartphone-based app triggering the vehicle's door-opening event.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FpiPs6M1LUIfRgI1SwRX1%252Fimage.png%3Falt%3Dmedia%26token%3D3edd7335-174f-4b2f-b97f-0c80caf98cdb&width=768&dpr=4&quality=100&sign=cd06a43d&sv=2)

The process begins with the smartphone, where the app runs on a standard operating system and application stack. When the user initiates the door-opening command, the app communicates with a cloud-based microservice, typically hosted in a cloud runtime environment also powered by a standard OS and application stack.

From the cloud, the command transitions to the vehicle's on-board system, where a high-performance compute environment awaits. This environment often runs a virtualized operating system capable of hosting containerized microservices. In this setup, microservices execute within a container runtime managed by Kubernetes-like orchestration platforms.

The next step involves message processing through a middleware service, such as the KUKSA message broker. This broker facilitates secure and reliable communication between cloud and on-board systems.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252Fxp4VJNmXYE0BP4wvDf5s%252Fimage.png%3Falt%3Dmedia%26token%3Dd18d39b5-c8be-4406-9b27-18b2d1a37b65&width=768&dpr=4&quality=100&sign=f93b6390&sv=2)

Once the command is validated, the vehicle's on-board system performs a series of safety checks before unlocking or opening the door. The safety checks begin by verifying whether the vehicle is stationary, a requirement enforced through integration with the Autosar platform. If the vehicle is not moving, the system activates the rear camera, using AI-powered image recognition to detect any incoming objects or pedestrians that might be at risk during the door-opening process.

Next, the side camera scans for obstacles close to the vehicle's sides, ensuring that the door won’t hit anything upon opening. If all checks pass, the system communicates with the responsible ECU via the Autosar-compliant communication layer. The ECU sends the final command to the vehicle’s door actuator, unlocking and opening the door as requested.

In advanced architectures, these event chains seamlessly combine cloud-based and on-board operations, leveraging a mix of microcontrollers and microprocessors. For safety-critical tasks, such as emergency braking or actuator control, microcontrollers certified for ASIL D-level functions ensure maximum reliability. Meanwhile, microprocessors handle complex AI-enabled tasks like perception, sensor fusion, and path planning, even though these components often operate under less stringent QM or ASIL A ratings.

This architecture underscores the complexity of modern vehicle SOAs, where cloud, edge, and embedded systems must work together, ensuring safety, functionality, and a responsive user experience.

# Vehicle SOA Tech Stack

The architecture of a modern tech stack for software-defined vehicles (SDVs) builds upon the principles of service-oriented architecture (SOA), carefully dividing the environment into safety-critical and non-safety-critical layers. The attached image illustrates the integration of cloud and on-board environments, categorized into Quality Management (QM), ASIL A/B, and ASIL C/D layers.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252F3Z1uuGMtz1qYsWx4nG92%252Fimage.png%3Falt%3Dmedia%26token%3D23692700-1d5e-40c2-8867-8a7dfeec3063&width=768&dpr=4&quality=100&sign=8596a2a0&sv=2)

## Layers of the Tech Stack for Vehicle SOAs

At the top of the stack lies the **cloud environment**, where middleware and applications are executed within a Platform-as-a-Service (PaaS) framework. The underlying layers of the cloud leverage Infrastructure-as-a-Service (IaaS) platforms powered by high-performance CPUs and GPUs. This configuration enables scalable computation and centralized management of services that interact with the vehicle's on-board systems.

Transitioning to the on-board **QM environment**, we see the use of container runtimes for efficient execution of microservices. These run within virtual operating system instances managed by hypervisors, which typically utilize general-purpose OSs such as Linux. This layer relies on high-performance compute environments powered by CPUs and GPUs, ensuring the rapid execution of non-critical vehicle functions and enhanced vehicle experiences.

For the **ASIL A and B environments**, the stack incorporates specialized platforms such as Autosar Adaptive or the Robot Operating System (ROS). These operate on generic microprocessors to support safety-critical functionalities while maintaining sufficient flexibility for dynamic service orchestration.

The **ASIL C and D environments** delve deeper into real-time operations, where the tech stack includes high-end ECUs running real-time operating systems on generic microprocessors for zone controllers. At the endpoints, the stack employs low-end ECUs powered by microcontrollers. These typically run Autosar Classic or similar micro-OS platforms, ensuring the safe and reliable execution of highly critical tasks like braking and engine control.

This layered and modular approach to the SDV tech stack highlights how safety-critical and non-critical environments can coexist. Each layer is optimized for its specific role, from supporting scalable cloud-based computation to enabling real-time, safety-critical operations on embedded systems. This separation ensures scalability, functional safety, and the agility needed for software-defined vehicle ecosystems.

## Application Perspective on the SDV Tech Stack

To better understand the modern SDV tech stack, let’s revisit it from the perspective of applications. Previously, we introduced two distinct applications: one for a mobile mechanic and another for an on-board passenger welcome sequence. These applications demonstrate how the tech stack enables seamless integration between various components and ensures safety and functionality.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252FGlDd77l4FwfGSf3FW0Kh%252Fimage.png%3Falt%3Dmedia%26token%3Dd899aab1-2795-4033-8192-4d7731fed14e&width=768&dpr=4&quality=100&sign=69e6f2b8&sv=2)

The **first application**, designed for a mobile mechanic, runs on a smartphone. This app allows the mechanic to open the vehicle door remotely, making use of the **vehicle-to-cloud API** to communicate with the car. The app sends a command to the cloud, where it interacts with a microservice implementing the **door open API**. This microservice, running in the cloud runtime, processes the request and transmits it to the vehicle's on-board system via the **vehicle-to-cloud API**.

The **second application**, the passenger welcome sequence, operates directly on the vehicle within the **QM container runtime environment**. This app is responsible for creating an engaging user experience by adjusting settings, such as seat position, and opening the door when the owner approaches the car. Like the mobile mechanic app, it leverages the **door open API** to perform its functions.

In both scenarios, the **door open API** acts as a central interface, abstracting the complexities of interacting with the vehicle’s hardware. The implementation of this API involves a multi-step process to ensure functional safety. When a request is made to open the door, the API must first pass through the **signal-to-service API**, which connects it to the embedded environment. In the embedded environment, safety checks are conducted in the following sequence:

1.  **Vehicle Speed Check**: Ensures the car is stationary before proceeding.
2.  **Rear Traffic Monitoring**: Uses the rear camera and AI to detect any approaching vehicles.
3.  **Side Clearance Check**: Verifies that no obstacles or pedestrians are near the door using side cameras.
4.  **Execution at the ECU Level**: After all safety checks are validated, the signal-to-service API communicates with the embedded ECU to physically unlock and open the door.

This layered approach showcases how the SDV tech stack supports end-to-end functionality, ensuring safety-critical computations are performed within appropriate environments while exposing reusable APIs for application development. The ability to reuse the **door open API** across both on-board and off-board applications highlights the modularity, scalability, and interoperability that a service-oriented architecture brings to software-defined vehicles.

## Case Study: Rivian's Modular Architecture and Strategic Vision

To conclude, let’s revisit Rivian’s innovative approach to vehicle architecture and its broader implications. Rivian's vision revolves around modularity, where different versions of electrical hardware are abstracted through a hardware adaptation layer. This approach allows Rivian to build flexible, generic software layers on top, which can be tailored for specific vehicle variants.

This modular architecture is crucial not only for Rivian’s ability to scale across its product portfolio but also for its strategic collaboration with Volkswagen. In the context of the Rivian-Volkswagen joint venture, this architecture provides an opportunity for Volkswagen to leverage Rivian’s core platform while introducing distinct digital features tailored to its own brand and market requirements. For instance, Volkswagen could reuse Rivian's higher-level architecture for vehicle operations but customize it with proprietary digital experiences, enhancing its competitive differentiation in areas such as infotainment, user interaction, or advanced driver assistance systems.

This partnership highlights the transformative potential of scalable and flexible architectures in the automotive industry. By abstracting hardware complexities and focusing on software differentiation, Rivian’s approach sets a benchmark for the efficient and collaborative development of next-generation, software-defined vehicles.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252F5v9OWakpFADCm5U3P0Pc%252Fimage.png%3Falt%3Dmedia%26token%3Dab3d9732-9cd8-420f-8e05-cd64d2f5762c&width=768&dpr=4&quality=100&sign=1ba284bc&sv=2)


        `
    },
    {
        slug: 'summary-building-blocks-for-software-defined-vehicles',
        name: "Summary: Building Blocks for Software-Defined Vehicles",
        description: "",
        type: "text-markdown",
        markdown_content: `
# Summary: Building Blocks for Software-Defined Vehicles

In Part C of **SDV 101: Building Blocks**, we explored the foundational elements enabling modern **software-defined vehicles (SDVs)**. At the core of SDVs lies the evolution of **E/E architectures**, which transition from legacy designs into either **domain-centralized architectures** or cutting-edge **zonal architectures** with **high-performance compute (HPC)** capabilities. These advancements provide the structural backbone for SDVs.

![](https://www.sdv.guide/~gitbook/image?url=https%3A%2F%2F392531723-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRqBHYU6DD895ydQm5PcS%252Fuploads%252Fjhzw2jxYVaN5fD7y4WSA%252Fimage.png%3Falt%3Dmedia%26token%3Df3aeec85-6b54-4fd2-a507-4ae61c6a56b5&width=768&dpr=4&quality=100&sign=255b344&sv=2)

Building on E/E architectures, SDVs implement **service-oriented architectures (SOAs)** that leverage **container runtimes** and **vehicle APIs** to ensure modularity, scalability, and integration with external ecosystems. Critical to this framework is the focus on **functional safety**, especially when operating in mixed-criticality environments, supported by **modern tech stacks** and industry standards such as **AUTOSAR**, **COVESA VSS**, and **SOAFEE**.

We also examined **over-the-air (OTA) updates**, a critical enabler for dynamic updates of software, AI models, and other digital artifacts, paving the way for continuous innovation. Finally, we looked at the concept of the **Vehicle App Store**, a transformative vision integrating secure environments, controlled API access, and cross-platform services to deliver new digital experiences to automotive customers.

Together, these building blocks represent the future of automotive innovation, where modular architectures, advanced software integration, and seamless updates redefine the vehicle experience.
        `
    },
    {
        slug: 'test',
        name: "Test",
        description: "This question set evaluates understanding of Software-Defined Vehicle (SDV) building blocks, including E/E architectures, service-oriented principles, modern tech stacks, and key enabling technologies.",
        type: "quiz",
        questions: [
            {
                "question": "What is a key characteristic of modern E/E architectures in Software-Defined Vehicles (SDVs)?",
                "answers": [
                    {
                        "label": "They primarily rely on a distributed network of independent ECUs."
                    },
                    {
                        "label": "They transition from legacy designs into either domain-centralized architectures or cutting-edge zonal architectures with high-performance compute (HPC) capabilities.",
                        "is_correct": true
                    },
                    {
                        "label": "They eliminate the need for physical wiring harnesses."
                    },
                    {
                        "label": "They are solely focused on mechanical system integration."
                    }
                ]
            },
            {
                "question": "In a Service-Oriented Architecture (SOA) for SDVs, what is the primary function of 'Signal-to-Service APIs'?",
                "answers": [
                    {
                        "label": "To manage the vehicle's power distribution network."
                    },
                    {
                        "label": "To transform raw signals from sensors, actuators, and ECUs into higher-level services.",
                        "is_correct": true
                    },
                    {
                        "label": "To handle over-the-air (OTA) updates."
                    },
                    {
                        "label": "To provide external links to cloud-based microservices."
                    }
                ]
            },
            {
                "question": "The SOA framework for SDVs encompasses both on-board and off-board environments. What is a key role of the 'cloud runtime' in this framework?",
                "answers": [
                    {
                        "label": "To directly control safety-critical vehicle functions."
                    },
                    {
                        "label": "To execute containerized microservices on the vehicle's embedded system."
                    },
                    {
                        "label": "To enable scalable and agile development for microservices in a centralized environment.",
                        "is_correct": true
                    },
                    {
                        "label": "To manage the physical connection between sensors and actuators."
                    }
                ]
            },
            {
                "question": "Within the SOA framework for SDVs, how are QM (Quality Management) and ASIL (Automotive Safety Integrity Level) environments typically differentiated?",
                "answers": [
                    {
                        "label": "QM environments are for safety-critical applications, while ASIL environments are for agile development."
                    },
                    {
                        "label": "QM environments are for agile application development, and ASIL environments are for first-time-right safety-critical applications.",
                        "is_correct": true
                    },
                    {
                        "label": "QM environments are off-board, and ASIL environments are on-board."
                    },
                    {
                        "label": "QM and ASIL environments are interchangeable and serve the same purpose."
                    }
                ]
            },
            {
                "question": "Which industry standard, spearheaded by ARM, introduces cloud-native principles to the automotive industry and integrates both on-board and off-board environments for mixed-criticality services?",
                "answers": [
                    {
                        "label": "AUTOSAR"
                    },
                    {
                        "label": "COVESA VSS"
                    },
                    {
                        "label": "SOAFEE",
                        "is_correct": true
                    },
                    {
                        "label": "Eclipse SDV"
                    }
                ]
            },
            {
                "question": "What is the main purpose of COVESA VSS (Vehicle Signal Specification) in the context of SDVs?",
                "answers": [
                    {
                        "label": "To define the hardware specifications for high-performance compute units."
                    },
                    {
                        "label": "To provide a tree-structured data model that organizes vehicle domains and their associated sensors and actuators, realizing the signal-to-service transformation.",
                        "is_correct": true
                    },
                    {
                        "label": "To manage over-the-air software updates."
                    },
                    {
                        "label": "To facilitate the development of vehicle app stores."
                    }
                ]
            },
            {
                "question": "Why are Over-the-Air (OTA) updates considered a critical enabler for Software-Defined Vehicles (SDVs)?",
                "answers": [
                    {
                        "label": "They reduce the need for physical vehicle maintenance."
                    },
                    {
                        "label": "They allow for dynamic updates of software, AI models, and other digital artifacts, paving the way for continuous innovation.",
                        "is_correct": true
                    },
                    {
                        "label": "They are primarily used for updating the vehicle's mechanical components."
                    },
                    {
                        "label": "They replace the need for functional safety checks."
                    }
                ]
            },
            {
                "question": "What is a key characteristic of the 'Vehicle App Store' concept in SDVs?",
                "answers": [
                    {
                        "label": "It is a physical store where car owners can buy new hardware components."
                    },
                    {
                        "label": "It is a transformative vision integrating secure environments, controlled API access, and cross-platform services to deliver new digital experiences to automotive customers.",
                        "is_correct": true
                    },
                    {
                        "label": "It is a repository for vehicle diagnostic tools only."
                    },
                    {
                        "label": "It is a platform exclusively for safety-critical applications."
                    }
                ]
            },
            {
                "question": "According to the case study, what is a core aspect of Rivian's strategic vision regarding vehicle architecture?",
                "answers": [
                    {
                        "label": "A focus on tightly integrated, proprietary hardware and software."
                    },
                    {
                        "label": "A modular architecture where different versions of electrical hardware are abstracted through a hardware adaptation layer, allowing flexible, generic software layers.",
                        "is_correct": true
                    },
                    {
                        "label": "Prioritizing mechanical system development over software innovation."
                    },
                    {
                        "label": "Limiting software updates to once a year."
                    }
                ]
            },
            {
                "question": "In the 'SDV Tech Stack' example involving the 'door open API,' what is a crucial step performed in the embedded environment after a request to open the door is made, to ensure functional safety?",
                "answers": [
                    {
                        "label": "Sending a notification to the mobile mechanic app."
                    },
                    {
                        "label": "Performing safety checks like vehicle speed, rear traffic monitoring, and side clearance checks.",
                        "is_correct": true
                    },
                    {
                        "label": "Directly unlocking and opening the door without any prior checks."
                    },
                    {
                        "label": "Updating the vehicle's infotainment system."
                    }
                ]
            }
        ]
    }
]