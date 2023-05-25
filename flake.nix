{
  description = "kerbz";
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    project-src.url = "github:ryanwtombola/Pixi-Game";
  };
  outputs = { self, nixpkgs, flake-utils, project-src }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        packages.default = pkgs.writeShellApplication {
          name = "kerbz";
          runtimeInputs = [ pkgs.nodejs  project-src ];
          text = ''
            npm i
            npm run serve
          '';
        };

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs
          ];
        };
      }
    );
}
