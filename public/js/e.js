// import { Component, ViewChild, OnInit } from @angular/core;
// import * as tf from '@tensorflow/tfjs';

// @Component ({
//     selector: 'app-root'
// })

// export class AppComponent implements OnInit {
//     linearModel: tf.Sequential;
// }


// async loadGraphModel() {
//     this.model = await tf.loadModel('/assets/model.json')
// }

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
    //RemoveResults();
    context.drawImage(video, 0, 0, 640, 480);
    RemoveResults();
});

startWebCam();


function RemoveResults() {
    // Remove previous result if they're here
    const oldResults = document.querySelectorAll('.result');

    oldResults.forEach(oldResult => {
        sleep(1000)
        oldResult.remove();
    });
}

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
const classifier = ml5.imageClassifier('MobileNet', (err, model) => {
    console.log('Model Loaded!');
});
const result = document.getElementById('result');
const probability = document.getElementById('probability');

function onImageReady() {
    let img = document.getElementById('preview');

    classifier.predict(img, function(err, results) {
        if(results) {
            RemoveResults();
            result.innerText = results[0].label;
            probability.innerText = results[0].confidence.toFixed(4);
            
            // Tijdelijke fix // 
            // functie moet wachten totdat er een nieuw resultaat komt, 
            // dit zorgt ervoor dat dit progrmma niet bij het laden, de bol.com pagina opent
            if(result.innerText != "window screen"){
                // Create an array with the results
                const resultArr = result.innerText.split(', ');
                //window.open("https://www.bol.com/nl/nl/s/?searchtext=" +  result.innerText);
                var limit = 3
                resultArr.forEach(res => {
                    // Create links for all results
                    var a = document.createElement('a');
                    var linkText = document.createTextNode(res);
                    a.appendChild(linkText);
                    a.title = res;
                    a.className = "result"
                    a.target = "_blank"
                    a.href = "https://www.bol.com/nl/nl/s/?searchtext=" + res;
                    document.getElementById("results").appendChild(a);
                });
            }
        }
    });
}

function loadNewImage() {
    let img = document.getElementById('preview');
    //andomNum = getRandomInt(6);                
    img.src = canvas.toDataURL('image/jpeg');

    snap.addEventListener('click', () => loadNewImage());
}

loadNewImage();

// // Script.JS
// console.log("Script JS Loaded");

// // Camera //////////////////////////////////////////////////////////////////////////////

// const video     = document.getElementById('video');
// const canvas    = document.getElementById('canvas');
// const snap      = document.getElementById('snap');

// const constraints = {
//     audio: false,
//     video: {
//         width:  { min: 1024, ideal: 1200, max:1920 },
//         height: { min: 576, ideal: 720, max: 1080 }
//     }
// }

// // Start webcam function
// async function startWebCam() {
//     try {
//         const stream = await navigator.mediaDevices.getUserMedia(constraints);
//         video.srcObject = stream;
//         window.stream = stream;
//     } catch(e) {
//         console.log(e.toString());
//     }
// }

// var context = canvas.getContext('2d');

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// snap.addEventListener('click', () => {
//     context.drawImage(video, 0, 0, 640, 480);
// });

// startWebCam();

// // Upload //////////////////////////////////////////////////////////////////////////////
// document.addEventListener('DOMContentLoaded', function () {
//     document.addEventListener('paste', function (evt) {
//         const clipboardItems = evt.clipboardData.items;
//         const items = [].slice.call(clipboardItems).filter(function (item) {
//             // Filter the image items only
//             return item.type.indexOf('image') !== -1;
//         });
//         if (items.length === 0) {
//             return;
//         }

//         const item = items[0];
//         const blob = item.getAsFile();

//         const imageEle = document.getElementById('preview');
//         imageEle.src = URL.createObjectURL(blob);
//     });
// });


// // AI Processing //////////////////////////////////////////////////////////////////////
// const classifier = ml5.imageClassifier('MobileNet', (err, model) => {
//     console.log('Model Loaded!');
// });
// const result = document.getElementById('result');
// const probability = document.getElementById('probability');

// function onImageReady() {
//     let img = document.getElementById('preview');

//     classifier.predict(img, function(err, results) {
//         if(results) {
//             result.innerText = results[0].label;
//             probability.innerText = results[0].confidence.toFixed(4);
            
//             // Tijdelijke fix // 
//             // functie moet wachten totdat er een nieuw resultaat komt, 
//             // dit zorgt ervoor dat dit progrmma niet bij het laden, de bol.com pagina opent
//             if(result.innerText != "window screen"){
//                 window.open("https://www.bol.com/nl/nl/s/?searchtext=" + results[0].label);
//             }
//         }
//     });
// }

// function loadNewImage() {
//     let img = document.getElementById('preview');
//     //andomNum = getRandomInt(6);                
//     img.src = canvas.toDataURL('image/jpeg');
    
//     snap.addEventListener('click', () => loadNewImage());
// }

// loadNewImage();