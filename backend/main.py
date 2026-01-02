from fastapi import FastAPI
from pydantic import BaseModel
from github_fetcher import fetch_files_from_github
from drafts import drafts, accepted, skipped, FEATURES, call_gemini
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],  # frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # VERY IMPORTANT
    allow_headers=["*"],
)

# Store repo files in memory
repo_files = {}

class RepoRequest(BaseModel):
    repo_url: str
    token: str = None

class DraftAction(BaseModel):
    action: str
    edited_content: str = None

# Single-time repo fetch
@app.post("/fetch-repo")
def fetch_repo(repo: RepoRequest):
    files = fetch_files_from_github(repo.repo_url, repo.token)
    repo_files["files"] = files
    return {"status": "ok", "features": list(FEATURES.keys())}

# Generate draft for a feature
@app.post("/generate-draft/{feature}")
def generate_draft(feature: str):
    if feature not in FEATURES:
        return {"error": "Feature not found"}

    # ✅ If already generated, return cached draft
    if feature in drafts:
        return {
            "draft": drafts[feature],
            "cached": True
        }

    files = repo_files.get("files", {})
    draft = FEATURES[feature](files)  # Gemini called ONCE
    drafts[feature] = draft

    return {
        "draft": draft,
        "cached": False
    }

@app.get("/draft/{feature}")
def get_draft(feature: str):
    return {
        "draft": drafts.get(feature, ""),
        "exists": feature in drafts
    }


# Draft actions: accept / retry / skip
@app.post("/draft-action/{feature}")
def draft_action(feature: str, action_data: DraftAction):
    if feature not in FEATURES:
        return {"error": "Feature not found"}

    action = action_data.action
    edited = action_data.edited_content

    if action == "accept":
        drafts[feature] = edited or drafts.get(feature, "")
        accepted.add(feature)
    elif action == "retry":
        files = repo_files.get("files", {})
        drafts[feature] = FEATURES[feature](files)
    elif action == "skip":
        skipped.add(feature)
    else:
        return {"error": "Invalid action"}

    return {"status": "ok", "draft": drafts[feature]}

# Final README merge & polishing
final_readme_cache = None

@app.post("/finalize-readme")
def finalize_readme():
    global final_readme_cache

    if final_readme_cache:
        return {"readme": final_readme_cache}

    merged = "\n\n---\n\n".join([drafts[f] for f in accepted])
    final_prompt = f"Polish and merge these sections into a professional README:\n{merged}"
    final_readme_cache = call_gemini(final_prompt)

    return {"readme": final_readme_cache}
