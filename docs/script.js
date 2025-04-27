document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements (from "perfect" version) ---
    const screenshotInput = document.getElementById('screenshotInput');
    const gridConfigSelect = document.getElementById('gridConfig');
    const gapSlider = document.getElementById('gapSlider');
    const gapValueSpan = document.getElementById('gapValue');
    const shadowSlider = document.getElementById('shadowSlider');
    const shadowValueSpan = document.getElementById('shadowValue');
    const paddingSlider = document.getElementById('paddingSlider');
    const paddingValueSpan = document.getElementById('paddingValue');
    const backgroundTypeSelect = document.getElementById('backgroundType');
    const themeControls = document.getElementById('themeControls');
    const themeSelector = document.getElementById('themeSelector');
    const solidColorControls = document.getElementById('solidColorControls');
    const bgColorPicker = document.getElementById('bgColorPicker');
    const blurControls = document.getElementById('blurControls'); // For blur slider section
    const blurSlider = document.getElementById('blurSlider');
    const blurValueSpan = document.getElementById('blurValue');
    const exportButton = document.getElementById('exportButton');
    const collageContainer = document.getElementById('collageContainer');
    const backgroundLayer = document.getElementById('backgroundLayer');
    const imageGrid = document.getElementById('imageGrid');

    // --- ADD References for NEW Background Controls ---
    const gradientControls = document.getElementById('gradientControls');
    const gradientColor1Input = document.getElementById('gradientColor1');
    const gradientColor2Input = document.getElementById('gradientColor2');
    const gradientAngleInput = document.getElementById('gradientAngle');
    const imageUploadControls = document.getElementById('imageUploadControls');
    const bgImageInput = document.getElementById('bgImageInput');
    const bgImageNameSpan = document.getElementById('bgImageName');


    // --- State (from "perfect" version) ---
    let uploadedImages = []; // For collage grid
    let currentTheme = themeSelector.value;
    // --- ADD State for NEW Background Options ---
    let gradientColor1 = gradientColor1Input.value;
    let gradientColor2 = gradientColor2Input.value;
    let gradientAngle = gradientAngleInput.value;
    let uploadedBgImageDataUrl = null; // For custom background image


    // --- Initial Setup ---
    console.log("Initializing script...");
    updateGrid(); // Uses auto rows
    updateGap();
    updateShadow();
    updatePadding();
    // ADD calls for new logic
    updateControlVisibility(); // Show/hide controls based on default selection
    updateBackground(); // Apply initial background settings
    document.body.setAttribute('data-theme', currentTheme);
    console.log("Initialization complete.");

    // --- Event Listeners (from "perfect" version + NEW ones) ---
    screenshotInput.addEventListener('change', handleFileUpload);
    gridConfigSelect.addEventListener('change', updateGrid);
    gapSlider.addEventListener('input', updateGap);
    shadowSlider.addEventListener('input', updateShadow);
    paddingSlider.addEventListener('input', updatePadding);
    // MODIFIED backgroundTypeSelect listener
    backgroundTypeSelect.addEventListener('change', () => {
        updateControlVisibility(); // Update visibility first
        updateBackground(); // Then update the background appearance
    });
    themeSelector.addEventListener('change', () => {
        currentTheme = themeSelector.value;
        document.body.setAttribute('data-theme', currentTheme);
        if (backgroundTypeSelect.value === 'theme') {
            updateBackground(); // Update background if theme is active type
        }
    });
    bgColorPicker.addEventListener('input', () => {
         // Only update background if solid color is the selected type
         if (backgroundTypeSelect.value === 'solid') updateBackground();
    });
     // MODIFIED blurSlider listener
    blurSlider.addEventListener('input', () => {
         // Blur applies to solid, gradient, image
         if (['solid', 'gradient', 'image'].includes(backgroundTypeSelect.value)) {
            updateBackground(); // Update background when blur changes for relevant types
         }
         // Also update the displayed value span
         blurValueSpan.textContent = blurSlider.value;
    });
    exportButton.addEventListener('click', exportCollage);

    // --- ADD Listeners for NEW Background Controls ---
    gradientColor1Input.addEventListener('input', () => {
        gradientColor1 = gradientColor1Input.value;
        if (backgroundTypeSelect.value === 'gradient') updateBackground();
    });
    gradientColor2Input.addEventListener('input', () => {
        gradientColor2 = gradientColor2Input.value;
        if (backgroundTypeSelect.value === 'gradient') updateBackground();
    });
    gradientAngleInput.addEventListener('input', () => {
        gradientAngle = gradientAngleInput.value;
        if (backgroundTypeSelect.value === 'gradient') updateBackground();
    });
    bgImageInput.addEventListener('change', handleBgImageUpload); // New listener for bg image


    // --- Functions ---

    // handleFileUpload remains the same as the "perfect" version
    function handleFileUpload(event) {
        console.log("handleFileUpload started");
        const files = Array.from(event.target.files).sort((a, b) => a.lastModified - b.lastModified);
        if (!files || files.length === 0) return;
        uploadedImages = [];
        imageGrid.innerHTML = '';
        console.log("Cleared previous images and grid.");
        let filesProcessed = 0;
        const totalFiles = files.length;
        if (totalFiles === 0) { updateGrid(); updateBackground(); return; }
        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target.result && e.target.result.startsWith('data:image')) {
                         uploadedImages.push({ name: file.name, dataUrl: e.target.result });
                    } else { console.warn("Invalid image data URL:", file.name); }
                    filesProcessed++;
                    if (filesProcessed === totalFiles) { console.log("Collage images processed."); updateGrid(); }
                };
                reader.onerror = (error) => {
                    console.error("File reading error:", file.name, error);
                    filesProcessed++; if (filesProcessed === totalFiles) { console.log("Collage images processed (with errors)."); updateGrid(); }
                };
                reader.readAsDataURL(file);
            } else {
                 console.warn(`Skipping non-image file: ${file.name}`);
                 filesProcessed++; if (filesProcessed === totalFiles) { console.log("Collage images processed (some skipped)."); updateGrid(); }
            }
        });
        screenshotInput.value = ''; console.log("Screenshot input cleared.");
    }

    // --- ADD Function `handleBgImageUpload` ---
    function handleBgImageUpload(event) {
        const file = event.target.files[0];
        bgImageNameSpan.textContent = ''; // Clear previous name/error

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log("Background image loaded:", file.name);
                uploadedBgImageDataUrl = e.target.result;
                bgImageNameSpan.textContent = file.name;
                if (backgroundTypeSelect.value === 'image') {
                    updateBackground(); // Update background if image type is active
                }
            };
            reader.onerror = (error) => {
                console.error("Background image reading error:", file.name, error);
                uploadedBgImageDataUrl = null;
                bgImageNameSpan.textContent = "Error loading image.";
                 if (backgroundTypeSelect.value === 'image') {
                    updateBackground(); // Update to show fallback
                }
            };
            reader.readAsDataURL(file);
        } else if (file) {
            console.warn("Uploaded background file is not an image:", file.name);
            uploadedBgImageDataUrl = null; // Ensure no old image is used
            bgImageNameSpan.textContent = "Not an image file.";
            bgImageInput.value = ''; // Clear the invalid file
             if (backgroundTypeSelect.value === 'image') {
                updateBackground(); // Update to show fallback
            }
        } else {
            // No file selected (cancel button) - keep current state if user cancels
             console.log("Background image selection cancelled.");
        }
    }


    // updateGrid uses `auto` rows (from "perfect" version)
    function updateGrid() {
        const imageGrid = document.getElementById('imageGrid');
        imageGrid.innerHTML = ''; // Clear previous
    
        uploadedImages.forEach(image => {
            const img = document.createElement('img');
            img.src = image.dataUrl;
            img.alt = image.name;
            img.setAttribute('data-filename', image.name);
            imageGrid.appendChild(img);
        });
    
        // ADD THIS HERE:
        if (!window.sortableInstance) {
            window.sortableInstance = new Sortable(document.getElementById('imageGrid'), {
                animation: 150,
                onEnd: function (evt) {
                    const imageGrid = document.getElementById('imageGrid');
                    const newOrder = Array.from(imageGrid.children).map(child => {
                        const name = child.getAttribute('data-filename');
                        return uploadedImages.find(img => img.name === name);
                    });
                    uploadedImages = newOrder;
                    console.log('New image order:', uploadedImages.map(img => img.name));
                }
            });
        }
    }
    


    // updateGap, updatePadding, updateShadow, applyShadowStyle remain the same
    function updateGap() { const gap = gapSlider.value; gapValueSpan.textContent = gap; imageGrid.style.gap = `${gap}px`; }
    function updatePadding() { const padding = paddingSlider.value; paddingValueSpan.textContent = padding; imageGrid.style.padding = `${padding}px`; }
    function updateShadow() { const shadowIntensity = shadowSlider.value; shadowValueSpan.textContent = shadowIntensity; imageGrid.querySelectorAll('img').forEach(img => applyShadowStyle(img)); }
    function applyShadowStyle(element) { const shadowIntensity = shadowSlider.value; if (shadowIntensity > 0) { const spread = Math.round(shadowIntensity / 4); element.style.boxShadow = `0px ${Math.round(shadowIntensity / 2)}px ${shadowIntensity}px ${spread}px var(--img-shadow-color)`; } else { element.style.boxShadow = 'none'; } }


    // --- ADD Modified `updateControlVisibility` ---
    function updateControlVisibility() {
        const selectedType = backgroundTypeSelect.value;
        console.log("Updating control visibility for type:", selectedType);

        // Hide all specific controls first
        themeControls.style.display = 'none';
        solidColorControls.style.display = 'none';
        gradientControls.style.display = 'none';
        imageUploadControls.style.display = 'none';
        blurControls.style.display = 'none'; // Hide blur by default

        // Show controls based on selection
        if (selectedType === 'theme') {
            themeControls.style.display = 'flex'; // Use flex if internal styling needs it
        } else if (selectedType === 'solid') {
            solidColorControls.style.display = 'flex';
            blurControls.style.display = 'flex'; // Show blur
        } else if (selectedType === 'gradient') {
            gradientControls.style.display = 'flex';
            blurControls.style.display = 'flex'; // Show blur
        } else if (selectedType === 'image') {
            imageUploadControls.style.display = 'flex';
            blurControls.style.display = 'flex'; // Show blur
        }
    }

    // --- ADD Modified `updateBackground` ---
    function updateBackground() {
        console.log("--- updateBackground called ---");
        const selectedType = backgroundTypeSelect.value;
        const blurAmount = blurSlider.value; // Get current blur value
        // blurValueSpan.textContent = blurAmount; // Update value display - moved to blur listener

        console.log("Background type:", selectedType, "Blur:", blurAmount);

        // Reset dynamic styles
        backgroundLayer.style.backgroundColor = '';
        backgroundLayer.style.backgroundImage = '';
        backgroundLayer.style.filter = ''; // Clear filter

        let applyFilter = '';
        // Determine if blur should be applied
        if (['solid', 'gradient', 'image'].includes(selectedType) && blurAmount > 0) {
            applyFilter = `blur(${blurAmount}px)`;
        }

        // Set background based on type
        if (selectedType === 'theme') {
             backgroundLayer.style.backgroundColor = 'var(--bg-color)';
        }
        else if (selectedType === 'solid') {
             backgroundLayer.style.backgroundColor = bgColorPicker.value;
        }
        else if (selectedType === 'gradient') {
             // Ensure state variables are current
             gradientColor1 = gradientColor1Input.value;
             gradientColor2 = gradientColor2Input.value;
             gradientAngle = gradientAngleInput.value;
             const gradientString = `linear-gradient(${gradientAngle}deg, ${gradientColor1}, ${gradientColor2})`;
             backgroundLayer.style.backgroundImage = gradientString;
        }
        else if (selectedType === 'image') {
             if (uploadedBgImageDataUrl) {
                 backgroundLayer.style.backgroundImage = `url('${uploadedBgImageDataUrl}')`;
                 backgroundLayer.style.backgroundSize = 'cover'; // Ensure uploaded images cover
                 backgroundLayer.style.backgroundPosition = 'center';
             } else {
                 backgroundLayer.style.backgroundColor = 'var(--bg-color)'; // Fallback
             }
        }

        // Apply filter (if any) AFTER setting the background
        if (applyFilter) {
             backgroundLayer.style.filter = applyFilter;
        }

         console.log("--- updateBackground finished ---");
    }


    // exportCollage remains the same as the "perfect" version
    function exportCollage() {
        console.log("--- exportCollage called ---");
        const originalBorder = collageContainer.style.border;
        collageContainer.style.border = 'none';
        const options = { useCORS: true, allowTaint: true, backgroundColor: null, scale: 5, logging: true };
        console.log("Calling html2canvas...");
        setTimeout(() => { // Delay helps ensure styles are applied
            html2canvas(collageContainer, options).then(canvas => {
                console.log("html2canvas success.");
                collageContainer.style.border = originalBorder;
                const link = document.createElement('a');
                link.download = 'linux-desktop-collage.png';
                try { link.href = canvas.toDataURL('image/png'); link.click(); }
                catch (e) { console.error("Canvas toDataURL error:", e); alert("Error generating image."); }
            }).catch(err => {
                console.error("html2canvas error:", err);
                collageContainer.style.border = originalBorder; alert("Error exporting.");
            });
        }, 150); // Slightly longer delay maybe needed
    }

}); // End DOMContentLoaded

console.log("script.js loaded (Reverted + BG Features).");