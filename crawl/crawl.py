import os
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import requests
import time

DELAY = 1
SITE = '2021.huntinality.com'
# SITE = 'dan-simon.github.io'
FOLDER = 'output'

def save_to_folder(url, content):
    # 1. Parse the URL
    parsed_url = urlparse(url)
    path = parsed_url.path
    
    # If the URL points to a directory (ends with '/'), let's name the file "index.html"
    if '.' not in path.split('/')[-1]:
        path += '/'
    if path.endswith('/'):
        path += "index.html"
    
    # Create the full path where the content will be saved
    full_path = os.path.join(FOLDER, parsed_url.netloc, path.lstrip('/'))
    
    # 2. Ensure directory structure exists
    directory = os.path.dirname(full_path)
    os.makedirs(directory, exist_ok=True)
    
    # 3. Write the content to the file
    with open(full_path, 'wb') as file:
        file.write(content)

def handle_url(url, s):
    if url in s:
        return
    time.sleep(DELAY)
    print('getting page', url)
    response = requests.get(url)
    content_type = response.headers.get('Content-Type', '')
    is_html = 'text/html' in content_type
    s.add(url)
    save_to_folder(url, response.content)
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
