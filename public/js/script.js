// Script.JS
console.log("Script JS Loaded");

testMode = false
performanceTest = false //is to ensure the test is only run once on startup
console.log(`Testing mode: ${testMode}`)
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
        if(testMode)
        {
            console.log(`Audio Permissions: ${constraints['audio']}`)
            console.log(`Camera permissions (Ideal): ${constraints['video']['width']['ideal']} X ${constraints['video']['height']['ideal']}`);
        }
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
    const URL = 'http://localhost:25565/model.json'
    const model = await tf.loadGraphModel(URL);
    console.log(model);

    let getImg = document.getElementById('preview');
    if(testMode && performanceTest)
    {
        performanceTest = false;
        var startTime = performance.now();
        console.log(`Time start at: ${performance.now()}`)
        for(let i = 0; i<100; i++)
        {
            const img = tf.browser.fromPixels(getImg)
            const resized = tf.image.resizeBilinear(img, [640,480])
            const casted = resized.cast('int32')
            const expanded = casted.expandDims(0)
            const obj = await model.executeAsync(expanded)
            const boxes = await obj[4].array()
            const classes = await obj[5].array()
            const scores = await obj[6].array()
        }
        var endTime = performance.now()
        console.log(`Running inference 100 times took an estimate of: ${endTime-startTime} Miliseconds.\nOr ${(endTime - startTime) / 1000} Seconds`)
    
    }
    else
    {
        const img = tf.browser.fromPixels(getImg)
        const resized = tf.image.resizeBilinear(img, [640,480])
        const casted = resized.cast('int32')
        const expanded = casted.expandDims(0)
        const obj = await model.executeAsync(expanded)
        const boxes = await obj[4].array()
        const classes = await obj[5].array()
        const scores = await obj[6].array()
    }
    


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



function loadNewImage() {
    let img = document.getElementById('preview');
    //andomNum = getRandomInt(6);                
    img.src = canvas.toDataURL('image/jpeg');    
    snap.addEventListener('click', () => loadNewImage());
}

loadNewImage();