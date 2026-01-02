import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import DraftEditor from "./DraftEditor";
import * as api from "./api";

const FEATURES = [
  "overview",
  "file_structure",
  "installation",
  "usage",
  "api_functions",
  "contribution",
  "license",
];

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [token, setToken] = useState("");
  const [started, setStarted] = useState(false);

  const [features, setFeatures] = useState([]);
  const [currentFeature, setCurrentFeature] = useState(FEATURES[0]);
  const [statusMap, setStatusMap] = useState({});
  const [finalReadme, setFinalReadme] = useState(null);

  const repo = {
    generateDraft: async (feature) => {
      return await api.generateDraft(feature);
    },

    draftAction: async (feature, action, content) => {
      const res = await api.draftAction(feature, action, content);

      const newStatus =
        action === "accept"
          ? "accepted"
          : action === "skip"
          ? "skipped"
          : "retry";

      setStatusMap((prev) => ({ ...prev, [feature]: newStatus }));
      return res;
    },
  };

  const startProcessing = async () => {
    const fetched = await api.fetchRepo(repoUrl, token);
    setFeatures(fetched);
    setStatusMap(FEATURES.reduce((a, f) => ({ ...a, [f]: "pending" }), {}));
    setStarted(true);
  };

  const nextFeature = () => {
    const idx = FEATURES.indexOf(currentFeature);
    if (idx + 1 < FEATURES.length) {
      setCurrentFeature(FEATURES[idx + 1]);
    }
  };

  /* ───────────────────────── FINAL README PAGE ───────────────────────── */

  if (finalReadme) {
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Preview */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            borderRight: "1px solid #ccc",
          }}
        >
          <h2>📘 README Preview</h2>
          <ReactMarkdown>{finalReadme}</ReactMarkdown>
        </div>

        {/* Raw Markdown */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          <h2>📝 README.md</h2>
          <textarea
            value={finalReadme}
            readOnly
            style={{
              width: "100%",
              height: "90%",
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          />
        </div>
      </div>
    );
  }

  /* ───────────────────────── START PAGE ───────────────────────── */

  if (!started) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>NaviraReadme — GitHub README Generator</h2>

        <input
          style={{ width: "420px", marginRight: "10px" }}
          placeholder="GitHub Repository URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />

        <input
          style={{ width: "220px", marginRight: "10px" }}
          placeholder="GitHub Token (optional)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <button onClick={startProcessing}>Start</button>
      </div>
    );
  }

  /* ───────────────────────── DRAFT PAGE ───────────────────────── */

  return (
    <div style={{ display: "flex", height: "95vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          borderRight: "1px solid #ccc",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        <h3>Draft Sections</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {FEATURES.map((f) => (
            <li
              key={f}
              onClick={() => setCurrentFeature(f)}
              style={{
                cursor: "pointer",
                marginBottom: "6px",
                fontWeight: f === currentFeature ? "bold" : "normal",
              }}
            >
              {f.replace("_", " ")}{" "}
              {statusMap[f] === "accepted"
                ? "✅"
                : statusMap[f] === "retry"
                ? "⚠️"
                : "⬜"}
            </li>
          ))}
        </ul>
      </div>

      {/* Draft Editor */}
      <div style={{ flex: 1, padding: "10px" }}>
        <DraftEditor
          feature={currentFeature}
          repo={repo}
          nextFeature={nextFeature}
          markdownPreviewComponent={ReactMarkdown}
        />

        {Object.values(statusMap).every((s) => s !== "pending") && (
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={async () => {
                const readme = await api.finalizeReadme();
                setFinalReadme(readme);
              }}
            >
              Finalize README
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
