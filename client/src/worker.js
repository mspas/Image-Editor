export default () => {
  /* eslint-disable-next-line no-restricted-globals */
  self.addEventListener("message", (e) => {
    if (!e) return;

    let module = new WebAssembly.Module(e.data);
    postMessage(module);
  });
};
