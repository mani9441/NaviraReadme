import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import DraftEditor from "./DraftEditor";
import * as api from "./api";
import "./App.css"; // Ensure your CSS is imported

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
  /* ───────────── BASIC STATE ───────────── */
  const [repoUrl, setRepoUrl] = useState("");
  const [token, setToken] = useState("");
  const [page, setPage] = useState("start"); // start | draft | final
  const [currentFeature, setCurrentFeature] = useState(FEATURES[0]);

  /* ───────────── DRAFT STATE ───────────── */
  const [statusMap, setStatusMap] = useState({});
  const [draftCache, setDraftCache] = useState({});

  /* ───────────── FINAL README STATE ───────────── */
  const [finalReadme, setFinalReadme] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  /* ───────────── START / PROGRESS STATE ───────────── */
  const [isStarting, setIsStarting] = useState(false);
  const [progressCount, setProgressCount] = useState(0);

  const progressPercent = Math.round((progressCount / FEATURES.length) * 100);

  /* ───────────── REPO ACTIONS ───────────── */
  const repo = {
    generateDraft: async (feature) => {
      return draftCache[feature] || "";
    },
    draftAction: async (feature, action, content) => {
      setDraftCache((prev) => ({ ...prev, [feature]: content }));
      const res = await api.draftAction(feature, action, content);
      if (action === "retry") {
        setDraftCache((prev) => ({ ...prev, [feature]: res.draft }));
      }
      setStatusMap((prev) => ({
        ...prev,
        [feature]:
          action === "accept"
            ? "accepted"
            : action === "skip"
            ? "skipped"
            : "retry",
      }));
      return res;
    },
  };

  const startProcessing = async () => {
    if (isStarting) return;
    try {
      setIsStarting(true);
      setProgressCount(0);
      await api.fetchRepo(repoUrl, token);
      setDraftCache({});
      setFinalReadme("");
      setIsFinalized(false);
      setStatusMap(
        FEATURES.reduce((acc, f) => ({ ...acc, [f]: "pending" }), {})
      );

      for (const feature of FEATURES) {
        const draft = await api.generateDraft(feature);
        setDraftCache((prev) => ({ ...prev, [feature]: draft }));
        setStatusMap((prev) => ({ ...prev, [feature]: "generated" }));
        setProgressCount((prev) => prev + 1);
      }
      setPage("draft");
      setCurrentFeature(FEATURES[0]);
    } catch (err) {
      console.error(err);
      alert("Failed to generate drafts");
    } finally {
      setIsStarting(false);
    }
  };

  const nextFeature = () => {
    const idx = FEATURES.indexOf(currentFeature);
    if (idx + 1 < FEATURES.length) setCurrentFeature(FEATURES[idx + 1]);
  };

  const finalizeReadme = async () => {
    setIsFinalizing(true);
    const readme = await api.finalizeReadme();
    setFinalReadme(readme);
    setIsFinalized(true);
    setIsFinalizing(false);
  };

  const RefinalizeReadme = async () => {
    setIsFinalized(false);
    const readme = await api.RefinalizeReadme();
    setFinalReadme(readme);
    setIsFinalized(true);
    setIsFinalizing(false);
  };

  const downloadReadme = () => {
    const blob = new Blob([finalReadme], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "README.md";
    a.click();
  };

  const commitToGithub = () => {
    alert("Commit to GitHub coming soon! 🚀");
  };

  /* ───────────── UI RENDERING ───────────── */
  if (page === "start") {
    return (
      <div className="start-page-container">
        <div className="start-card">
          <div className="start-header">
            <h2>NaviraReadme</h2>
            <p>Generate professional GitHub READMEs in seconds.</p>
          </div>
          <div className="form-container">
            <div className="input-group">
              <label>Repository URL</label>
              <input
                className="input-field"
                placeholder="https://github.com/username/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>
                GitHub Token <span>(Optional)</span>
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <button
              className={`btn btn-full ${isStarting ? "" : "btn-primary"}`}
              style={{
                backgroundColor: isStarting ? "#9ca3af" : "#000",
                marginTop: "8px",
              }}
              onClick={startProcessing}
              disabled={isStarting}
            >
              {isStarting ? "⚡ Analyzing Repository..." : "Generate README"}
            </button>
          </div>
          {isStarting && (
            <div className="progress-container">
              <div className="progress-header">
                <div className="progress-info">
                  <p className="progress-title">Processing Features</p>
                  <p className="progress-step">
                    Step {progressCount} of {FEATURES.length}
                  </p>
                </div>
                <span className="progress-percentage">{progressPercent}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Draft Sections</h3>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {FEATURES.map((f) => (
              <li
                key={f}
                className={`nav-item ${
                  f === currentFeature && page === "draft" ? "active" : ""
                }`}
                onClick={() => {
                  setCurrentFeature(f);
                  setPage("draft");
                }}
              >
                <span>{f.replace("_", " ")}</span>
                <span>
                  {statusMap[f] === "accepted"
                    ? "✅"
                    : statusMap[f] === "generated"
                    ? "📝"
                    : statusMap[f] === "retry"
                    ? "⚠️"
                    : "⬜"}
                </span>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button
            className={`btn btn-full ${
              page === "final" ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => setPage("final")}
          >
            📘 View Final README
          </button>
        </div>
      </aside>

      <main className="main-content">
        {page === "draft" && (
          <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
            <DraftEditor
              feature={currentFeature}
              draft={draftCache[currentFeature] || ""}
              setDraft={(val) =>
                setDraftCache((prev) => ({ ...prev, [currentFeature]: val }))
              }
              repo={repo}
              nextFeature={nextFeature}
            />
          </div>
        )}

        {page === "final" && (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <header className="top-bar">
              <h2 style={{ fontSize: "18px", margin: 0 }}>Final Document</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                {!isFinalized ? (
                  <button
                    className="btn btn-blue"
                    onClick={finalizeReadme}
                    disabled={isFinalizing}
                  >
                    {isFinalizing ? "Finalizing..." : "✨ Finalize README"}
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={RefinalizeReadme}
                    >
                      🔄 Retry
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={downloadReadme}
                    >
                      💾 Download
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={commitToGithub}
                    >
                      🚀 Commit
                    </button>
                  </>
                )}
              </div>
            </header>
            <div className="split-screen">
              <section className="preview-panel">
                <p className="panel-label">Preview</p>
                {isFinalized ? (
                  <ReactMarkdown className="markdown-body">
                    {finalReadme}
                  </ReactMarkdown>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "100px",
                      color: "#9ca3af",
                    }}
                  >
                    Click finalize to generate the live preview.
                  </div>
                )}
              </section>
              <section className="editor-panel">
                <p className="panel-label">Raw Markdown</p>
                <textarea
                  className="markdown-editor"
                  value={finalReadme}
                  onChange={(e) => setFinalReadme(e.target.value)}
                  readOnly={!isFinalized}
                  placeholder="Final markdown will appear here..."
                />
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
