from wsgiref import headers

import requests
from bs4 import BeautifulSoup

def extract_tool_metadata(url: str):
    """
    Visits a URL and extracts standard SEO metadata (title, description, image).
    Returns a dictionary. Raises exceptions if the site blocks scraping.
    """

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    # 10-second timeout to prevent the API from hanging forever
    response = requests.get(url, headers=headers, timeout=10)

    # Check if the site explicitly blocked scraping (Cloudflare, etc.)
    if response.status_code in [401, 403, 405, 429]:
        raise PermissionError(f"Site blocked scraping with status code {response.status_code}")
    
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')

    def get_meta(prop_name):
        meta = soup.find("meta", property=f"og:{prop_name}") or soup.find("meta", attrs={"name": prop_name})
        return meta["content"] if meta and meta.get("content") else ""
    
    title = get_meta("title") or (soup.title.string if soup.title else "")
    description = get_meta("description")
    logo = get_meta("image")

    title = title.split(" - ")[0].split(" | ")[0].strip()

    return {
        "name": title,
        "description": description,
        "logo_url": logo
    }