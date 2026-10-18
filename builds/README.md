# builds/

Commit each project exactly as downloaded:

- `bolt.zip`
- `aistudio.zip`

To run the shared eval, copy the function each build uses for your chosen EARS row into `evals/impl/bolt.js` and `evals/impl/aistudio.js`, changing only what is needed to export it. Note any change you made in the DDR for that builder.
