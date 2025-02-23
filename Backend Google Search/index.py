from flask import Flask, request, jsonify
import asyncio
from searchImages import extract_keywords_and_fetch_images
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/getGoogleImage', methods=['POST'])
def getGoogleImage():
    try:
        # Get JSON data from the request
        data = request.get_json()

        # Extract search text from request
        searchText = data.get("searchText")

        if not searchText:
            return jsonify({"error": "Missing searchText"}), 400

        # Run the async function in a synchronous Flask route
        images = asyncio.run(extract_keywords_and_fetch_images(searchText))

        response = {
            "status": "success",
            "images": images
        }
        return jsonify(response), 200

    except Exception as e:
        import traceback
        print("Exception occurred:", traceback.format_exc())  # Log the full traceback for debugging
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    try:
        app.run(debug=True)
    except SystemExit as e:
        print(f"Flask system exit with code: {e}")
    except Exception as e:
        import traceback
        print("Unhandled Exception:", traceback.format_exc())