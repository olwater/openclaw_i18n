import os
import requests
import json
import sys

API_KEY = "sk-f0b4a583c0bf4d14aa1f6f8e51f8b500"
BASE_URL = "http://127.0.0.1:8045/v1/images/generations"

def generate_image():
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    payload = {
        "model": "gemini-3-pro-image",
        "prompt": "A futuristic, sleek logo for an AI agent named 'WAgent'. The design should incorporate elements of water waves (representing 'Water') and digital connectivity/circuitry. The color scheme should be a gradient of deep ocean blue to electric cyan. The style should be modern, minimalist, and suitable for a tech app icon. The text 'WAgent' should be integrated stylishly or placed below the icon.",
        "n": 1,
        "size": "1024x1024"
    }

    print(f"Requesting image from {BASE_URL}...")
    try:
        response = requests.post(BASE_URL, headers=headers, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            # Handle standard OpenAI image response
            if 'data' in data and len(data['data']) > 0:
                print(f"Full Response Data: {json.dumps(data, indent=2)}")
                if 'url' in data['data'][0]:
                    image_url = data['data'][0]['url']
                    print(f"Image URL: {image_url}")
                    # Save it
                    img_data = requests.get(image_url).content
                    with open('WAgent_logo_openai.png', 'wb') as f:
                        f.write(img_data)
                    print(f"MEDIA: {os.path.abspath('WAgent_logo_openai.png')}")
                elif 'b64_json' in data['data'][0]:
                    import base64
                    image_data = base64.b64decode(data['data'][0]['b64_json'])
                    with open('WAgent_logo_openai.png', 'wb') as f:
                        f.write(image_data)
                    print(f"MEDIA: {os.path.abspath('WAgent_logo_openai.png')}")
                else:
                    print(f"No URL or b64_json found in data.")
            else:
                print(f"Unexpected response format: {data}")
        else:
            print(f"Error {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    generate_image()
