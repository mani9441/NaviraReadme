from gemini_client import call_gemini

drafts = {}       # feature_name -> draft_content
accepted = set()  # accepted drafts
skipped = set()   # skipped drafts

# Example feature generators
def generate_overview(files_dict):
    prompt = f"Generate a concise project overview from these files:\n{list(files_dict.keys())}"
    return call_gemini(prompt)

def generate_file_structure(files_dict):
    prompt = f"Generate a Markdown ASCII tree view of this repo:\n{list(files_dict.keys())}"
    return call_gemini(prompt)

# Add more features as needed
FEATURES = {
    "overview": generate_overview,
    "file_structure": generate_file_structure,
}
