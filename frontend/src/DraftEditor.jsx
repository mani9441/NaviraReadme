import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const DraftEditor = ({ feature, draft, setDraft, repo, nextFeature }) => {
  const [loading, setLoading] = useState(false);

  /* ───────────── LOAD DRAFT (ONLY IF EMPTY) ───────────── */
  useEffect(() => {
    if (!draft) {
      setLoading(true);
      repo.generateDraft(feature).finally(() => setLoading(false));
    }
  }, [feature]);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const res = await repo.draftAction(feature, action, draft);

      // Retry updates draft content
      if (action === "retry") setDraft(res.draft);
      else nextFeature();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading draft...</div>;

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
