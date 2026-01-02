from github import Github

def parse_repo_url(url: str):
    parts = url.rstrip("/").split("/")
    return parts[-2], parts[-1]

def fetch_files_from_github(repo_url: str, token: str = None):
    owner, repo_name = parse_repo_url(repo_url)
    g = Github(token) if token else Github()
    repo = g.get_repo(f"{owner}/{repo_name}")

    files_content = {}

    def traverse(contents):
        for item in contents:
            if item.type == "dir":
                traverse(repo.get_contents(item.path))
            else:
                if item.path.endswith((".py", ".md")):
                    content = item.decoded_content.decode("utf-8")
                    files_content[item.path] = content

    traverse(repo.get_contents(""))
    return files_content
