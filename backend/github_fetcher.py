import os
import shutil
import tempfile
from github import Github
from github.GithubException import RateLimitExceededException
from git import Repo

ALLOWED_EXTENSIONS = (".py", ".md")


def parse_repo_url(url: str):
    parts = url.rstrip("/").split("/")
    return parts[-2], parts[-1]


def fetch_files_from_github(repo_url: str, token: str = None):
    owner, repo_name = parse_repo_url(repo_url)

    try:
        # ─────────────── Attempt GitHub API ───────────────
        g = Github(token) if token else Github()
        repo = g.get_repo(f"{owner}/{repo_name}")

        files_content = {}

        def traverse(contents):
            for item in contents:
                if item.type == "dir":
                    traverse(repo.get_contents(item.path))
                else:
                    if item.path.endswith(ALLOWED_EXTENSIONS):
                        files_content[item.path] = (
                            item.decoded_content.decode("utf-8", errors="ignore")
                        )

        traverse(repo.get_contents(""))
        print("✅ Files fetched via GitHub API")
        return files_content

    except RateLimitExceededException:
        print("⚠️ GitHub rate limit hit — falling back to git clone")
        return fetch_via_git_clone(repo_url, token)


# ───────────────────────── FALLBACK: GIT CLONE ─────────────────────────

def fetch_via_git_clone(repo_url: str, token: str = None):
    temp_dir = tempfile.mkdtemp()
    files_content = {}

    try:
        clone_url = repo_url

        # Private repo support
        if token:
            clone_url = repo_url.replace(
                "https://", f"https://{token}@"
            )

        Repo.clone_from(clone_url, temp_dir)

        for root, _, files in os.walk(temp_dir):
            for file in files:
                if file.endswith(ALLOWED_EXTENSIONS):
                    path = os.path.join(root, file)
                    rel_path = os.path.relpath(path, temp_dir)

                    with open(path, "r", encoding="utf-8", errors="ignore") as f:
                        files_content[rel_path] = f.read()

        print("✅ Files fetched via git clone")
        return files_content

    finally:
        # 🔥 Important: cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)
