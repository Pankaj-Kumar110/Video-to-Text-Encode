// Character sets for ASCII conversion
const CHARACTER_SETS = {
    standard: ' .:-=+*#%@',
    blocks: ' ░▒▓█',
    braille: ' ⠁⠃⠇⡇⣇⣧⣷⣿',
    minimal: ' .:+#'
};

// DOM Elements
const videoInput = document.getElementById('videoInput');
const webcamBtn = document.getElementById('webcamBtn');
const videoElement = document.getElementById('videoElement');
const hiddenCanvas = document.getElementById('hiddenCanvas');
const asciiOutput = document.getElementById('asciiOutput');
const resolutionSlider = document.getElementById('resolution');
const resolutionValue = document.getElementById('resolutionValue');
const charSetSelect = document.getElementById('charSet');
const colorModeCheckbox = document.getElementById('colorMode');
const invertModeCheckbox = document.getElementById('invertMode');
const playPauseBtn = document.getElementById('playPauseBtn');
const stopBtn = document.getElementById('stopBtn');
const seekBar = document.getElementById('seekBar');
const timeDisplay = document.getElementById('timeDisplay');

const ctx = hiddenCanvas.getContext('2d', { willReadFrequently: true });

// State
let animationId = null;
let isWebcam = false;
let stream = null;

// Initialize with placeholder
asciiOutput.innerHTML = '<span class="placeholder-message">Upload a video or use your webcam to begin</span>';

// Event Listeners
videoInput.addEventListener('change', handleVideoUpload);
webcamBtn.addEventListener('change', toggleWebcam);
webcamBtn.addEventListener('click', toggleWebcam);
resolutionSlider.addEventListener('input', updateResolutionDisplay);
playPauseBtn.addEventListener('click', togglePlayPause);
stopBtn.addEventListener('click', stopVideo);
seekBar.addEventListener('input', seekVideo);
videoElement.addEventListener('timeupdate', updateSeekBar);
videoElement.addEventListener('loadedmetadata', onVideoLoaded);
videoElement.addEventListener('ended', onVideoEnded);

function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Stop any existing stream
    stopWebcam();
    isWebcam = false;
    webcamBtn.textContent = '📷 Use Webcam';

    const url = URL.createObjectURL(file);
    videoElement.src = url;
    videoElement.load();
}

async function toggleWebcam() {
    if (isWebcam) {
        stopWebcam();
        webcamBtn.textContent = '📷 Use Webcam';
        isWebcam = false;
        disableControls();
        asciiOutput.innerHTML = '<span class="placeholder-message">Upload a video or use your webcam to begin</span>';
    } else {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            videoElement.srcObject = stream;
            videoElement.play();
            isWebcam = true;
            webcamBtn.textContent = '⏹ Stop Webcam';

            // Disable file-based controls for webcam
            playPauseBtn.disabled = true;
            stopBtn.disabled = true;
            seekBar.disabled = true;

            startRendering();
        } catch (err) {
            console.error('Webcam error:', err);
            alert('Could not access webcam. Please ensure you have granted permission.');
        }
    }
}

function stopWebcam() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    videoElement.srcObject = null;
    cancelAnimationFrame(animationId);
}

function onVideoLoaded() {
    enableControls();
    updateTimeDisplay();
    startRendering();
}

function enableControls() {
    playPauseBtn.disabled = false;
    stopBtn.disabled = false;
    seekBar.disabled = false;
}

function disableControls() {
    playPauseBtn.disabled = true;
    stopBtn.disabled = true;
    seekBar.disabled = true;
}

function togglePlayPause() {
    if (videoElement.paused) {
        videoElement.play();
        playPauseBtn.textContent = '⏸ Pause';
        startRendering();
    } else {
        videoElement.pause();
        playPauseBtn.textContent = '▶ Play';
    }
}

function stopVideo() {
    videoElement.pause();
    videoElement.currentTime = 0;
    playPauseBtn.textContent = '▶ Play';
    cancelAnimationFrame(animationId);
    renderFrame(); // Render first frame
}

function seekVideo() {
    const time = (seekBar.value / 100) * videoElement.duration;
    videoElement.currentTime = time;
}

function updateSeekBar() {
    if (!isWebcam && videoElement.duration) {
        seekBar.value = (videoElement.currentTime / videoElement.duration) * 100;
        updateTimeDisplay();
    }
}

function updateTimeDisplay() {
    const current = formatTime(videoElement.currentTime);
    const duration = formatTime(videoElement.duration || 0);
    timeDisplay.textContent = `${current} / ${duration}`;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function onVideoEnded() {
    playPauseBtn.textContent = '▶ Play';
}

function updateResolutionDisplay() {
    resolutionValue.textContent = resolutionSlider.value;
}

function startRendering() {
    cancelAnimationFrame(animationId);
    renderLoop();
}

function renderLoop() {
    renderFrame();

    if (!videoElement.paused || isWebcam) {
        animationId = requestAnimationFrame(renderLoop);
    }
}

function renderFrame() {
    if (!videoElement.videoWidth) return;

    const width = parseInt(resolutionSlider.value);
    const aspectRatio = videoElement.videoHeight / videoElement.videoWidth;
    // Adjust height for character aspect ratio (characters are taller than wide)
    const height = Math.floor(width * aspectRatio * 0.5);

    hiddenCanvas.width = width;
    hiddenCanvas.height = height;

    ctx.drawImage(videoElement, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    const charSet = CHARACTER_SETS[charSetSelect.value];
    const useColor = colorModeCheckbox.checked;
    const invert = invertModeCheckbox.checked;

    let output = '';

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];

            // Calculate brightness (luminance formula)
            let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            if (invert) {
                brightness = 1 - brightness;
                r = 255 - r;
                g = 255 - g;
                b = 255 - b;
            }

            // Map brightness to character
            const charIndex = Math.floor(brightness * (charSet.length - 1));
            const char = charSet[charIndex];

            if (useColor && char !== ' ') {
                output += `<span style="color:rgb(${r},${g},${b})">${char}</span>`;
            } else {
                output += char;
            }
        }
        output += '\n';
    }

    asciiOutput.innerHTML = output;
}

// Handle visibility change to pause/resume rendering
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationId);
    } else if (!videoElement.paused || isWebcam) {
        startRendering();
    }
});
