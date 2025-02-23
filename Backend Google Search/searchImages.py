import aiohttp
import asyncio
import re

GOOGLE_API_KEY = "AIzaSyChffe7WOOxg6VLoYgHquncO7EdxhHJggs"
SEARCH_ENGINE_ID = "01175995948fa41ee"

async def fetch_images(keyword):
    search_url = (
        f"https://www.googleapis.com/customsearch/v1?key={GOOGLE_API_KEY}&cx={SEARCH_ENGINE_ID}"
        f"&q={keyword}&searchType=image&num=1&safe=active"
    )
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(search_url) as response:
                data = await response.json()
                
                if response.status != 200:
                    print("Google API Error:", data)
                    raise Exception(data.get("error", {}).get("message", "Failed to fetch images"))
                
                if "items" in data and len(data["items"]) > 0:
                    return {
                        "url": data["items"][0]["link"],
                        "title": data["items"][0].get("title", keyword),
                        "keyword": keyword
                    }
                return None
        except Exception as e:
            print("Error fetching images:", e)
            return None


def extract_keywords(text):
    titles = {"mr", "mrs", "ms", "dr", "prof"}
    words = re.split(r'\s+', text.lower().strip())
    phrases = []
    stop_words = {"the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me"}
    
    i = 0
    original_words = text.split()
    while i < len(words):
        if i < len(words) - 1 and words[i].rstrip('.') in titles:
            phrases.append(f"{words[i]} {words[i+1]}")
            i += 2
            continue
        
        if i < len(words) - 1:
            current_word, next_word = original_words[i], original_words[i+1]
            if current_word.istitle() and next_word.istitle():
                phrases.append(f"{words[i]} {words[i+1]}")
                i += 2
                continue
        
        if words[i] not in stop_words and len(words[i]) > 2:
            phrases.append(words[i])
        i += 1
    
    return sorted(set(phrases), key=lambda x: -len(x.split()))[:3]


async def extract_keywords_and_fetch_images(text):
    # keywords = extract_keywords(text)
    keywords = [text]
    if not keywords:
        return []
    
    tasks = [fetch_images(keyword) for keyword in keywords]
    images = await asyncio.gather(*tasks)
    return [img for img in images if img]

# Example Usage
# asyncio.run(extract_keywords_and_fetch_images("Dr. John Doe is an AI researcher at Google"))
