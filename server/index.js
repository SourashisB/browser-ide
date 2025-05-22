const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

// Utility to save files to a temporary directory
function saveFilesToTempDir(filesTree, tempDir) {
  function recurse(node, currPath) {
    if (node.type === 'folder') {
      const folderPath = path.join(currPath, node.name);
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
      node.children.forEach(child => recurse(child, folderPath));
    } else if (node.type === 'file') {
      const filePath = path.join(currPath, node.name);
      fs.writeFileSync(filePath, node.content || '');
    }
  }
  recurse(filesTree, tempDir);
}

app.post('/run', async (req, res) => {
  try {
    const { filesTree, mainFile } = req.body;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyide-'));

    // Save all files/folders to tempDir
    saveFilesToTempDir(filesTree, tempDir);

    // Run python on the main file
    const mainFilePath = path.join(tempDir, mainFile);

    execFile('python', [mainFilePath], { cwd: tempDir }, (error, stdout, stderr) => {
      // Remove tempDir after execution
      fs.rmSync(tempDir, { recursive: true, force: true });

      if (error) {
        return res.json({
          stdout,
          stderr: stderr || error.message,
          success: false,
        });
      }
      res.json({
        stdout,
        stderr,
        success: true,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log('Python IDE backend running on http://localhost:5000');
});