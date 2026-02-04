// js/app.js
// =========================================================
// AI Image Scanner - Main Application Controller
// Author: Mani Kumar
//
// Responsibility of this file:
// - Handle UI interactions
// - Manage image selection (upload or camera)
// - Communicate with TensorFlow logic via window.TFModel
// =========================================================

(function () {

  /* -------------------------------------------------------
     DOM ELEMENT REFERENCES
  ------------------------------------------------------- */
  const imageInput = document.getElementById("imageInput");
  const previewImage = document.getElementById("previewImage");
  const scanBtn = document.getElementById("scanBtn");
  scanBtn.disabled = true;
  const resultContainer = document.getElementById("result");

  /* -------------------------------------------------------
     APPLICATION STATE
  ------------------------------------------------------- */
  let selectedImage = null; // Holds the image to be scanned

  /* -------------------------------------------------------
     APPLICATION INITIALIZATION
     - Runs when the page is fully loaded
  ------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", async () => {

    // Ensure TensorFlow module is available
    if (!window.TFModel) {
      displayError("AI module failed to load.");
      console.error("TFModel is undefined");
      return;
    }

    displayStatus("Loading AI model… Please wait.");

    try {
      // Load TensorFlow model once
      await window.TFModel.load();
      displayStatus("Model loaded successfully. Ready to scan.");
    } catch (error) {
      displayError(error.message);
    }
  });

  /* -------------------------------------------------------
     IMAGE UPLOAD HANDLING
     - Triggered when user uploads an image file
  ------------------------------------------------------- */
  imageInput.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      // Show uploaded image in preview
      previewImage.src = reader.result;

      // Mark image as selected for scanning
      selectedImage = previewImage;

      displayStatus("Image loaded. Click 'Scan Image'.");
      scanBtn.disabled = false;

    };

    reader.readAsDataURL(file);
  });

  /* -------------------------------------------------------
     CAMERA IMAGE HOOK
     - This function is called from camera.js
     - It allows camera-captured images to use the same scan flow
  ------------------------------------------------------- */
  window.setSelectedImageFromCamera = function () {
    selectedImage = previewImage;
    scanBtn.disabled = false;
    displayStatus("Image captured. Click 'Scan Image'.");
  };


  /* -------------------------------------------------------
     SCAN BUTTON HANDLER
     - Runs object detection on the selected image
  ------------------------------------------------------- */
  scanBtn.addEventListener("click", async () => {

    // Check if model is ready
    if (!window.TFModel || !window.TFModel.isReady()) {
      displayError("AI model not ready.");
      return;
    }

    // Ensure an image is selected
    if (!selectedImage) {
      displayError("Please upload or capture an image first.");
      return;
    }

    displayStatus("Analyzing image…");

    try {
      // Run TensorFlow object detection
      const results = await window.TFModel.detect(selectedImage);
      renderResults(results);
    } catch (error) {
      displayError(error.message);
    }
  });

  /* -------------------------------------------------------
     RENDER DETECTION RESULTS
     - Displays detected objects and confidence scores
  ------------------------------------------------------- */
  function renderResults(results) {
    resultContainer.innerHTML = "";

    if (!results || results.length === 0) {
      displayError("No objects detected.");
      return;
    }

    results.forEach((item, index) => {
      const p = document.createElement("p");
      p.innerHTML = `
        <strong>Object ${index + 1}:</strong> ${item.label}<br/>
        Confidence: <strong>${item.confidence}%</strong>
      `;
      resultContainer.appendChild(p);
    });
  }

  /* -------------------------------------------------------
     UI HELPER FUNCTIONS
  ------------------------------------------------------- */
  function displayStatus(message) {
    resultContainer.innerHTML = `<p class="muted-text">${message}</p>`;
  }

  function displayError(message) {
    resultContainer.innerHTML = `
      <p style="color:#ef4444; font-weight:600; text-align:center;">
        ${message}
      </p>
    `;
  }

})();
