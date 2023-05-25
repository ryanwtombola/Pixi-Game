{
  description = "kerbz";
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    dream2nix.url = "github:nix-community/dream2nix";
  };
  outputs = { self, nixpkgs, flake-utils, dream2nix }:
    dream2nix.lib.makeFlakeOutputs {
      systems = flake-utils.lib.defaultSystems;
      # systems = [ "x86_64-darwin" ];
      config.projectRoot = ./.;
      source = ./.;
      projects = ./projects.toml;
    };
}
