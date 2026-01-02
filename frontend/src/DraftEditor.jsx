import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import * as api from "./api";

const DraftEditor = ({ feature, repo, nextFeature }) => {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  /* ───────────────────────── LOAD DRAFT (CACHED) ───────────────────────── */

  const loadDraft = async () => {
    setLoading(true);

    try {
      const res = await api.getDraft(feature);

      if (res.exists) {
        // ✅ Use cached draft
        setDraft(res.draft);
      } else {
        // ✅ Generate only ONCE
        const generated = await repo.generateDraft(feature);
        setDraft(generated);
      }
    } catch (err) {
      console.error("Failed to load draft:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDraft();
  }, [feature]);

  /* ───────────────────────── ACTION HANDLERS ───────────────────────── */

  const handleAction = async (action) => {
    setLoading(true);

    try {
      const res = await repo.draftAction(feature, action, draft);

      // Retry regenerates, others just move forward
      if (action === "retry") {
        setDraft(res.draft);
      } else {
        nextFeature();
      }
    } catch (err) {
      console.error("Draft action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading draft...</div>;

  /* ───────────────────────── UI ───────────────────────── */

  return (
    <div style={{ display: "flex", height: "80vh" }}>
      {/* Preview */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          borderRight: "1px solid gray",
          overflowY: "auto",
        }}
      >
        <h3>Preview</h3>
        <ReactMarkdown>{draft}</ReactMarkdown>
      </div>

      {/* Editor */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3>Editor</h3>

        <textarea
          style={{
            flex: 1,
            width: "100%",
            resize: "none",
            fontFamily: "monospace",
            fontSize: "14px",
          }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: "10px",
          }}
        >
          <button onClick={() => handleAction("accept")}>Accept</button>
          <button onClick={() => handleAction("retry")}>Retry</button>
          <button onClick={() => handleAction("skip")}>Skip</button>
        </div>
      </div>
    </div>
  );
};

export default DraftEditor;
