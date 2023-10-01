from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import requests
import time

s = set()

def handle_url(url, s):
    if url in s:
        return
    time.sleep(DELAY)
    print('getting page', url)
    response = requests.get(url)
    content_type = response.headers.get('Content-Type', '')
    is_html = 'text/html' in content_type
    s.add(url)
    if is_html:
        print(url, response.content)
        soup = BeautifulSoup(response.text, 'html.parser')
        all_urls = [i for i in extract_full_urls(soup, url) if SITE in i]
        for i in all_urls:
            handle_url(i, s)
 
def extract_full_urls(soup, base_url):
    all_links = [i['href'] for i in soup.find_all('a', href=True)]
    # print(all_links)
    # Convert relative links to full URLs
    if '.' not in base_url.split('/')[-1]:
        real_base_url = base_url + '/'
    else:
        real_base_url = base_url
    full_urls = [urljoin(real_base_url, link) for link in all_links]
    return full_urls
