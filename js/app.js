// js/app.js

const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const scanBtn = document.getElementById("scanBtn");
const resultContainer = document.getElementById("result");

let selectedImage = null;

document.addEventListener("DOMContentLoaded", async () => {
  if (!window.TFModel) {
    displayError("AI module failed to load.");
    console.error("window.TFModel is undefined");
    return;
  }

  displayStatus("Loading AI model… Please wait.");

  try {
    await window.TFModel.load();
    displayStatus("Model loaded successfully. Ready to scan.");
  } catch (err) {
    displayError(err.message);
  }
});

imageInput.addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    previewImage.src = reader.result;
    selectedImage = previewImage;
    displayStatus("Image loaded. Click Scan Image.");
  };
  reader.readAsDataURL(file);
});

scanBtn.addEventListener("click", async () => {
  if (!window.TFModel || !window.TFModel.isReady()) {
    displayError("AI model not ready.");
    return;
  }

  if (!selectedImage) {
    displayError("Please upload an image first.");
    return;
  }

  displayStatus("Analyzing image…");

  try {
    const results = await window.TFModel.detect(selectedImage);
    renderResults(results);
  } catch (err) {
    displayError(err.message);
  }
});

function renderResults(results) {
  resultContainer.innerHTML = "";

  if (!results || results.length === 0) {
    displayError("No objects detected.");
    return;
  }

  results.forEach((r, i) => {
    const p = document.createElement("p");
    p.innerHTML = `
      <strong>Object ${i + 1}:</strong> ${r.label}<br>
      Confidence: <strong>${r.confidence}%</strong>
    `;
    resultContainer.appendChild(p);
  });
}

function displayStatus(msg) {
  resultContainer.innerHTML = `<p class="muted-text">${msg}</p>`;
}

function displayError(msg) {
  resultContainer.innerHTML = `
    <p style="color:#ef4444; font-weight:600; text-align:center;">
      ${msg}
    </p>
  `;
}
