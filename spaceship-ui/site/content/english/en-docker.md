---
title: Setting up ROS 2 in Docker
description: Notes on starting a container, learning Docker basics and troubleshooting graphical applications that
  fail to launch.
pubDate: 2024-04-05
category: software-engineering-cs
subcategory: development-environment
type: setup-guide
tags:
- docker
- ros2
- containerization
- gui
- networking
researchFeatured: false
lang: en
slug: 2024-04-05-docker
translationKey: en-2024-04-05-docker
translatedPosts:
  ko-KR: 2024-04-05-docker
---

# Notes on the Docker video
---
Original source [Docker_Ros]

## Common Docker problems and practical uses

After learning the basics and starting a container, you may find that some graphical programs still will not launch.\
Network communication can behave unexpectedly, and files created in a shared volume can appear locked on the host.\
The video addresses these common problems by changing the Dockerfile and the `docker run` command.\
Its examples come from robotics and automation software development, but the same issues arise in other Docker setups.\
With these pieces in place, Docker provides a reliable base for building different images.

## Updating the Dockerfile and changing the ROS image

The presenter notes that some choices in the video may have better alternatives.\
The examples draw on Dockerfiles by Alison Thaxton, which illustrate several best practices.\
Picking up where the previous video left off, this installment changes the base ROS Docker image.\
The choice of image depends on the features the application needs.

## How do you configure a user inside a Docker container?

The first problem is that files created inside the container belong to root on the host, leaving the host user unable to edit them.

On Linux, a user has both a username and a numeric user ID (UID). Docker containers run as root by default unless configured otherwise.

To run the container as an ordinary user compatible with the host, it helps to understand how Linux identifies users.

A created file records the creator's UID. `ls -l` shows the corresponding username, while `ls -ln` displays the numeric ID.

Each file has a user ID and group ID. Its permissions can, for instance, let the owner edit the file while allowing other users only to read it.


How do you tell Docker which user to use?

There are several ways to tell Docker to run as a new user.

The user must actually exist before this works.

The example creates a user called “Ross” and sets the UID and GID to 1000. Build arguments make these values configurable when the image is built.

The host user is currently called “deck”. The names differ, but the numeric IDs can still match.

The example also creates a home directory and configuration directory for the new user. Some programs expect those directories to exist.

The presenter rebuilds and tags the image using `docker build -t myimage`. The video pauses while Docker downloads the base image after correcting the repository reference, written in the notes as `humbledesktop/full`.


Checking the container user and file ownership

The example maps a volume and runs the container as the new user.

It changes a file's owner inside the container and examines how ownership appears on the host.

Matching identities matters when both the host and the container need to work on the same files. The video discusses some exceptions to the usual ownership behavior, although the arrangement generally works as expected.


How do you manage users in a Dockerfile?

A Dockerfile can switch to another user or back to root.

Change the username, UID, or GID in the Dockerfile or pass different values as build arguments.

After a switch, subsequent commands run as that user. The final user becomes the default when the container starts.

When extending an image, check whether the current user is root and select the appropriate user before issuing a `RUN` instruction.


What does the sudo configuration do?

There are two parts. First, the example installs `sudo` with apt.

It then configures sudo privileges.

The configuration grants the selected user sudo access without requiring a password on each invocation.

The example does not set a password. You can adjust the policy or restrict which programs may run through sudo.

Before going through the package installations, the video looks at the associated commands.

Several parts of those commands deserve a closer explanation.


How do apt-get and apt differ in Docker, and why refresh package lists?

`apt-get` offers a more stable interface for scripts and automated tasks.

`apt` is intended for interactive use and is less suitable for automation.

Run `apt-get update` to refresh package lists before installation. Cached lists may be stale or missing, and Docker can reuse an earlier build layer without rerunning its commands.

The `install -y` option answers yes to the confirmation prompt so that installation can proceed unattended.


Why group the Docker commands?

Each program could have a separate install command. That would be cumbersome and could require refreshing package lists for each install.

Removing the package lists reduces the final image size. Removing them in the same layer avoids retaining them in an earlier layer.

Keep the update and installation in the same operation. An install performed later against stale package lists can fail.


Setting Docker environment variables

During a Docker build, `DEBIAN_FRONTEND` can be set to `noninteractive`.

This suppresses interactive configuration prompts during package installation.

The presenter saw little difference in testing and found reports that some prompts could still appear.

The video therefore advises against making this setting permanent with Docker's `ENV` instruction.

An image-wide setting persists for later users unless it is reset.


Which Docker settings matter for ROS?

Networking is one of the important settings in Docker.

ROS communication does not always work as expected out of the box.

Docker's networking system is highly configurable and supports complex arrangements.

For the robotics setup in the video, `--network=host` shares the host network and `--ipc=host` makes the host IPC namespace available for communication using shared memory.


What does the Docker documentation cover?

The Docker documentation explains the options. The discussion also covers running GUI programs.

A Dockerfile can specify both an entry point and a default command. Their interaction takes some care.

The video introduces a convenient pattern for using them together.


How are the ROS image and entry point configured?

The ROS image uses a Bash script to set up the runtime environment and then launch the requested command.

The script acts as an executable wrapper. Arguments supplied when the container is run are passed through to the command.

The entry-point example enables exit on error, sources the ROS installation, prints what was passed in, and executes the command.

Additional Dockerfile instructions configure the entry point, and the command instruction supplies a default. Rebuild and run the image to check which arguments arrive.


Why does the video introduce PCBWay after running the program?

At this point, the program appears to run on its own, even though it is running in a particular ROS and Linux environment.

The tutorial has already covered several topics, and the next step, running graphical programs, adds complexity.

The presenter pauses here to introduce the video's sponsor, PCBWay.

The sponsorship segment describes PCBWay as a major PCB services provider offering fabrication and assembly, as well as 3D printing, CNC machining, sheet-metal fabrication, and injection molding.

The presenter invites viewers with ideas for other kinds of manufactured parts to visit PCBWay using the video's link.


Using graphics inside Docker

Getting graphics working can depend on the CPU vendor, the program, and the graphics features it needs.

The example assumes the X Window System. The appropriate method depends on the setup.

Both the container user's permissions and access to X matter. The container needs access to the X Unix-domain socket.

X access can be granted more broadly or to a particular user, allowing containers running as that user to connect. The grant can be revoked afterward.

Finally, set the X display for the container. Pass through the host's active display to Docker instead of hard-coding a particular display number.


What ROS 2 topics will the video cover next?

After starting the container and checking the ROS 2 topic list, launching RViz should open its graphical window. The presenter plans to discuss GPU acceleration in a future CUDA video.

Locale and time-zone settings tell software how to present certain data to users. Official ROS Docker images handle this setup. When building from an Ubuntu base image, account for it yourself.


How do you configure ROS 2 tab completion?

ROS 2 completion may require extra setup. Add the appropriate source command to `.bashrc`.

Running that command from `.bashrc` whenever an interactive terminal opens enables completion for commands such as `ros2` and `colcon`.

If completion is unavailable, check the Python argcomplete package or Bash completion. The original notes spell the package `python3-ardcomplete`; the package name is `python3-argcomplete`.

Other tools, programs, and libraries can also be added as needed.


How can you configure and extend the Docker image?

A basic development installation may need a text editor, hex editor, compiler, and linter.

These examples cover only a small selection. The details depend on each developer's needs.

The presenter invites viewers to share other essentials in the video comments or the discussion thread on the Articulated Robotics Discourse forum.

Passing devices into Docker is reserved for another video. Examples include gamepads, cameras, and serial devices.

The current run command requires remembering many arguments and remains somewhat awkward for regular use.

The next videos will look at Docker Compose for organizing runtime arguments and VS Code Dev Containers for simplifying development across platforms.

The order was still undecided when the video was recorded, and the presenter invites viewers to say which topic they would like to see first.
