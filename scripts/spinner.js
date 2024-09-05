function startTests(buttonId) {
    const startBtn = document.getElementById(buttonId);
    startBtn.disabled = true;
    startBtn.innerHTML = '<div class="spinner"></div>';
}
