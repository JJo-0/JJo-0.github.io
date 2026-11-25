---
title: ROS 2 nodes and data
description: Launching a node from its package and exploring how nodes exchange data in ROS 2.
pubDate: 2023-08-08
category: robotics-embedded
subcategory: ros2
type: study-note
tags:
- ros2
- nodes
- topics
- services
- actions
researchArea: robotics-autonomous-systems
researchFeatured: false
lang: en
slug: 2023-08-08-ros2-3
translationKey: en-2023-08-08-ros2-3
translatedPosts:
  ko-KR: 2023-08-08-ros2-3
---

# 10. Nodes and data communication

---

Contents

---

## Definitions

| Name | Definition | Examples |
| --- | --- | --- |
| Node | A unit of computation in the ROS graph | A camera driver publishing images, a filter, a feature extractor, an object detector, or a path planner using the detection |
| Message | Data exchanged between nodes, with fields such as integers, floating-point values, booleans, and strings | Typed data appears in topics, services, actions, and parameter interfaces. |

## Running a node with ros2 run

### **Start a node**

**`ros2 run <package> <executable>`**

```bash
$ ros2 run turtlesim turtlesim_node
$ ros2 run turtlesim turtle_teleop_key
```

### View the graph of running nodes

**`rqt_graph`**

### List the running nodes

**`ros2 node list`**

```bash
$ ros2 node list

# Example output
/rqt_gui_py_node_28168
/teleop_turtle
/turtlesim
```

### Run another instance with a different name

**Multiple instances can start with the same node name. Assign distinct names so you can identify them.**

```bash
$ ros2 run turtlesim turtlesim_node __node:=new_turtle
# Remap the node name to new_turtle.
```

### Inspect a node with ros2 node info

**`ros2 node info <node_name>`**

```bash
$ ros2 node info /teleop_turtle

# Output
/teleop_turtle
  Subscribers:
    /parameter_events: rcl_interfaces/msg/ParameterEvent
  Publishers:
    /parameter_events: rcl_interfaces/msg/ParameterEvent
    /rosout: rcl_interfaces/msg/Log
    /turtle1/cmd_vel: geometry_msgs/msg/Twist
  Service Servers:
    /teleop_turtle/describe_parameters: rcl_interfaces/srv/DescribeParameters
    /teleop_turtle/get_parameter_types: rcl_interfaces/srv/GetParameterTypes
    /teleop_turtle/get_parameters: rcl_interfaces/srv/GetParameters
    /teleop_turtle/list_parameters: rcl_interfaces/srv/ListParameters
    /teleop_turtle/set_parameters: rcl_interfaces/srv/SetParameters
    /teleop_turtle/set_parameters_atomically: rcl_interfaces/srv/SetParametersAtomically
  Service Clients:

  Action Servers:

  Action Clients:
    /turtle1/rotate_absolute: turtlesim/action/RotateAbsolute
```
