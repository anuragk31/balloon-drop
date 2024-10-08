document.addEventListener('DOMContentLoaded', () => {
    function isMobile() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    const container = document.getElementById('container');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const blastSound = document.getElementById('blast-sound');
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    

    function createBalloon() {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.background = `radial-gradient(circle at bottom, ${colors[Math.floor(Math.random() * colors.length)]}, #ffffff)`;
        balloon.style.left = `${Math.random() * 100}%`;
        balloon.style.animationDuration = `${10 + Math.random() * 5}s`;
        container.appendChild(balloon);

        const blast = (e)=>{
            if(balloon.clientWidth > 0){
                blastSound.currentTime = 0; // Rewind to the start
                blastSound.play(); // Play the sound effect
                createBurstEffect(balloon, e);
                balloon.remove();
            }
        }

        balloon.addEventListener('pointerdown', blast);
        
        if (isMobile()) {
            balloon.addEventListener("pointerenter", blast);
        }

        setTimeout(() => {
            if (container.contains(balloon)) {
                container.removeChild(balloon);
            }
        }, 15000);
    }

    function createBurstEffect(balloon, e) {
        //console.log('Balloon blast before', e);
        const burstContainer = document.createElement('div');
        burstContainer.className = 'burst';        
        burstContainer.style.left = e.clientX + "px";//balloon.style.left;
        burstContainer.style.top = e.clientY + "px";//balloon.getBoundingClientRect().top + "px";
        burstContainer.style.background = balloon.style.background;

        for (let i = 0; i < 10; i++) {
            const fragment = document.createElement('div');
            fragment.className = 'fragment';
            fragment.style.setProperty('--x', `${Math.random() * 300 - 100}px`);
            fragment.style.setProperty('--y', `${Math.random() * 300 - 100}px`);
            burstContainer.appendChild(fragment);
        }

        container.appendChild(burstContainer);

        setTimeout(() => {
            burstContainer.remove();
        }, 500);
    }

    setInterval(createBalloon, 1000);

    fullscreenBtn.addEventListener('click', () => {
        const elem = document.documentElement;

        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) { // Firefox
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, and Opera
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { // IE/Edge
                elem.msRequestFullscreen();
            }
            fullscreenBtn.textContent = "X";
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
            fullscreenBtn.textContent = "Enter Fullscreen";
        }
    });
});
