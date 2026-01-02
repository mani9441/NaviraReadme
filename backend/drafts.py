from gemini_client import call_gemini

# Draft storage
drafts = {}       # feature_name -> draft_content
accepted = set()  # accepted drafts
skipped = set()   # skipped drafts

# Features
def generate_overview(files):
    prompt = f"Generate a concise project overview from these files:\n{list(files.keys())}"
    return call_gemini(prompt)

def generate_file_structure(files):
    prompt = f"Generate a Markdown ASCII tree view of this repo:\n{list(files.keys())}"
    return call_gemini(prompt)

def generate_installation(files):
    prompt = "Generate step-by-step installation instructions based on these files:\n" + "\n".join(files.keys())
    return call_gemini(prompt)

def generate_usage(files):
    prompt = "Generate usage examples based on the repo's main scripts/functions:\n" + "\n".join(files.keys())
    return call_gemini(prompt)

def generate_api_functions(files):
    prompt = "Explain functions/classes with parameters and outputs:\n" + "\n".join(files.keys())
    return call_gemini(prompt)

def generate_contribution(files):
    prompt = "Generate contribution guide based on CONTRIBUTING.md if exists, else general instructions"
    return call_gemini(prompt)

def generate_license(files):
    prompt = "Summarize the LICENSE file if exists"
    return call_gemini(prompt)

FEATURES = {
    "overview": generate_overview,
    "file_structure": generate_file_structure,
    "installation": generate_installation,
    "usage": generate_usage,
    "api_functions": generate_api_functions,
    "contribution": generate_contribution,
    "license": generate_license,
}
