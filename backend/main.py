from fastapi import FastAPI
from pydantic import BaseModel
from github_fetcher import fetch_files_from_github
from backend.drafts import drafts, accepted, skipped, FEATURES, call_gemini

app = FastAPI()

class RepoRequest(BaseModel):
    repo_url: str
    token: str = None

class DraftAction(BaseModel):
    action: str  # accept / retry / skip
    edited_content: str = None

@app.post("/generate-draft/{feature}")
def generate_draft(feature: str, repo: RepoRequest):
    if feature not in FEATURES:
        return {"error": "Feature not found"}

    files = fetch_files_from_github(repo.repo_url, repo.token)
    draft = FEATURES[feature](files)
    drafts[feature] = draft
    return {"draft": draft}

@app.post("/draft-action/{feature}")
def draft_action(feature: str, action_data: DraftAction):
    if feature not in drafts:
        return {"error": "Draft not found"}

    action = action_data.action
    content = action_data.edited_content or drafts[feature]

    if action == "accept":
        drafts[feature] = content
        accepted.add(feature)
    elif action == "retry":
        # regenerate via Gemini
        drafts[feature] = call_gemini(content)
    elif action == "skip":
        skipped.add(feature)
    else:
        return {"error": "Invalid action"}

    return {"status": "ok", "draft": drafts[feature]}

@app.post("/finalize-readme")
def finalize_readme():
    merged_content = "\n\n---\n\n".join([drafts[f] for f in accepted])
    final_prompt = f"Polish and merge these sections into a professional README:\n{merged_content}"
    final_readme = call_gemini(final_prompt)
    return {"readme": final_readme}

