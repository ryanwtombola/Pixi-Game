# Kerbz
You start in the Vehicle Assembley Building (VAB) with a pre-assembled rocket which you can edit to your liking or scrap entirely.
You can place a part by hovering over where you want to place it and using the scroll wheel to select a part then placing it with left click. Once you are happy with your rocket you can press M to go to the launch pad.
From there you can press or hold W to thrust your engines and blastoff or use A and D to rotate the craft while in the air, also you can use Q & E to increase or decrease time warp.
You can also use the scroll wheel to zoom or press M to switch beteen map and rocket view. 

## Building
Tested on Linux and MacOS. 
Windows / WSL2 may work but is untested.

### Install Nix
Install Nix using the [Determinate Installer](https://github.com/DeterminateSystems/nix-installer) and refresh your shell.
```bash
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
exec $SHELL
```
Alternatively you can install Nix from the [official website](https://nixos.org/download.html) and enable [nix-command and flakes](https://nixos.wiki/wiki/Flakes) manually.

### Building with Nix
Clone and enter the repo then `nix run` to serve the project
```bash
git clone https://github.com/ryanwtombola/Pixi-Game
cd Pixi-Game
nix run
```

### Building without Nix
Ensure you have node installed on your system.
```bash
git clone https://github.com/ryanwtombola/Pixi-Game
cd Pixi-Game
npm i
npm run serve
```