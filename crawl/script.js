let DELAY = 7000;
let LONG_DELAY = 70000;

let visitedUrls = new Set();

async function saveToWaybackMachine(url) {
    const archiveUrl = `https://web.archive.org/save/${url}`;
    try {
      await fetch(archiveUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
              'url': url,
              'capture_all': 'on'
          })
      });
      console.log(`Saved ${url}`);
    } catch (e) {
      console.log('Something went wrong (rate limit)?');
      await new Promise(resolve => setTimeout(resolve, LONG_DELAY));
    }
}

async function handleUrl(url) {
    if (visitedUrls.has(url)) {
        return;
    }

    await new Promise(resolve => setTimeout(resolve, DELAY));  // Mimic time.sleep()
    
    try {
        let response = await fetch(url);
        let contentType = response.headers.get('Content-Type') || '';
        let isHtml = contentType.includes('text/html');
        visitedUrls.add(url);
        
        if (isHtml) {
            let text = await response.text();
            await saveToWaybackMachine(url);
            let parser = new DOMParser();
            let doc = parser.parseFromString(text, 'text/html');
            let fullUrls = extractFullUrls(doc, url).filter(i => i.includes(SITE));
            for (let i of fullUrls) {
                await handleUrl(i);
            }
        }
    } catch (e) {
        console.error("Failed to fetch the URL", url, e);
    }
}

function extractFullUrls(doc, baseUrl) {
    return Array.from(doc.querySelectorAll('a[href]')).map(a => {
        let href = a.getAttribute('href'); // Get the raw href value
        return new URL(href, baseUrl).toString(); // Resolve it against the base URL
    });
}