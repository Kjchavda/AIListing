from json import tool
from random import seed

import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import urlparse
import re

RAW_URL  = "https://raw.githubusercontent.com/steven2358/awesome-generative-ai/main/README.md"

def fetch_urls_from_link(raw_url, max_urls = 50):
    """Fetches a markdown file from GitHub and extracts tool URLs."""
    print("Started fetching...")

    try:
        response = requests.get(raw_url)
        response.raise_for_status()

        full_text = response.text

        if "## Text" in full_text:
            # We split the text and only keep everything AFTER "## Text"
            relevant_text = full_text.split("## Text", 1)[1]
        else:
            # Fallback just in case the markdown changes
            relevant_text = full_text

        all_links = re.findall(r'\[.*?\]\((https?://[^\)]+)\)', relevant_text)

        ignore_domains = [
            'github.com', 'twitter.com', 'youtube.com', 'arxiv.org', 
            'linkedin.com', 'medium.com', 'wikipedia.org', 'reddit.com',
            'discord.gg', 'huggingface.co'
        ]

        clean_urls = []

        for link in all_links:
            domain = urlparse(link).netloc.lower()

            if not any(ignored in domain for ignored in ignore_domains):
                if link not in clean_urls:
                    clean_urls.append(link)

            if len(clean_urls) >= max_urls: 
                break
        
        print(f"Extracted {len(clean_urls)} urls")
        return clean_urls
    except Exception as e:
        print(f"Faield to get urls... {e}")
        return []
    
def get_meta_content(soup, property_name):
    """Helper to safely extract meta tag content"""
    meta = soup.find("meta", property = f"og:{property_name}")
    if meta and meta.get("content"):
        return meta["content"]
    
    meta = soup.find("meta", attrs={"name": property_name})
    if meta and meta.get("content"):
        return meta["content"]
        
    return None

def scrape_tool_info(url):
    """Visits a URL and extracts standard SEO metadata"""
    print(f"Scraping {url}...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 1. Get Name
        name = get_meta_content(soup, "title")
        if not name:
            name = soup.title.string if soup.title else urlparse(url).netloc
        name = name.split(" - ")[0].split(" | ")[0].strip()

        # 2. Get Description
        description = get_meta_content(soup, "description")
        if not description:
            description = "No description available. Please update manually."

        # 3. Get Logo
        logo_url = get_meta_content(soup, "image")
        
        return {
            "name": name,
            "description": description,
            "link": url,
            "logo_url": logo_url or "",
            "pricing_type": "freemium",
            "categories": ["AI Tool"]
        }

    except Exception as e:
        print(f"  ↳ ⚠️ Failed: {e}")
        return None
    
def main():
    # Step 1: Automatically get URLs from GitHub
    seed_urls = fetch_urls_from_link(RAW_URL)

    if not seed_urls:
        print("No urls found. Exited")
        return
    
    # Step 2: Scrape the extracted URLs
    results = []

    for url in seed_urls:
        tool_data = scrape_tool_info(url)
        if tool_data:
            results.append(tool_data)
            print(f"Success. {tool_data["name"]}")

        #wait 2 seconds between requests
        time.sleep(2);

    # Step 3: Save to JSON
    output_file = "scraper/data/scraped_tools.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n Finished! Saved {len(results)} tools to {output_file}")

if __name__ == "__main__":
    main()