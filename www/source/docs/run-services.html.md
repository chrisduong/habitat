---
title: How to run packages
---

# Run services

Currently, services can either be run inside Docker containers or directly by using the `hab-sup` command-line interface (CLI). This topic describes how to create a Docker container for any artifact in the public depot by perform the following steps:

1. Open the dev shell container and enter the studio with the `hab-studio enter` command.
2. Change directory to the `/src/plans` directory.
3. For any built artifacts that you want to create a Docker image from, run `hab-bpm install core/hab-pkg-dockerize` to unpack and install the artifact that creates docker images for other Habitat artifacts.
4. Run `hab-bpm exec core/hab-pkg-dockerize hab-pkg-dockerize origin/packagename` with the origin and name of your artifact. These values are referenced in the pkg_origin and pkg_name settings of your plan, respectively.

        22][default:/src:1]$hab-bpm exec core/hab-pkg-dockerize hab-pkg-dockerize origin/packagename

    Habitat will proceed to unpack and install all necessary Habitat artifacts, the Habitat command-line interface (CLI) tools and binaries, the mytutorialapp artifact, and all of its dependencies. Then it will create an image using the Docker scratch image as the base image and build up the rest of the image from there.

    Once that process has completed, you can run your Docker image inside a container from to any terminal window that has access to the Docker CLI, such as the dev shell container or your host machine.

For an example of running a Habitat service in a Docker container, see the [Run your service](/tutorials/getting-started-process-build) step in the Getting Started tutorial.