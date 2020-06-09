{ nixpkgs ? import <nixpkgs> {} }:

with nixpkgs;
mkShell {
  name = "idris-plugin";
  buildInputs = [
      idris
      nodejs
  ];
}
