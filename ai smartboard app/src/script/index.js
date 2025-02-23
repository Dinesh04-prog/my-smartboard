




let actions = [];
let redoStack = [];



const GOOGLE_API_KEY = 'AIzaSyChffe7WOOxg6VLoYgHquncO7EdxhHJggs';
const SEARCH_ENGINE_ID = '01175995948fa41ee';


async function fetchImages(keyword) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    const raw = JSON.stringify({
      searchText: keyword,
    });
    
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    
    async function fetchGoogleImage() {
      try {
        const response = await fetch("http://127.0.0.1:5000/getGoogleImage", requestOptions);
        const result = await response.json();
        console.log(result);
        return result.images[0];
      } catch (error) {
        console.error(error);
      }
    }
    
    return fetchGoogleImage();
    
  }

  function extractKeywords(text) {
    // Define common name prefixes and titles to help identify proper names
    const titles = ['mr', 'mrs', 'ms', 'dr', 'prof'];
    const words = text.toLowerCase().trim().split(/\s+/);
    const phrases = [];
    let i = 0;

    while (i < words.length) {
      // Check for title + name combinations
      if (i < words.length - 1 && titles.includes(words[i].replace('.', ''))) {
        phrases.push(words[i] + ' ' + words[i + 1]);
        i += 2;
        continue;
      }

      // Check for potential proper names (two capitalized words in the original text)
      if (i < words.length - 1) {
        const originalWords = text.split(/\s+/);
        const currentWord = originalWords[i];
        const nextWord = originalWords[i + 1];
        if (
          currentWord && nextWord &&
          currentWord[0] === currentWord[0].toUpperCase() &&
          nextWord[0] === nextWord[0].toUpperCase()
        ) {
          phrases.push(words[i] + ' ' + words[i + 1]);
          i += 2;
          continue;
        }
      }

      // Add single words that aren't stop words
      const stopWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me']);
      if (!stopWords.has(words[i]) && words[i].length > 2) {
        phrases.push(words[i]);
      }
      i++;
    }

    // Return unique phrases, prioritizing multi-word phrases
    return [...new Set(phrases)]
      .sort((a, b) => b.split(' ').length - a.split(' ').length)
      .slice(0, 3);
  }

  async function extractKeywordsAndFetchImages(text) {
    // const keywords = this.extractKeywords(text);
    const keywords = [text]; 
    if (keywords.length === 0) return;

    this.loader.classList.remove('hidden');
    
    try {
      const imagePromises = keywords.map(keyword => this.fetchImages(keyword));
      const images = await Promise.all(imagePromises); // send image back return images 
      const validImages = images.filter(img => img !== null);
      
      this.updateImageGallery(validImages);
    } finally {
      this.loader.classList.add('hidden');
    }
  }

  function updateImageGallery(newImages) {
    const currentImages = this.imageGallery.children.length;
    const maxImages = 6;
    
    // Remove oldest images if we're going to exceed the maximum
    while (currentImages + newImages.length > maxImages) {
      this.imageGallery.removeChild(this.imageGallery.firstChild);
    }
    
    newImages.forEach(image => {
      const container = document.createElement('div');
      container.className = 'image-container';
      
      const img = document.createElement('img');
      img.src = image.url;
      img.alt = image.title;
      img.loading = 'lazy';
      
      const label = document.createElement('div');
      label.className = 'image-label';
      label.textContent = image.keyword;
      
      container.appendChild(img);
      container.appendChild(label);
      this.imageGallery.appendChild(container);
    });
  }

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("whiteboard");
    const ctx = canvas.getContext("2d");
    const colorPicker = document.getElementById("color-picker");
    const shapesTool = document.getElementById("shapes-tool");
    const speakButton = document.getElementById("start-speaking");
    const penTool = document.getElementById("pen-tool");
    const eraseTool = document.getElementById("erase-tool");
    const clearBoardTool = document.getElementById("clear-board");

    let drawing = false;
    let erasing = false;
    let currentColor = "black";
    let currentShape = null;
    let isSpeaking = false;
    
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = currentColor;

    // Fix cursor alignment and smooth drawing
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    canvas.addEventListener("mousedown", (e) => {
        drawing = true;
        erasing = false;  // Ensure normal drawing mode
        ctx.globalCompositeOperation = "source-over"; 
        const pos = getMousePos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        saveState();
    });
    

    
    canvas.addEventListener("mousemove", (e) => {
        if (!drawing) return;
        const pos = getMousePos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    });
    

    canvas.addEventListener("mouseup", () => {
        drawing = false;
        ctx.beginPath();
        saveState(); // Save state after finishing a stroke
    });
    
    canvas.addEventListener("mousemove", (e) => {
        if (!drawing) return;
        const pos = getMousePos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath(); 
        ctx.moveTo(pos.x, pos.y);
    });
    

function draw(event) {
    if (!drawing || shapeMode) return;

    ctx.lineWidth = erasing ? 20 : 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = erasing ? "white" : ctx.strokeStyle;

    ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    ctx.stroke();

    ctx.beginPath(); // Reset the path to prevent scattering
    ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
}


function handlePenToolClick() {
    erasing = false;
    shapeMode = false;
}
penTool.addEventListener("click", () => {
    erasing = false;
    ctx.globalCompositeOperation = "source-over"; // Ensure normal drawing mode
});


    // Eraser Tool Functionality
    eraseTool.addEventListener("click", () => {
        erasing = true;
        ctx.globalCompositeOperation = "source-over"; // Ensure normal drawing mode
        ctx.strokeStyle = "white"; // Set eraser color to white
        ctx.lineWidth = 20; // Make eraser size bigger
    });
    

    // Color Picker Functionality
    colorPicker.addEventListener("click", () => {
        const colorPickerElm = document.getElementById("colorPicker");
        if (colorPickerElm) {
            colorPickerElm.remove();
        }
        const colorPalette = document.createElement("input");
        colorPalette.type = "color";
        colorPalette.id = "colorPicker";
        document.body.appendChild(colorPalette);

        colorPalette.addEventListener("input", (event) => {
            currentColor = event.target.value;
            ctx.strokeStyle = currentColor;
        });
        colorPalette.addEventListener("blur", () => {
            document.body.removeChild(colorPalette);
        });
    });

    // Shapes Tool Functionality
    shapesTool.addEventListener("click", () => {
        const shameMenuElm = document.getElementById("shapeMenu");
        if (shameMenuElm) {
            shameMenuElm.remove();
        }
        const shapeMenu = document.createElement("div");
        shapeMenu.classList.add("shape-menu");
        shapeMenu.id = 'shapeMenu';
        shapeMenu.innerHTML = `
            <button id='rect'>⬛</button>
            <button id='circle'>⚫</button>
            <button id='triangle'>🔺</button>
        `;
        document.body.appendChild(shapeMenu);

        document.getElementById("rect").addEventListener("click", () => {
            currentShape = "rectangle";
            drawShape("rectangle");
        });
        document.getElementById("circle").addEventListener("click", () => {
            currentShape = "circle";
            drawShape("circle");
        });
        document.getElementById("triangle").addEventListener("click", () => {
            currentShape = "triangle";
            drawShape("triangle");
        });
    });

    function drawShape(shape) {
        ctx.fillStyle = currentColor;
        if (shape === "rectangle") {
            ctx.fillRect(50, 50, 100, 50);
        } else if (shape === "circle") {
            ctx.beginPath();
            ctx.arc(100, 100, 40, 0, Math.PI * 2);
            ctx.fill();
        } else if (shape === "triangle") {
            ctx.beginPath();
            ctx.moveTo(100, 50);
            ctx.lineTo(50, 150);
            ctx.lineTo(150, 150);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    // Speak Button Functionality
    speakButton.addEventListener("click", () => {
        isSpeaking = !isSpeaking;
        speakButton.style.backgroundColor = isSpeaking ? "green" : "red";
    });
    
    // Clear Button Functionality
    clearBoardTool.addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });


    
// Speech-to-Text
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.continuous = true;
speechOn = false;
speakButton.addEventListener("click", () => {
    if (!speechOn) {
        recognition.start();
        speechOn = true;
    } else {
        recognition.stop();
        speechOn = false;
    }
});

recognition.onresult = (event) => {
    let latestText = event.results[event.results.length - 1][0].transcript;
    
    let textContainer = document.getElementById("text-container");

    // Create an editable text element
    let textElement = document.createElement("div");
    textElement.className = "transcribed-text";
    textElement.innerText = latestText;
    textElement.contentEditable = true; // Make text editable
    // Save text when pressing Enter (prevent new line)
    textElement.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            textElement.blur();
        }
    });

    // Append text to the container
    textContainer.appendChild(textElement);

    // Auto-scroll to the bottom
    textContainer.scrollTop = textContainer.scrollHeight;


        // Right-click event listener
        textElement.addEventListener("contextmenu", (event) => {
            event.preventDefault(); // Prevent default context menu
    
            // Create or reuse a custom context menu
            let contextMenu = document.getElementById("custom-context-menu");
            if (!contextMenu) {
                contextMenu = document.createElement("div");
                contextMenu.id = "custom-context-menu";
                contextMenu.className = "context-menu";
                document.body.appendChild(contextMenu);
            }
    
            // Set menu position
            contextMenu.style.top = `${event.clientY}px`;
            contextMenu.style.left = `${event.clientX}px`;
            contextMenu.style.display = "block";
    
            // Clear previous menu items
            contextMenu.innerHTML = "";
    
            let searchImage = document.createElement("div");
            searchImage.innerText = "search image";
            searchImage.className = "context-menu-item";
            
            searchImage.addEventListener("click", async () => {
                let selectedText = window.getSelection().toString().trim();// Get only the selected text block
                if (!selectedText) {
                    selectedText = textElement.innerText.trim(); // If no selection, use full text block
                }
                if (selectedText.length > 0) {
                    await extractKeywordsAndFetchImages(selectedText); // Fetch images for selected text only
                }
                
                contextMenu.style.display = "none";
            });
    
            contextMenu.appendChild(searchImage);
            });
            
        // Hide context menu when clicking elsewhere
        document.addEventListener("click", () => {
            let contextMenu = document.getElementById("custom-context-menu");
            if (contextMenu) contextMenu.style.display = "none";
        });

};


document.getElementById("clearImages").addEventListener("click", function () {
    const imageGallery = document.getElementById("imageGallery"); // Selects the entire gallery
    if (imageGallery) {
        imageGallery.innerHTML = ""; // Clears all images by removing all content inside
    }
});

// Undo/Redo
document.getElementById("undo").addEventListener("click", undo);
document.getElementById("redo").addEventListener("click", redo);
function saveState() {
    if (actions.length > 10) actions.shift(); // Limit stack size to prevent memory issues
    actions.push(canvas.toDataURL()); // Save canvas state as an image
    redoStack = []; // Clear redo stack on new action
}



function undo() {
    if (actions.length > 0) {
        redoStack.push(actions.pop());
        let img = new Image();
        img.src = actions.length > 0 ? actions[actions.length - 1] : "";
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}
function redo() {
    if (redoStack.length > 0) {
        let img = new Image();
        img.src = redoStack.pop();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        actions.push(img.src); // Push back into actions stack
    }
}


});
