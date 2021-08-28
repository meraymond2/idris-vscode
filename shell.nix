with (import <unstable> {});

mkShell {
  name = "idris-plugin";
  buildInputs = [
      idris
      nodejs
      idris2
  ];
}
