---
title: Setting up a Linux development environment
description: Installation notes and a reference to Bash commands used in day-to-day development.
pubDate: 2025-06-16
updatedDate: 2026-08-25
category: software-engineering-cs
subcategory: development-environment
type: setup-guide
tags:
- linux
- cuda
- wsl
- bash
- development-environment
researchFeatured: false
lang: en
slug: 2025-06-16-linux
translatedPosts:
  ko-KR: 2025-06-16-linux
translationKey: en-2025-06-16-linux
---

## What these notes cover

- I keep the Linux commands and tool settings I use here so I can find them again.

---

### Contents

|Section|Topic|Details|Link|
|:--:|:--|:--|:--|
|**Linux setup**|Configuring Linux|Installation and setup notes|<a href="#linux-setup">Go to section</a>|
|**Multiple CUDA versions**|Configuring multiple CUDA toolkits|Using several versions side by side|<a href="#multi-cuda-setting">Go to section</a>|
|**Mounting Google Drive**|Accessing Google Drive in WSL 2|Connecting cloud storage with rclone|<a href="#mounting-google-drive-in-wsl-2">Go to section</a>|
|**Linux commands**|Command reference|Inspecting the system and disks|<a href="#linux-commands">Go to section</a>|
|**System information**|Checking the Linux environment|lsb_release, cat /etc/os-release, uname -a|<a href="#checking-system-information">Go to section</a>|


---
## Linux setup

### Cuda Setting
I originally kept these instructions in separate notes. [Read my multi-CUDA setup below](#multi-cuda-setting).

[original-multi-cuda-notes]: https://jjo-0.github.io/%EC%A0%95%EB%A6%AC/dev/Multi-Cuda/

### Multi-Cuda Setting

I needed several CUDA versions on the same machine. Here are the steps I used.
At the lab, different AI models depended on different CUDA versions.

| Contents | Description |
|:---:|:---:|
| [Windows](#windows) | Using multiple CUDA versions on Windows |

#### Windows

##### Environment
- Windows 11
- WSL 2.0

#### Installing the CUDA Toolkit from a local runfile

**Download links**
[11.8](https://developer.nvidia.com/cuda-11-8-0-download-archive?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=runfile_local)
[12.4](https://developer.nvidia.com/cuda-12-4-0-download-archive?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=runfile_local)
[12.6](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=runfile_local)
[Full CUDA Toolkit archive](https://developer.nvidia.com/cuda-toolkit-archive)

#### Installing GCC

On this machine, the default GCC 13.3 did not work with CUDA 11.8, so I selected an older compiler for that toolkit.

**Commands**

```bash
# ==============================
# 1) Remove the existing CUDA toolkit inside WSL.
# ==============================
sudo apt-get purge nvidia-cuda-toolkit # Remove the packaged toolkit.
sudo apt-get autoremove #
sudo rm -rf /usr/local/cuda*

# Check the GCC version.
gcc --version

# Install GCC 12 and 13.
sudo apt-get install gcc-12 g++-12

# Switch to GCC 12.
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-12 60 --slave /usr/bin/g++ g++ /usr/bin/g++-12

# update-alternatives manages programs installed in multiple versions.
# --install adds an alternative.
# /usr/bin/gcc is the generic command path.
# gcc is the name of the link group.
# /usr/bin/gcc-12 is the actual executable selected for this alternative.
# 60 is its priority. In automatic mode, a higher priority takes precedence.
# --slave /usr/bin/g++ g++ /usr/bin/g++-12 ties the C++ compiler to this GCC selection.
  # /usr/bin/g++ is the generic path for the dependent link.
  # g++ is the name of the dependent link.
  # /usr/bin/g++-12 is the executable to which that link points.

# Verify that GCC 12 is selected.
gcc --version

# ==============================
# 2) Install the CUDA versions.
# ==============================
# Install CUDA 11.8.
sudo sh cuda_11.8.0_520.61.05_linux.run

# Switch to GCC 13.
sudo apt install gcc-13 g++-13
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-13 70 --slave /usr/bin/g++ g++ /usr/bin/g++-13
```

#### My environment configuration

Setting up CUDA in WSL: [WSL guide](https://cjkangme.github.io/posts/2024-02-15-wsl2로-cuda-환경-설정하기-cudacudnn-설치까지/)
Running graphical applications in WSL: [WSL GUI apps](https://learn.microsoft.com/ko-kr/windows/wsl/tutorials/gui-apps)

```bash
# In ~/.bashrc

#####################
### User Setting ###
#####################

# Initialize pyenv.
export PATH="/home/jo/.pyenv/bin:$PATH"
eval "$(pyenv init --path)"
eval "$(pyenv virtualenv-init -)" # Add the Miniforge3 path below.
export PATH="/home/jo/.pyenv/versions/miniforge3-24.11.0-1/bin:$PATH"

alias update='sudo apt update && sudo apt upgrade -y && sudo apt autoclean -y && sudo apt autoremove -y'

function switch_cuda {
    local version=$1
    local gcc_version

    case "$version" in
        11.3)
            gcc_version="gcc-9"
            cuda_path="/usr/local/cuda-11.3"
            ;;
        11.8)
            gcc_version="gcc-12"
            cuda_path="/usr/local/cuda-11.8"
            ;;
        12.4)
            gcc_version="gcc-13"
            cuda_path="/usr/local/cuda-12.4"
            ;;
        12.6)
            gcc_version="gcc-13"
            cuda_path="/usr/local/cuda-12.6"
            ;;
        *)
            echo "Unsupported CUDA version. Available versions: 11.3, 11.8, 12.4, 12.6"
            return 1
            ;;
    esac

    # Switch GCC.
    sudo update-alternatives --set gcc /usr/bin/$gcc_version

    # Switch CUDA.
    sudo update-alternatives --set cuda $cuda_path

    # Set the environment variables.
    export PATH=$cuda_path/bin:$PATH
    export LD_LIBRARY_PATH=$cuda_path/lib64:$LD_LIBRARY_PATH

    echo "Switched to CUDA $version."
    gcc --version
    g++ --version
    nvcc --version
}
```

#### Checking the installed version

```bash
# Check the cuDNN version.
dpkg -l | grep cudnn
```

#### What is CUDA?

CUDA (Compute Unified Device Architecture) is NVIDIA's parallel computing platform. It gives developers access to a GPU's virtual instruction set and parallel processing resources. Languages such as C can be used to write algorithms that run across GPU threads.

1. Three capabilities are particularly relevant here.
   1. Workloads that parallelize well can run more than ten times faster in some applications.
   2. Kernels can use scattered reads, fast shared memory, and integer and bitwise operations.
   3. Both low-level and high-level APIs are available.

The following sections cover CUDA's execution model, release differences, installation, and configuration,
including how to use more than one toolkit in the same development environment.

#### CUDA's execution model

CUDA is NVIDIA's platform for parallel computation.
A GPU has many parallel execution units and can keep thousands of threads active.

#### CUDA features

1. The programming model exposes the GPU's parallel processing capabilities.
2. Operating on data already on the device can avoid host–device transfers. Shared memory can accelerate access within a thread block.

#### Differences between CUDA releases

CUDA progressed from 1.0 (2007) through 2.0 (2008), 3.0 (2010), 4.0 (2011), 5.0 (2012), 6.0 (2014), 7.0 (2015), 8.0 (2016), 9.0 (2017), 10.0 (2018), and 11.0 (2020). Across releases, improvements included parallel execution, memory management, SIMD performance, energy efficiency, and support for new GPU architectures.

Hardware and software compatibility also vary. Check your GPU architecture, operating system, compiler, and libraries against the toolkit version you intend to use.

#### Installation considerations

1. **System requirements.** Check the minimum GPU architecture and kernel version. These notes were written for a Pascal-or-newer setup.
2. **NVIDIA driver.** The Windows/WSL configuration described here uses a Windows production driver from the R495 family or later. Native Linux uses its own driver and toolkit packages.
3. **Development environment.** Installation differs across Windows, Linux, and WSL. Support for some developer tools and Unified Memory features depends on the environment.

#### Configuring multiple CUDA versions

The main considerations for using CUDA toolkits side by side on Windows, Linux, and WSL are listed below.

- Windows
  - Install a compatible production driver. The configuration in these notes assumes R495 or later.
  - Enable WSL 2, install a Linux distribution such as Ubuntu, and install the CUDA Toolkit in that distribution.
  - Multiple GPUs can share a compatible driver configuration.

- Linux
  - Check which GPU architectures and package versions the toolkit supports.
  - When installing another toolkit, avoid overwriting a working driver.
  - An unsupported Maxwell GPU may appear to work, but this configuration has no support guarantee.

- WSL
  - WSL uses the Windows display driver. Installing a separate Linux display driver inside WSL is unnecessary.
  - Check the location of `nvidia-smi` and the restrictions on Unified Memory and multi-GPU selection for the configuration you use.
  - The setup documented here assumes a WSL kernel of at least 4.19.121 (5.10.16.3 or later preferred) and a Pascal-or-newer GPU.

#### Common problems and possible fixes

- **Race condition.** Synchronize access to shared resources.
- **Deadlock.** Acquire resources in a consistent order across threads.
- **Livelock.** Limit repeated interactions between contending threads, for example with a timeout or backoff.
- **Scalability.** Revisit the algorithm, memory access, and data partitioning as the workload grows.

#### Further reading

- Official NVIDIA CUDA documentation: https://docs.nvidia.com/cuda/
- Book: *CUDA by Example*, by Jason Sanders and Edward Kandrot
- Developer forum: https://forums.developer.nvidia.com/c/gpu-computing/cuda/
- CUDA questions on Stack Overflow: https://stackoverflow.com/questions/tagged/cuda

#### Conclusion

CUDA makes GPU parallelism accessible across hardware generations and on Windows, Linux, and WSL. In practice, driver and GPU compatibility and the available development tools determine which setup works. These considerations carry over to AI, machine learning, and data science workloads.

### Switching ROS 2 environments

> As of August 25, 2026, the Tier 1 Ubuntu platform for Humble is 22.04. Jazzy and Kilted target 24.04. Check supported combinations and end-of-support dates in [REP-2000](https://www.ros.org/reps/rep-2000.html). Keep system packages built for different Ubuntu releases in separate environments.

#### ROS 2 Distro Switcher
This example switches between ROS 2 environments supported on the same OS or isolated with containers or RoboStack. In the setup described here, Jazzy is the default for a new long-term Ubuntu 24.04 project and Humble serves existing Ubuntu 22.04 machines.

##### 📦 Requirements

- Use a pairing supported in REP-2000, such as Ubuntu 22.04 with Humble or Ubuntu 24.04 with Jazzy.
- I used **RoboStack** on Ubuntu 24.04.
  - RoboStack distributes ROS binaries through the conda-forge ecosystem, letting different operating systems use ROS without installing its dependencies as system packages.
  - For a RoboStack installation, activating the conda environment handles setup. The switcher below is for separate ROS installation trees.
- The example expects ROS 2 installations at `/opt/ros/humble` and `/opt/ros/jazzy` in the corresponding environments.
- Bash or Zsh

- 🛠️ Customization
  - Adjust `ROS_DOMAIN_ID` and `ROS_LOCALHOST_ONLY` to suit the project.
  - To load a colcon workspace, add `source ~/your_ws/install/setup.bash` inside `switch_ros`.
  - For distribution-specific workspaces, add `source ~/ws_humble/install/setup.bash` or `source ~/ws_jazzy/install/setup.bash` in the corresponding case block in `~/.bashrc`.
  - If a graphical application needs an X server such as VcXsrv or XQuartz, check its configuration and the `DISPLAY` variable.

```bash
# In ~/.bashrc or ~/.zshrc
# ───────── ROS distribution switcher ─────────
function switch_ros {
    local distro="$1"
    case "$distro" in
        humble)
            source /opt/ros/humble/setup.bash
            export ROS_DOMAIN_ID=0
            export ROS_LOCALHOST_ONLY=0
            ;;
        jazzy)
            source /opt/ros/jazzy/setup.bash
            export ROS_DOMAIN_ID=0
            export ROS_LOCALHOST_ONLY=0
            ;;
        *)
            echo "Usage: switch_ros {humble|jazzy}"
            return 1
            ;;
    esac
    echo "Switched to ROS 2 $distro"
    printenv ROS_DISTRO
    ros2 doctor --report
}

alias ros_humble='switch_ros humble'
alias ros_jazzy='switch_ros jazzy'
```

Reload the configuration file.

```bash
source ~/.bashrc   # Or source ~/.zshrc for Zsh.

# Remove the leading # from the command you want to run.
# Switch to Humble.
# ros_humble
# switch_ros humble

# Switch to Jazzy.
# ros_jazzy
# switch_ros jazzy
```

### Mounting Google Drive in WSL 2

I use **`rclone`** to access Google Drive inside WSL 2. It exposes a remote cloud store through a local directory so applications can navigate it like a filesystem.

#### Step 1. Install rclone

Open a WSL terminal, such as Ubuntu. The example uses the project's installation script to obtain a newer version than the one that may be available from the distribution's apt repository.

```bash
curl https://rclone.org/install.sh | sudo bash
```

Once installation completes, check which version is available.

```bash
rclone --version
```

#### Step 2. Connect rclone to Google Drive

Configure `rclone` to access your Google Drive account.

1. Start the configuration tool with `rclone config`.

```bash
rclone config
```

2. In the version used here, the prompts appear in the following order.

- At `n) New remote`, enter **`n`** and press Enter.
- At `name>`, give the remote a name. This example uses **`gdrive`**.
- At `Storage>`, choose Google Drive. The numeric index can change, so use the backend name **`drive`** or the number shown for it.
- At `client_id>`, press **Enter** to use the default.
- At `client_secret>`, press **Enter** to use the default.
- At `scope>`, choose the desired access scope. This setup uses **`1`** for full Drive access.
- At `root_folder_id>`, press **Enter** unless you want to mount a particular root folder.
- At `service_account_file>`, press **Enter**.
- At `Edit advanced config?`, enter **`n`** and press Enter.
- At `Use auto config?`, enter **`y`** and press Enter.
  - **The default Windows browser opens.** Sign in to your Google account and authorize `rclone` to access the requested Drive files.
- At `Configure this as a team drive?`, enter **`n`** for a personal drive.
- At `Yes this is OK`, review the configuration, enter **`y`**, and press Enter.
- Enter **`q`** to leave the configuration tool.

#### Step 3. Mount Google Drive

Connect the configured remote to a directory in WSL.

1. **Create a mount point.** Make an empty directory under your home directory.

```bash
mkdir -p ~/gdrive
```

2. **Mount Google Drive.** Run the following command to mount the `gdrive` remote at `~/gdrive`.

```bash
rclone mount gdrive: ~/gdrive --daemon
```

- `gdrive:` refers to the remote created in step 2. **Include the trailing colon.**
- `~/gdrive` is the local mount point you just created.
- `--daemon` runs `rclone` in the background so that the terminal remains available.

3. **Check the mount.** Run `ls` on the mounted directory. You should see the files and folders in Google Drive.

```bash
ls ~/gdrive
```

#### Unmounting and automatic mounting

**Unmounting.** Use the command below to disconnect the drive.

```bash
fusermount -u ~/gdrive
```

**Mounting when WSL starts.** To attempt the mount when a new shell opens, append the script below to `~/.bashrc` (or `~/.zshrc` for Zsh).

1. Open the file with `nano ~/.bashrc`.
2. Paste this block at the end of the file.

```bash
# Mount Google Drive automatically.
if ! mount | grep -q "on ${HOME}/gdrive type fuse.rclone"; then
  rclone mount gdrive: ~/gdrive --daemon
fi
```

3. Press `Ctrl+X`, then `Y` and `Enter` to save and exit. Opening a new terminal will now attempt the mount.


## Linux commands

### Checking system information

```bash
# Identify the Ubuntu release.
lsb_release -a
# Example output
# No LSB modules are available.
# Distributor ID: Ubuntu
# Description:    Ubuntu 20.04.2 LTS
# Release:        20.04
# Codename:       focal

cat /etc/os-release
# Example output
# NAME="Ubuntu"
# VERSION="20.04.2 LTS (Focal Fossa)"
# ID=ubuntu
# ID_LIKE=debian
# HOME_URL="https://www.ubuntu.com/"
# SUPPORT_URL="https://help.ubuntu.com/"
# BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
# PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
# VERSION_CODENAME=focal
# UBUNTU_CODENAME=focal

# Inspect the system and kernel.
uname -a
# Example output
# Linux DESKTOP-1 5.4.0-105-generic #118-Ubuntu SMP Fri Jun 4 08:59:58 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
# Fields: system name (Linux), host (DESKTOP-1), kernel release (5.4.0-105-generic), build (#118-Ubuntu SMP Fri Jun 4 08:59:58 UTC 2021), architecture (x86_64), and OS (GNU/Linux).


```

### Disks

```bash

# Inspect partitions.
sudo fdisk -l # List partitions.
lsblk # List block devices.

# Format the selected partition. Formatting replaces the filesystem on it.
sudo mkfs.vfat -F 32 -n "USB" /dev/sdb1 # FAT32 example
sudo mkfs.ext4 -L "USB" /dev/sdb1 # ext4 alternative
# ext4 is commonly used on Linux.
# For drives that move between operating systems, check filesystem support on each OS.


sudo dmesg # Read kernel messages.

# Calculate disk usage for entries in the current directory.
du -sh * | sort -rh | less # Show totals, largest first, one screen at a time.
# Example: sudo du -h / | sort -rh | head -n 10. A full disk can leave sort without temporary space.
sudo du -h / 2>/dev/null | grep '[0-9]G' # Find gigabyte-sized entries without sorting.
sudo du -h / | sort -rh | head -n 10 # Use this when space is available for sorting.

# Show free and used space by filesystem.
sudo df -h

# Clean up unused packages and caches.
sudo apt-get autoremove -y && sudo apt-get autoclean
conda clean --all # Clean the conda cache.
pip cache purge # Clean the pip cache.
```

<details>
  <summary>
    Understanding du
  </summary>
  <pre>
    du (disk usage) estimates how much disk space files and directories occupy.
    Options:
    -s (summarize) prints a total for each argument instead of listing every subdirectory or file.
    -h (human-readable) uses units such as K, M, and G.
    * is a shell wildcard. By default it expands to non-hidden entries in the current directory.
    | (pipe) passes the standard output of the command on its left to the standard input of the one on its right.

    sort puts lines from a file or another command into order.
    Options:
    -r reverses the sort order.
    -h sorts human-readable numbers such as 20M and 1G by magnitude.
    -n sorts numerically.
    -k selects a field or range of fields as the sort key.
    -t sets the field separator.
    -u keeps one line for each equal sort key.

    less displays text one screen at a time.
    Options:
    -p opens at a matching pattern.
    -N displays line numbers.
    -R allows supported color escape sequences.
    -S clips long lines horizontally instead of wrapping them.
  </pre>
</details>

<details>
  <summary>
    What the package cleanup removes
  </summary>
  <pre>
    sudo apt-get autoremove -y :

    <b>What gets removed</b>
    APT removes automatically installed dependencies that are no longer required.<br>
    This can include libraries or executables owned by those packages. Autoclean also removes obsolete downloaded package archives.<br>

    <b>What it keeps</b>
    Packages marked as manually installed remain installed.<br>
    A normal removal generally leaves package configuration files and personal data in place.
  </pre>
</details>

## Commands for the development machine

### Jetson AGX Orin, Xavier NX, Jetson Nano

```bash
# Inspect system information.
# Monitor CPU, GPU, memory, and temperature on a Jetson Orin NX in real time.
sudo tegrastats
```

#### Reading jtop
jtop reports live CPU and GPU usage, memory consumption, and temperatures on the Jetson Orin NX.
```bash
# Run jtop.
sudo jtop

# Install jtop.
sudo apt update
sudo apt install -y python3-pip
sudo pip3 install -U jetson-stats
```

**First page: All**
- Top section
  - Model: the Jetson model in use.
  - JetPack: the installed JetPack version.
  - L4T: the installed Linux for Tegra version.
- Middle section
  - CPU: utilization for each core, displayed as a percentage (for example, 10%).
  - Mem: RAM in use versus capacity, for example 4.8G/61.4G.

---

#### Installing PyTorch for Jetson
The Jetson Orin NX uses platform-specific PyTorch builds. The commands below record the setup I used.
Follow the instructions for the corresponding releases.
[Installing PyTorch for Jetson](https://docs.nvidia.com/deeplearning/frameworks/install-pytorch-jetson-platform/index.html)
[Installing JetPack](https://developer.nvidia.com/embedded/jetpack)
[cuSPARSELt downloads](https://docs.nvidia.com/cuda/cusparselt/index.html)
[Compatibility table](https://docs.nvidia.com/deeplearning/frameworks/install-pytorch-jetson-platform-release-notes/pytorch-jetson-rel.html#pytorch-jetson-rel) for selecting a matching build.
[torchvision installation](https://github.com/pytorch/vision) for the installed PyTorch and Python versions.

##### What torch, torchvision, and torchaudio provide

**Pytorch**
**PyTorch** is an open-source deep learning framework originally developed under Facebook's leadership.
**Dynamic computation graphs** let the graph follow the code that actually runs, which makes it easier to change and debug a model.
**GPU acceleration and autograd.** PyTorch records operations and can automatically compute derivatives during backpropagation.
[PyTorch overview](https://pytorch.org/docs/stable/index.html)

**TorchVision**
**Torchvision** is the computer vision library in the PyTorch ecosystem.
It provides datasets, models, image transforms, and tools that work with data loaders.
These tools simplify preprocessing and training.
**Data loading.** Dataset interfaces cover image collections such as CIFAR, ImageNet, and MNIST.
**Model architectures.** Implementations and pretrained weights for models such as ResNet, VGG, and Faster R-CNN support transfer learning and model comparisons.
**Image transforms.** Functions include resizing, cropping, and normalization.
[torchvision repository](https://github.com/pytorch/vision)

**Torchaudio**
**Torchaudio** is the audio processing library in the PyTorch ecosystem.
It integrates audio I/O and transforms such as spectrograms and mel-frequency cepstral coefficients (MFCCs) with PyTorch tensors.
**Loading audio.** Supported backends can read and write formats such as WAV and MP3.
**Preprocessing.** Audio workflows include spectral analysis, noise reduction, and augmentation.
**Applications.** Examples include speech recognition, music classification, and audio event detection.
[torchaudio repository](https://github.com/pytorch/audio)

```bash
# 1. Install JetPack. Version 6.2 was the latest in February 2025.
# I skipped this step because someone had already installed JetPack 6.0 on my board.

# 2. Install the system packages required by PyTorch.
sudo apt-get -y update
sudo apt-get install -y  python3-pip libopenblas-dev

# 3. For NVIDIA's 24.06 PyTorch build or later, install cuSPARSELt first.
# Use the download link above. The first site I tried did not work for me.

# 4. Create a conda environment for the PyTorch version. Choose a name for the placeholder.
conda create -n  {conda_env name} python=3.10
conda activate {conda_env name}

# 5. Install PyTorch.
# Finding the right build took the most time in my setup.
# For JetPack 6.0, I looked for a matching build under https://developer.download.nvidia.cn/compute/redist/jp/v60/pytorch/
# After several unsuccessful attempts with individual paths, I inspected the files under https://developer.download.nvidia.cn/compute/redist/jp/v60/pytorch/
# The command below performs a recursive download.
#   wget -r -np -nd https://developer.download.nvidia.cn/compute/redist/jp/v60/pytorch/

# These were the wheel filenames I found:
#   torch-2.4.0a0+07cecf4168.nv24.05.14710581-cp310-cp310-linux_aarch64.whl
#   torch-2.4.0a0+3bcc3cddb5.nv24.07.16234504-cp310-cp310-linux_aarch64.whl (the wheel I selected)
#   torch-2.4.0a0+f70bd71a48.nv24.06.15634931-cp310-cp310-linux_aarch64.whl
export TORCH_INSTALL=https://developer.download.nvidia.cn/compute/redist/jp/v60/pytorch/torch-2.4.0a0+3bcc3cddb5.nv24.07.16234504-cp310-cp310-linux_aarch64.whl # Select a build compatible with your system.
python3 -m pip install --no-cache $TORCH_INSTALL

# Verify the PyTorch installation.
python3 -c "import torch; print('PyTorch version:', torch.__version__); print('CUDA available:', torch.cuda.is_available())"
# Expected output
# Example:
# PyTorch version: 2.4.0a0+3bcc3cddb5.nv24.07
# CUDA available: True

# 6. Install torchvision.
git clone --branch release/0.19 https://github.com/pytorch/vision.git # I used the 0.19 release.
cd vision
python3 setup.py install
  # Verify the torchvision installation.
python3 -c "import torchvision; print('torchvision version:', torchvision.__version__)"
python3 -c "import torchaudio; print('torchaudio version:', torchaudio.__version__)"

```
