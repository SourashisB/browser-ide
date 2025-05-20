let pyodidePromise: any = null;

export function loadPyodideInstance() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      // @ts-ignore
      const pyodide = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/" });
      return pyodide;
    })();
  }
  return pyodidePromise;
}