
export const create_prototype_lessons = [
    {
        slug: 'create_new_prototype',
        name: "Creating a New Prototype",
        description: "Learn how to create a new prototype in the digital.auto playground",
        duration: "2 minutes",
        type: "text-markdown",
        markdown_content: `
## Creating a New Prototype

In this guide, we will walk you through the process of creating a new prototype.

For a detailed walkthrough, watch the video tutorial below. It provides a step-by-step guide on creating a prototype.

<video src="https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/create_model_and_journey.mp4">
  Your browser does not support the video tag.
</video>

`},
    {
        slug: 'create_customer_journey',
        name: "Creating a Customer Journey",
        description: "Learn how to create and customize customer journeys for your prototype",
        duration: "3 minutes",
        type: "text-markdown",
        markdown_content: `
## Creating a Customer Journey

In this lesson, you'll learn how to design and implement customer journeys for your vehicle prototype. 
Customer journeys map out the complete experience users have when interacting with your vehicle's digital systems, from initial contact through various touchpoints and interactions.

Watch the comprehensive video tutorial below to see how to create effective customer journeys that enhance your prototype development process. This will help you outline all the major actions and touch points.

<video src="https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/create_model_and_journey.mp4">
  Your browser does not support the video tag.
</video>
        `
    },
    {
        slug: 'create_flow',
        name: "Creating a Flow",
        description: "Learn how to create and design flows to connect different screens and interactions in your prototype",
        duration: "4 minutes",
        type: "text-markdown",
        markdown_content: `
## Creating a Flow

In this lesson, you'll learn how to create flows that connect different screens and define user interactions within your prototype. 
Flows are essential for creating seamless user experiences by defining how users navigate between different states and screens in your vehicle's digital interface.

A well-designed flow ensures that users can intuitively move through your prototype, making it feel like a real, functional system. You'll learn how to:

- Connect screens with interactive elements
- Define transition animations and timing
- Set up conditional logic for different user paths
- Test and refine your flow for optimal user experience

Watch the detailed video tutorial below to see the complete process of creating effective flows for your prototype.

<video src="https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/create_flow.mp4">
  Your browser does not support the video tag.
</video>
        `
    },
    {
        slug: 'write_python_code',
        name: "Writing Python Code",
        description: "Learn the fundamentals of writing Python code for your projects",
        duration: "8 minutes",
        type: "text-markdown",
        markdown_content: `
## Writing Python Code

In this lesson, you'll learn the fundamentals of writing Python code. Python is a versatile, beginner-friendly programming language that's widely used in web development, data analysis, automation, and many other fields.

### Getting Started with Python

Python uses simple, readable syntax that makes it easy to learn and understand. Here are some basic concepts:

#### Variables and Data Types

\`\`\`python
# Variables
name = "John Doe"
age = 25
height = 5.9
is_student = True

# Lists
fruits = ["apple", "banana", "orange"]
numbers = [1, 2, 3, 4, 5]
\`\`\`

#### Functions

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

def calculate_area(length, width):
    return length * width

# Using functions
message = greet("Alice")
area = calculate_area(10, 5)
\`\`\`

#### Control Flow

\`\`\`python
# If statements
if age >= 18:
    print("You are an adult")
else:
    print("You are a minor")

# Loops
for fruit in fruits:
    print(f"I like {fruit}")

for i in range(5):
    print(f"Number: {i}")
\`\`\`

#### Working with Classes

\`\`\`python
class Car:
    def __init__(self, make, model, year):
        self.make = make
        self.model = model
        self.year = year
    
    def start_engine(self):
        return f"The {self.year} {self.make} {self.model} engine is starting!"

# Creating an instance
my_car = Car("Toyota", "Camry", 2023)
print(my_car.start_engine())
\`\`\`

### Best Practices

- Use meaningful variable names
- Write comments to explain complex logic
- Follow PEP 8 style guidelines
- Keep functions small and focused
- Handle errors with try/except blocks

### Common Python Libraries

- **requests**: For making HTTP requests
- **pandas**: For data manipulation and analysis
- **numpy**: For numerical computing
- **matplotlib**: For creating visualizations
- **flask/django**: For web development

Practice these concepts by writing small programs and gradually building more complex applications. Python's extensive documentation and community support make it an excellent choice for beginners and experienced developers alike.
        `
    },
    {
        slug: 'prepare_dashboard',
        name: "Prepare a Dashboard",
        description: "Learn the essential steps to create an effective data dashboard from planning to implementation",
        duration: "45 minutes",
        type: "text-markdown",
        markdown_content: `
# How to Prepare a Dashboard

A well-designed dashboard transforms raw data into actionable insights. This guide will walk you through the essential steps to create an effective dashboard from conception to implementation.

## 1. Define Your Objectives

### Identify Key Questions
Before building your dashboard, clearly define what questions it should answer:
- What decisions will this dashboard support?
- Who is the target audience?
- What actions should users be able to take?

### Set Success Metrics
- Define what success looks like
- Establish KPIs (Key Performance Indicators)
- Determine update frequency requirements

        `
    },
    {
        slug: 'run_and_demo_prototype',
        name: "Running Your Prototype",
        description: "Learn how to run your prototype and create effective demonstrations",
        duration: "5 minutes",
        type: "text-markdown",
        markdown_content: `
## Running and Demoing Your Prototype

Once you've created your prototype with flows and customer journeys, it's time to bring it to life. This lesson covers how to run your prototype and create compelling demonstrations that showcase your vehicle's digital experience.

### Running Your Prototype

After building your screens, flows, and interactions, you can run your prototype to see it in action:

1. **Preview Mode**: Use the preview function to test your prototype locally
2. **Interactive Testing**: Navigate through your flows to ensure smooth transitions
3. **Device Simulation**: Test on different screen sizes and orientations
4. **Performance Check**: Verify loading times and responsiveness

### Creating Effective Demonstrations

A good demonstration should tell a story and highlight key features:

#### Preparation Steps
- Plan your demonstration flow in advance
- Identify the most compelling user scenarios
- Practice the timing and transitions
- Prepare backup scenarios in case of technical issues

#### Demo Best Practices
- Start with context about the user and their needs
- Show real-world scenarios that your audience can relate to
- Highlight unique features and innovations
- Keep interactions smooth and natural
- End with clear next steps or call-to-action

### Technical Tips for Smooth Demos

- Ensure stable internet connection
- Close unnecessary applications to optimize performance
- Have a backup plan (recorded video or screenshots)
- Test all interactions beforehand
- Use presenter mode if available

Watch the video below to see a complete demonstration workflow in action:

<video src="https://bewebstudio.digitalauto.tech/data/projects/OyNGtTQf2N0l/create_prototype/demo_prototype.mp4">
  Your browser does not support the video tag.
</video>

Remember, a successful prototype demonstration not only shows what you've built, but also communicates the value and vision behind your digital automotive experience.
        `
    },
    {
        slug: 'homologation',
        name: "Homologation",
        description: "Learn about the homologation process and regulatory requirements for automotive prototypes",
        duration: "8 minutes",
        type: "text-markdown",
        markdown_content: `
## Understanding Homologation in Automotive Development

Homologation is the process of certifying that your automotive prototype meets all regulatory requirements and safety standards before it can be approved for production or market release. This critical step ensures your digital automotive experience complies with industry regulations.

### What is Homologation?

        `
    },


]