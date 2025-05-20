import React from "react";
import CodeEditor from "./components/CodeEditor";
import FileExplorer from "./components/FileExplorer";
import Terminal from "./components/Terminal";
import ResizablePane from "./components/ResizablePane";
import { FileType } from "./types";
import { loadPyodideInstance } from "./pyodide/pyodideLoader";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const DEFAULT_FILE = { name: "main.py", content: "print('Hello from Python!')" };

function App() {
  const [files, setFiles] = React.useState<FileType[]>([DEFAULT_FILE]);
  const [currentFile, setCurrentFile] = React.useState<string>("main.py");
  const [output, setOutput] = React.useState<string>("");
  const [pyodide, setPyodide] = React.useState<any>(null);
  const [loadingPyodide, setLoadingPyodide] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      // Load pyodide from CDN
      // @ts-ignore
      if (!window.loadPyodide) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
        script.onload = async () => {
          const instance = await loadPyodideInstance();
          setPyodide(instance);
          setLoadingPyodide(false);
        };
        document.body.appendChild(script);
      } else {
        const instance = await loadPyodideInstance();
        setPyodide(instance);
        setLoadingPyodide(false);
      }
    })();
  }, []);

  const onCodeChange = (newCode: string) => {
    setFiles(files =>
      files.map(f => f.name === currentFile ? { ...f, content: newCode } : f)
    );
  };

  const onAddFile = () => {
    let base = "untitled";
    let idx = 1;
    let candidate = `${base}${idx}.py`;
    while (files.some(f => f.name === candidate)) {
      idx++;
      candidate = `${base}${idx}.py`;
    }
    setFiles([...files, { name: candidate, content: "" }]);
    setCurrentFile(candidate);
  };

  const onDeleteFile = (filename: string) => {
    if (files.length === 1) return;
    setFiles(fs => fs.filter(f => f.name !== filename));
    if (currentFile === filename) {
      const idx = files.findIndex(f => f.name === filename);
      const next = files[idx === 0 ? 1 : idx - 1];
      setCurrentFile(next.name);
    }
  };

  const onRenameFile = (oldName: string, newName: string) => {
    if (!/^[\w\-]+\.py$/.test(newName)) return alert("Invalid filename (must end with .py and use only letters, numbers, _, -)");
    if (files.some(f => f.name === newName)) return alert("File already exists");
    setFiles(fs => fs.map(f => f.name === oldName ? { ...f, name: newName } : f));
    if (currentFile === oldName) setCurrentFile(newName);
  };

  const runCode = async () => {
    if (!pyodide) return;
    setOutput("[Running Python...]\n");
    // Write all files to Pyodide's FS
    for (const file of files) {
      try {
        pyodide.FS.writeFile(file.name, file.content);
      } catch (e) {
        // File may not exist yet
        pyodide.FS.writeFile(file.name, file.content, { encoding: "utf8" });
      }
    }
    try {
      // Redirect stdout/stderr
      let stdout = "";
      let stderr = "";
      pyodide.setStdout({ batched: (s: string) => { stdout += s; } });
      pyodide.setStderr({ batched: (s: string) => { stderr += s; } });

      await pyodide.runPythonAsync(`import sys\nsys.path.append('.')`);
      await pyodide.runPythonAsync(files.find(f => f.name === currentFile)!.content);
      setOutput(stdout + (stderr ? "\n[stderr]\n" + stderr : ""));
    } catch (err: any) {
      setOutput(prev => prev + "\n[Python Error]\n" + (err.toString() || "Unknown error"));
    }
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    for (const file of files) {
      zip.file(file.name, file.content);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "python_project.zip");
  };

  const currentFileObj = files.find(f => f.name === currentFile)!;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#181818", color: "#fff", display: "flex", flexDirection: "column" }}>
      <header style={{ background: "#252526", padding: "10px 20px", fontWeight: 600, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>Python Browser IDE</span>
        <div>
          <button onClick={runCode} disabled={loadingPyodide} style={{ marginRight: 8, padding: "6px 16px", fontSize: 16, background: "#007acc", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            ▶️ Run
          </button>
          <button onClick={downloadZip} style={{ padding: "6px 16px", fontSize: 16, background: "#3c3c3c", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            📦 Download ZIP
          </button>
        </div>
      </header>
      <div style={{ flex: 1, display: "flex", height: "1px" }}>
        <ResizablePane direction="horizontal" initialSize={220} minSize={140} maxSize={400}>
          {/* File Explorer */}
          <FileExplorer
            files={files}
            currentFile={currentFile}
            onSelect={setCurrentFile}
            onAdd={onAddFile}
            onDelete={onDeleteFile}
            onRename={onRenameFile}
          />
          {/* Editor + Terminal (Vertical Split) */}
          <ResizablePane direction="vertical" initialSize={window.innerHeight * 0.56} minSize={100} maxSize={window.innerHeight * 0.9}>
            {/* Code Editor */}
            <div style={{ height: "100%", background: "#1e1e1e" }}>
              <CodeEditor
                code={currentFileObj.content}
                onChange={onCodeChange}
              />
            </div>
            {/* Terminal */}
            <Terminal
              output={output}
              onClear={() => setOutput("")}
            />
          </ResizablePane>
        </ResizablePane>
      </div>
      {loadingPyodide && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.7)", color: "#fff", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ fontSize: 22 }}>Loading Python engine...</div>
        </div>
      )}
    </div>
  );
}

export default App;