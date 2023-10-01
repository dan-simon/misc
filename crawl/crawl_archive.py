import os
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import requests
import time

DELAY = 5
SITE = '2021.huntinality.com'
# SITE = 'dan-simon.github.io'
FOLDER = 'output'

def save_to_wayback_machine(url):
    archive_url = "https://web.archive.org/save/" + url
    data = {
        'url': url,
        'capture_all': 'on'
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    response = requests.post(archive_url, data=data, headers=headers)

    if response.status_code == 200:
        print(f"Successfully archived {url}")
    else:
        print(f"Failed to archive {url} with status code {response.status_code}")
        print(response.text)  # This will print the response content, useful for debugging.
    return response

def handle_url(url, s):
    if url in s:
        return
    time.sleep(DELAY)
    print('getting page', url)
    response = requests.get(url)
    content_type = response.headers.get('Content-Type', '')
    is_html = 'text/html' in content_type
    s.add(url)
    save_to_wayback_machine(url)
    if is_html:
        soup = BeautifulSoup(response.text, 'html.parser')
        all_urls = [i for i in extract_full_urls(soup, url) if SITE in i]
        for i in all_urls:
            handle_url(i, s)
 
s =set()
 
def extract_full_urls(soup, base_url):
    tags = ['a', 'link', 'script', 'img', 'image', 'audio', 'source']
    all_links = [i[j] for t in tags for j in ('href', 'src') for i in soup.find_all(t, **{j: True})]
    # print(all_links)
    # Convert relative links to full URLs
    if '.' not in base_url.split('/')[-1]:
        real_base_url = base_url + '/'
    else:
        real_base_url = base_url
    full_urls = [urljoin(real_base_url, link) for link in all_links]
    return full_urls

handle_url('https://2021.huntinality.com/', s)
# handle_url('https://dan-simon.github.io/puzzles', s)

'''
Next steps:
- List files rather than getting them all, for internet archive
- Add command-line arguments
- Get all href/src tags rather than just those on some subset of elements (maybe let user control this)
- Get fonts from css files
'''
