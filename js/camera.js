/* =========================================================
   Camera & Image Handling Module
   Author: Mani Kumar
   Description:
   Handles camera access, image capture, file uploads,
   permissions, and preview rendering.
   ========================================================= */

/* -------------------------------
   DOM Elements
-------------------------------- */
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");

/* -------------------------------
   Camera State
-------------------------------- */
let mediaStream = null;

/* =========================================================
   Initialize Camera Support Check
   ========================================================= */
function isCameraSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/* =========================================================
   Capture Image from Camera (Mobile / Browser)
   ========================================================= */
async function openCamera() {
  if (!isCameraSupported()) {
    alert("Camera access is not supported on this device.");
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });

    const video = document.createElement("video");
    video.srcObject = mediaStream;
    video.play();

    // Temporary overlay for capture
    const captureOverlay = document.createElement("div");
    captureOverlay.style.position = "fixed";
    captureOverlay.style.inset = "0";
    captureOverlay.style.background = "#000";
    captureOverlay.style.zIndex = "9999";
    captureOverlay.style.display = "flex";
    captureOverlay.style.flexDirection = "column";
    captureOverlay.style.alignItems = "center";
    captureOverlay.style.justifyContent = "center";

    const captureBtn = document.createElement("button");
    captureBtn.innerText = "Capture Image";
    captureBtn.style.marginTop = "1rem";
    captureBtn.style.padding = "0.8rem 1.5rem";
    captureBtn.style.fontSize = "1rem";
    captureBtn.style.cursor = "pointer";

    captureOverlay.appendChild(video);
    captureOverlay.appendChild(captureBtn);
    document.body.appendChild(captureOverlay);

    captureBtn.addEventListener("click", () => {
      captureImage(video);
      stopCamera();
      document.body.removeChild(captureOverlay);
    });

  } catch (error) {
    console.error("Camera access denied:", error);
    alert("Unable to access camera. Please allow permissions.");
  }
}

/* =========================================================
   Capture Frame from Video
   ========================================================= */
function captureImage(videoElement) {
  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoElement, 0, 0);

  const imageDataUrl = canvas.toDataURL("image/png");
  previewImage.src = imageDataUrl;

  // Make image usable for TensorFlow
  previewImage.onload = () => {
    previewImage.dataset.captured = "true";
  };
}

/* =========================================================
   Stop Camera Stream
   ========================================================= */
function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
}

/* =========================================================
   Handle File Upload (Fallback / Desktop)
   ========================================================= */
imageInput.addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    previewImage.src = reader.result;
  };
  reader.readAsDataURL(file);
});

/* =========================================================
   Expose Camera Function (Optional Button Use)
   ========================================================= */
window.openCamera = openCamera;
