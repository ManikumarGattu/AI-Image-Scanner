// js/camera.js

let stream = null;

const cameraBtn = document.getElementById("cameraBtn");
const cameraBox = document.querySelector(".camera-box");
const video = document.getElementById("cameraStream");
const captureBtn = document.getElementById("captureBtn");
const canvas = document.getElementById("captureCanvas");
const previewImage = document.getElementById("previewImage");

cameraBtn.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });

    video.srcObject = stream;
    cameraBox.style.display = "flex";
  } catch (err) {
    alert("Camera access denied or not available.");
  }
});

captureBtn.addEventListener("click", () => {
  const context = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  context.drawImage(video, 0, 0);

  const imageData = canvas.toDataURL("image/png");
  previewImage.src = imageData;
  
  video.style.display = "none";
  cameraBox.style.display = "none";

  if (window.setSelectedImageFromCamera) {
    window.setSelectedImageFromCamera();
  } 

  stopCamera();
});

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  cameraBox.style.display = "none";
}
