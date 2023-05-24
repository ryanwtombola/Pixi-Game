{
  description = "kerbz";
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        packages.default = pkgs.writeScriptBin "run" ''
          npm i
          npm run serve
        '';

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs
          ];
        };
      }
    );
}
