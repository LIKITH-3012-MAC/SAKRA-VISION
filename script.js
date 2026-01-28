// Subtle interactive background effect
window.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX / window.innerWidth) * 50;
    const moveY = (e.clientY / window.innerHeight) * 50;
    document.body.style.backgroundPosition = `${moveX}% ${moveY}%`;
});

