// Script.JS
console.log("Script JS Loaded");

// Camera //////////////////////////////////////////////////////////////////////////////

const video     = document.getElementById('video');
const canvas    = document.getElementById('canvas');
const snap      = document.getElementById('snap');

const constraints = {
    audio: false,
    video: {
        width:  { min: 1024, ideal: 1200, max:1920 },
        height: { min: 576, ideal: 720, max: 1080 }
    }
}

// Start webcam function
async function startWebCam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        window.stream = stream;
    } catch(e) {
        console.log(e.toString());
    }
}

var context = canvas.getContext('2d');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

snap.addEventListener('click', () => {
    context.drawImage(video, 0, 0, 640, 480);
});

startWebCam();

// Upload //////////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('paste', function (evt) {
        const clipboardItems = evt.clipboardData.items;
        const items = [].slice.call(clipboardItems).filter(function (item) {
            // Filter the image items only
            return item.type.indexOf('image') !== -1;
        });
        if (items.length === 0) {
            return;
        }

        const item = items[0];
        const blob = item.getAsFile();

        const imageEle = document.getElementById('preview');
        imageEle.src = URL.createObjectURL(blob);
    });
});


// AI Processing //////////////////////////////////////////////////////////////////////
// const classifier = ml5.imageClassifier('MobileNet', (err, model) => {
//     console.log('Model Loaded!');
// });
const result = document.getElementById('result');
const probability = document.getElementById('probability');

async function onImageReady() {
    let getImg = document.getElementById('preview');
    //const net = await tf.loadGraphModel('http://localhost:25565/model.json')
    // Keras Model
    //const net = await tf.loadLayersModel('localstorage://assets/models/model.json');
    const model = await tf.loadGraphModel('assets/models/model.json');

    const img = tf.browser.fromPixels(getImg)
    const resized = tf.image.resizeBilinear(img, [640,480])
    const casted = resized.cast('int32')
    const expanded = casted.expandDims(0)
    const obj = await model.executeAsync(expanded)
    const boxes = await obj[4].array()
    const classes = await obj[5].array()
    const scores = await obj[6].array()
    
    console.log(boxes);
    console.log(classes);
    console.log(scores);

    let tensor = tf.browser.fromPixels(img, 3)
        .resizeNearestNeighbor([244, 244])
        .toFloat()
        .reverse(-1);
        
    let predictions = await model.predict(tensor).data();
    let top5 = Array.from(predictions)
        .map(function(p, i) {
            return {
                probability: p,
                className: TARGET_CLASSES[i]
            };
        }).sort(function(a,b) {
            return b.probability - a.probability;
        }).slice(0,2);

    // classifier.predict(img, function(err, results) {
    //     if(results) {
    //         result.innerText = results[0].label;
    //         probability.innerText = results[0].confidence.toFixed(4);
            
    //         // Tijdelijke fix // 
    //         // functie moet wachten totdat er een nieuw resultaat komt, 
    //         // dit zorgt ervoor dat dit progrmma niet bij het laden, de bol.com pagina opent
    //         if(result.innerText != "window screen"){
    //             window.open("https://www.bol.com/nl/nl/s/?searchtext=" + results[0].label);
    //         }
    //     }
    // });
}

let model;
let modelLoaded = false;
$(document).ready(async function () {
        console.log("Model is loading...")
        model = await tf.loadGraphModel('assets/models/model.json')
        console.log("Model loaded!")
    });



function loadNewImage() {
    let img = document.getElementById('preview');
    //andomNum = getRandomInt(6);                
    img.src = canvas.toDataURL('image/jpeg');
    
    snap.addEventListener('click', () => loadNewImage());
}


loadNewImage();