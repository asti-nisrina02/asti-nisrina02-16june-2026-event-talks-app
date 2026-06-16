import os
import re
import html
import urllib.request
import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template

app = Flask(__name__)

# URL of the BigQuery Release Notes feed
FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def fetch_and_parse_feed():
    try:
        # Fetch XML content from Google Cloud
        req = urllib.request.Request(
            FEED_URL, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_content = response.read()
            
        # Parse Atom Feed XML
        namespaces = {'atom': 'http://www.w3.org/2005/Atom'}
        root = ET.fromstring(xml_content)
        
        updates = []
        
        # Iterate over entry elements
        for entry in root.findall('atom:entry', namespaces):
            date_str = entry.find('atom:title', namespaces)
            date_str = date_str.text.strip() if date_str is not None else "Unknown Date"
            
            updated_str = entry.find('atom:updated', namespaces)
            updated_str = updated_str.text.strip() if updated_str is not None else ""
            
            # Find the alternate link
            link_elem = entry.find("atom:link[@rel='alternate']", namespaces)
            if link_elem is None:
                link_elem = entry.find("atom:link", namespaces)
            
            link_url = link_elem.attrib.get('href', '') if link_elem is not None else ''
            
            content_elem = entry.find('atom:content', namespaces)
            if content_elem is None or content_elem.text is None:
                continue
                
            content_html = content_elem.text
            
            # Split the HTML content by <h3> headers
            chunks = re.split(r'<h3>', content_html, flags=re.IGNORECASE)
            
            current_id = 0
            for chunk in chunks:
                if not chunk.strip():
                    continue
                    
                if '</h3>' in chunk:
                    type_str, body_html = chunk.split('</h3>', 1)
                    type_str = type_str.strip()
                    body_html = body_html.strip()
                else:
                    type_str = "General"
                    body_html = chunk.strip()
                
                # Format plain text for tweeting
                # Remove HTML tags
                plain_text = re.sub(r'<[^>]+>', '', body_html)
                # Normalize spacing
                plain_text = re.sub(r'\s+', ' ', plain_text).strip()
                # Unescape HTML entities
                plain_text = html.unescape(plain_text)
                
                # Create a unique ID for each individual update item
                clean_date = re.sub(r'[^a-zA-Z0-9]', '_', date_str)
                update_id = f"{clean_date}_{current_id}"
                
                updates.append({
                    'id': update_id,
                    'date': date_str,
                    'updated': updated_str,
                    'link': link_url,
                    'type': type_str,
                    'body_html': body_html,
                    'body_text': plain_text
                })
                current_id += 1
                
        return {
            "success": True,
            "updates": updates
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/release-notes')
def get_release_notes():
    result = fetch_and_parse_feed()
    if result["success"]:
        return jsonify(result)
    else:
        return jsonify(result), 500

if __name__ == '__main__':
    # Run on port 5005 to avoid common port conflicts
    app.run(host='0.0.0.0', port=5005, debug=True)
