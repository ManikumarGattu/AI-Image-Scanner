// js/tf-model.js
console.log("tf-model.js executing");

let model = null;

async function loadModel() {
  if (model) return model;

  if (!window.cocoSsd) {
    throw new Error("COCO-SSD not loaded");
  }

  model = await window.cocoSsd.load();
  return model;
}

async function detect(image) {
  tf.engine().startScope();

  const predictions = await model.detect(image);

  tf.engine().endScope();

  return predictions.map(p => ({
    label: p.class,
    confidence: (p.score * 100).toFixed(2)
  }));
}


function isReady() {
  return model !== null;
}

/* ✅ THIS LINE IS THE MOST IMPORTANT LINE */
window.TFModel = {
  load: loadModel,
  detect: detect,
  isReady: isReady
};

console.log("TFModel defined:", window.TFModel);
