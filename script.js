document.addEventListener('DOMContentLoaded', () => {
    const imageModelURL = './my_model/';
    const videoContainer = document.getElementById('video-container');
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    const imageUpload = document.getElementById('image-upload');
    const uploadedImage = document.getElementById('uploaded-image');
    const resultLabel = document.getElementById('result-label');
    const confidenceLabel = document.getElementById('confidence-label');
    
    // As variáveis para a rolagem de dados foram removidas

    let classifier;
    let video;
    let p5Instance;
    let isVideoClassifying = false;

    // --- 1. CARREGAMENTO DO MODELO ---
    startButton.disabled = true;
    imageUpload.disabled = true;
    startButton.textContent = 'Carregando modelo...';
    
    classifier = ml5.imageClassifier(imageModelURL + 'model.json', modelLoaded);

    // --- 2. MODELO CARREGADO ---
    function modelLoaded() {
        console.log('Modelo Carregado com Sucesso! Pronto para classificar.');
        startButton.disabled = false;
        imageUpload.disabled = false;
        startButton.textContent = 'Iniciar Câmera';
    }

    // --- 3. LÓGICA DE CLASSIFICAÇÃO ---
    function gotResult(error, results) {
        if (error) { console.error(error); return; }
        if (results && results.length > 0) {
            const label = results[0].label;
            const confidence = (results[0].confidence * 100).toFixed(2) + '%';
            resultLabel.textContent = label;
            confidenceLabel.textContent = confidence;
            // A chamada para rollDice(label) foi removida daqui
        } else {
            resultLabel.textContent = 'Não identificado';
            confidenceLabel.textContent = '---';
        }
        if (isVideoClassifying) classifyVideo();
    }
    
    imageUpload.addEventListener('change', (event) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage.src = e.target.result;
                uploadedImage.style.display = 'block';
                uploadedImage.onload = () => classifier.classify(uploadedImage, gotResult);
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    });

    startButton.addEventListener('click', () => {
        p5Instance = new p5(sketch => {
            sketch.setup = () => {
                let canvas = sketch.createCanvas(320, 240); canvas.parent(videoContainer);
                video = sketch.createCapture(sketch.VIDEO); video.size(320, 240); video.hide();
            };
            sketch.draw = () => sketch.image(video, 0, 0);
        });
        isVideoClassifying = true; classifyVideo();
        startButton.style.display = 'none'; stopButton.style.display = 'inline-block';
    });

    stopButton.addEventListener('click', () => {
        isVideoClassifying = false;
        if (video) { video.stop(); video.elt.srcObject.getTracks().forEach(track => track.stop()); p5Instance.remove(); }
        videoContainer.innerHTML = '';
        startButton.style.display = 'inline-block'; stopButton.style.display = 'none';
        resetResults();
    });

    function classifyVideo() { if (video && isVideoClassifying) classifier.classify(video, gotResult); }

    // A função rollDice foi completamente removida

    function resetResults() {
        resultLabel.textContent = 'Nenhum'; confidenceLabel.textContent = '0%';
        // A linha que resetava a rolagem também foi removida
        uploadedImage.style.display = 'none'; imageUpload.value = '';
    }
});