/**
 * DCU Post Generator
 * Instagram-style university post card creator
 */

(function () {
    'use strict';

    // ===== DOM Elements =====
    const contextText = document.getElementById('contextText');
    const nameText = document.getElementById('nameText');
    const identityText = document.getElementById('identityText');
    const photoInput = document.getElementById('photoInput');
    const uploadArea = document.getElementById('uploadArea');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewThumb = document.getElementById('previewThumb');
    const fileName = document.getElementById('fileName');
    const changePhoto = document.getElementById('changePhoto');
    const generateBtn = document.getElementById('generateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const canvas = document.getElementById('outputCanvas');
    const ctx = canvas.getContext('2d');
    const placeholderMsg = document.getElementById('placeholderMsg');

    // Counters
    const contextCounter = document.getElementById('contextCounter');
    const nameCounter = document.getElementById('nameCounter');
    const identityCounter = document.getElementById('identityCounter');

    // ===== State =====
    let uploadedImage = null;
    let uploadedImageURL = null;
    let fontsLoaded = false;
    let assetsLoaded = false;

    // Asset images
    const bgImg = new Image();
    const dcuImg = new Image();
    const synergyImg = new Image();

    // Canvas size (matches reference Instagram post)
    const CANVAS_SIZE = 1080;

    // ===== Font Loading =====
    async function loadFonts() {
        try {
            await Promise.all([
                document.fonts.load('bold 54px Constantia'),
                document.fonts.load('44px Kalpurush'),
                document.fonts.load('28px Kalpurush'),
                document.fonts.load('bold 28px Constantia')
            ]);
            fontsLoaded = true;
            console.log('Fonts loaded');
        } catch (e) {
            console.warn('Font loading issue:', e);
            fontsLoaded = true; // proceed anyway
        }
    }

    // ===== Asset Loading =====
    function loadAssets() {
        return new Promise((resolve) => {
            let loaded = 0;
            const total = 3;

            function check() {
                loaded++;
                if (loaded === total) {
                    assetsLoaded = true;
                    resolve();
                }
            }

            bgImg.onload = check;
            bgImg.onerror = check;
            bgImg.src = 'assets/bg.png';

            dcuImg.onload = check;
            dcuImg.onerror = check;
            dcuImg.src = 'assets/dcu.png';

            synergyImg.onload = check;
            synergyImg.onerror = check;
            synergyImg.src = 'assets/synergy.png';
        });
    }

    // ===== Character Counters =====
    function updateCounter(input, counterEl, max) {
        const len = input.value.length;
        counterEl.textContent = `${len} / ${max}`;
        counterEl.classList.remove('near-limit', 'at-limit');
        if (len >= max) {
            counterEl.classList.add('at-limit');
        } else if (len >= max * 0.85) {
            counterEl.classList.add('near-limit');
        }
    }

    contextText.addEventListener('input', () => {
        updateCounter(contextText, contextCounter, 170);
    });
    nameText.addEventListener('input', () => {
        updateCounter(nameText, nameCounter, 16);
    });
    identityText.addEventListener('input', () => {
        updateCounter(identityText, identityCounter, 40);
    });

    // ===== Photo Upload =====
    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file (JPG, PNG, WEBP, etc.)');
            return;
        }

        if (uploadedImageURL) {
            URL.revokeObjectURL(uploadedImageURL);
        }

        uploadedImageURL = URL.createObjectURL(file);
        uploadedImage = new Image();
        uploadedImage.onload = () => {
            previewThumb.src = uploadedImageURL;
            fileName.textContent = file.name;
            uploadPlaceholder.style.display = 'none';
            uploadPreview.style.display = 'flex';
        };
        uploadedImage.src = uploadedImageURL;
    }

    uploadArea.addEventListener('click', (e) => {
        if (e.target === changePhoto) return;
        photoInput.click();
    });

    changePhoto.addEventListener('click', (e) => {
        e.stopPropagation();
        photoInput.click();
    });

    photoInput.addEventListener('change', () => {
        if (photoInput.files && photoInput.files[0]) {
            handleFile(photoInput.files[0]);
        }
    });

    // Drag & drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // ===== Helper: Detect if text is primarily Bangla =====
    function isBangla(text) {
        // Bangla Unicode range: \u0980-\u09FF
        const banglaChars = (text.match(/[\u0980-\u09FF]/g) || []).join('').length;
        const total = text.replace(/\s/g, '').length;
        return total > 0 && banglaChars / total > 0.3;
    }

    function getFontForText(text, size, isBold = false) {
        if (isBangla(text)) {
            return `${size}px Kalpurush`;
        }
        return isBold ? `bold ${size}px Constantia` : `${size}px Constantia`;
    }

    // ===== Text Wrapping =====
    function wrapText(context, text, maxWidth) {
        const words = text.split(/(\s+)/);
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i];
            const metrics = context.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }
        return lines;
    }

    // ===== Draw Card =====
    function drawCard() {
        if (!assetsLoaded) {
            console.warn('Assets not ready');
            return;
        }

        const W = CANVAS_SIZE;
        const H = CANVAS_SIZE;
        ctx.clearRect(0, 0, W, H);

        // --- 1. Background (bg.png) ---
        // Cover the whole canvas, slightly washed/light
        // bg is 1687x1116, we need to cover 1080x1080
        // Crop center or scale to cover
        const bgAspect = bgImg.width / bgImg.height;
        const canvasAspect = 1;
        let sx, sy, sw, sh;
        if (bgAspect > canvasAspect) {
            // bg wider: crop sides
            sh = bgImg.height;
            sw = bgImg.height * canvasAspect;
            sx = (bgImg.width - sw) / 2;
            sy = 0;
        } else {
            sw = bgImg.width;
            sh = bgImg.width / canvasAspect;
            sx = 0;
            sy = (bgImg.height - sh) / 2;
        }
        ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, W, H);

        // Light overlay to match washed-out reference look
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(0, 0, W, H);

        // --- 2. Logos ---
        // DCU logo top-left
        const dcuW = 160;
        const dcuH = (dcuImg.height / dcuImg.width) * dcuW;
        ctx.drawImage(dcuImg, 36, 28, dcuW, dcuH);

        // Synergy logo top-right
        const synW = 130;
        const synH = (synergyImg.height / synergyImg.width) * synW;
        ctx.drawImage(synergyImg, W - synW - 30, 22, synW, synH);

        // --- 3. Context / Quote text (left side) ---
        const quote = contextText.value.trim() || '';
        if (quote) {
            const fontSize = 44;
            ctx.font = getFontForText(quote, fontSize, true);
            ctx.fillStyle = '#6B1E1E'; // dark burgundy/maroon matching reference
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            const maxTextWidth = 480; // leave space for photo
            const lineHeight = 56;
            const startX = 48;
            const startY = 200;

            const lines = wrapText(ctx, quote, maxTextWidth);
            // Limit to ~7 lines to avoid photo overlap
            const maxLines = 8;
            const displayLines = lines.slice(0, maxLines);

            displayLines.forEach((line, i) => {
                ctx.fillText(line, startX, startY + i * lineHeight);
            });
        }

        // --- 4. Bottom Banner ---
        const bannerH = 180;
        const bannerY = H - bannerH;
        ctx.fillStyle = '#862222'; // burgundy
        ctx.fillRect(0, bannerY, W, bannerH);

        // --- 5. User Photo (bottom-right, overlapping banner) ---
        if (uploadedImage && uploadedImage.complete) {
            // Position: bottom-right, overlapping the banner like reference
            const photoMaxW = 420;
            const photoMaxH = 620;
            const photoAspect = uploadedImage.width / uploadedImage.height;

            let photoW, photoH;
            if (photoAspect > photoMaxW / photoMaxH) {
                photoW = photoMaxW;
                photoH = photoMaxW / photoAspect;
            } else {
                photoH = photoMaxH;
                photoW = photoMaxH * photoAspect;
            }

            // Align to bottom-right, slightly overlapping banner
            const photoX = W - photoW - 20;
            const photoY = H - photoH - 10; // slightly into banner area

            // Soft shadow under photo
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.25)';
            ctx.shadowBlur = 18;
            ctx.shadowOffsetX = -4;
            ctx.shadowOffsetY = 4;
            ctx.drawImage(uploadedImage, photoX, photoY, photoW, photoH);
            ctx.restore();
        }

        // --- 6. Name & Identity on banner (left) ---
        const name = nameText.value.trim() || '';
        const identity = identityText.value.trim() || '';

        if (name) {
            ctx.font = getFontForText(name, 54, true);
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            // Keep name left of photo
            const nameMaxW = 520;
            // Simple truncate if too long
            let displayName = name;
            while (ctx.measureText(displayName).width > nameMaxW && displayName.length > 3) {
                displayName = displayName.slice(0, -1);
            }
            if (displayName !== name) displayName += '…';
            ctx.fillText(displayName, 48, bannerY + 42);
        }

        if (identity) {
            ctx.font = getFontForText(identity, 28, false);
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            let displayId = identity;
            const idMaxW = 520;
            while (ctx.measureText(displayId).width > idMaxW && displayId.length > 3) {
                displayId = displayId.slice(0, -1);
            }
            if (displayId !== identity) displayId += '…';
            ctx.fillText(displayId, 48, bannerY + 110);
        }

        // Hide placeholder
        placeholderMsg.classList.add('hidden');
        downloadBtn.disabled = false;
    }

    // ===== Generate =====
    generateBtn.addEventListener('click', async () => {
        const quote = contextText.value.trim();
        const name = nameText.value.trim();

        if (!quote && !name) {
            alert('Please enter at least a quote or a name.');
            return;
        }

        // Ensure fonts & assets ready
        if (!fontsLoaded) await loadFonts();
        if (!assetsLoaded) await loadAssets();

        // Small delay to ensure font metrics are ready
        setTimeout(() => {
            drawCard();
        }, 50);
    });

    // ===== Reset =====
    resetBtn.addEventListener('click', () => {
        contextText.value = '';
        nameText.value = '';
        identityText.value = '';
        updateCounter(contextText, contextCounter, 170);
        updateCounter(nameText, nameCounter, 16);
        updateCounter(identityText, identityCounter, 40);

        if (uploadedImageURL) {
            URL.revokeObjectURL(uploadedImageURL);
        }
        uploadedImage = null;
        uploadedImageURL = null;
        photoInput.value = '';
        previewThumb.src = '';
        fileName.textContent = '';
        uploadPlaceholder.style.display = 'flex';
        uploadPreview.style.display = 'none';

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        placeholderMsg.classList.remove('hidden');
        downloadBtn.disabled = true;
    });

    // ===== Download JPG =====
    downloadBtn.addEventListener('click', () => {
        if (downloadBtn.disabled) return;

        // Ensure high quality
        const dataURL = canvas.toDataURL('image/jpeg', 0.95);

        const name = (nameText.value.trim() || 'DCU_Student')
            .replace(/\s+/g, '_')
            .replace(/[^\w\u0980-\u09FF\-]/g, '');
        const filename = `${name}_DCU_Post.jpg`;

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // ===== Init =====
    async function init() {
        await Promise.all([loadFonts(), loadAssets()]);
        console.log('App ready');
    }

    init();
})();
