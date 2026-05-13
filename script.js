document.addEventListener('DOMContentLoaded', () => {
    function isMobile() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Game state
    let score = 0;
    let isMuted = false;
    let combo = 0;
    let comboTimer = null;

    // DOM elements
    const container = document.getElementById('container');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const muteBtn = document.getElementById('mute-btn');
    const scoreValue = document.getElementById('score-value');
    const encouragement = document.getElementById('encouragement');
    const characterBody = document.querySelector('.character-body');
    const characterArms = document.querySelector('.character-arms');
    
    // Sound effects - Web Audio API for better compatibility
    const popSound1 = document.getElementById('pop-sound-1');
    const specialSound = document.getElementById('special-sound');
    
    // Initialize Web Audio API for older devices
    let audioContext = null;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
    
    // Generate pop sound using Web Audio API
    function generatePopSound() {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    // Generate special sound using Web Audio API
    function generateSpecialSound() {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.2);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
    
    // Bright, high-contrast colors for balloons
    const colors = [
        { start: '#FF0000', end: '#FF6B6B' },    // Bright Red
        { start: '#00FF00', end: '#6BCF7F' },    // Bright Green
        { start: '#0000FF', end: '#4D96FF' },    // Bright Blue
        { start: '#FFFF00', end: '#FFD93D' },    // Bright Yellow
        { start: '#FF00FF', end: '#FF6BFF' },    // Bright Magenta
        { start: '#00FFFF', end: '#6BFFFF' },    // Bright Cyan
        { start: '#FF6B00', end: '#FF8E53' },    // Bright Orange
        { start: '#9D4EDD', end: '#C77DFF' }     // Bright Purple
    ];

    // Encouraging messages for kids
    const encouragingMessages = [
        "🌟 Awesome!", "🎉 Great job!", "✨ Amazing!", "🎊 Fantastic!",
        "🏆 Super!", "💫 Brilliant!", "🎈 Wow!", "⭐ Perfect!",
        "🌈 Wonderful!", "🎯 Nice pop!", "💥 Boom!", "🚀 Incredible!"
    ];

    const emojiList = ['😀', '😃', '😄', '😁', '🥳', '🤩', '😎', '🐶', '🐱', '🐼', '🦁', '🐯', '🦊', '🐻'];

    // Play sound with volume control - with Web Audio API fallback
    function playSound(sound, volume = 0.7, isSpecial = false) {
        if (isMuted) return;
        
        // Resume audio context on user interaction (required for mobile)
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Try HTML5 audio first
        if (sound && sound.src) {
            sound.volume = volume;
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.log('HTML5 audio failed, using Web Audio API');
                // Fallback to Web Audio API
                if (isSpecial) {
                    generateSpecialSound();
                } else {
                    generatePopSound();
                }
            });
        } else {
            // Use Web Audio API directly if no audio element
            if (isSpecial) {
                generateSpecialSound();
            } else {
                generatePopSound();
            }
        }
    }

    // Haptic feedback for mobile devices
    function triggerHaptic() {
        if (navigator.vibrate) {
            navigator.vibrate(50); // Vibrate for 50ms
        }
    }

    // Update score with animation
    function updateScore(points) {
        score += points;
        scoreValue.textContent = score;
        
        // Animate score
        const scoreElement = document.getElementById('score');
        scoreElement.style.animation = 'none';
        setTimeout(() => {
            scoreElement.style.animation = 'score-pulse 0.5s ease';
        }, 10);

        // Show encouraging message
        showEncouragement(points);

        // Character celebrates
        celebrateCharacter();
    }

    // Show encouraging message
    function showEncouragement(points) {
        const message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        encouragement.textContent = points > 5 ? `${message} +${points}!` : message;
        encouragement.style.animation = 'none';
        setTimeout(() => {
            encouragement.style.animation = 'bounce 0.6s ease';
        }, 10);
        
        setTimeout(() => {
            encouragement.textContent = '';
        }, 2000);
    }

    // Character celebration animation
    function celebrateCharacter() {
        characterBody.classList.add('celebrating');
        characterArms.classList.add('celebrating');
        
        setTimeout(() => {
            characterBody.classList.remove('celebrating');
            characterArms.classList.remove('celebrating');
        }, 500);
    }

    // Create touch ripple effect
    function createTouchRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        container.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Create balloon with special types
    function createBalloon() {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        
        // Determine balloon type (10% chance for special balloons)
        const random = Math.random();
        let balloonType = 'normal';
        let points = 1;
        
        if (random < 0.05) {
            // Golden balloon - 5% chance, worth 10 points
            balloon.classList.add('golden');
            balloonType = 'golden';
            points = 10;
        } else if (random < 0.10) {
            // Rainbow balloon - 5% chance, worth 5 points
            balloon.classList.add('rainbow');
            balloonType = 'rainbow';
            points = 5;
        } else if (random < 0.15) {
            // Star balloon - 5% chance, worth 3 points
            balloon.classList.add('star');
            balloonType = 'star';
            points = 3;
        } else if (random < 0.25) {
            // Emoji balloon - 10% chance, worth 2 points
            balloon.classList.add('emoji');
            const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
            balloon.setAttribute('data-emoji', emoji);
            balloonType = 'emoji';
            points = 2;
        } else {
            // Normal balloon - bright colors
            const color = colors[Math.floor(Math.random() * colors.length)];
            balloon.style.background = `radial-gradient(circle at bottom, ${color.start}, ${color.end})`;
        }
        
        balloon.dataset.points = points;
        balloon.dataset.type = balloonType;
        
        balloon.style.left = `${Math.random() * 90 + 5}%`; // Keep balloons away from edges
        balloon.style.animationDuration = `${10 + Math.random() * 5}s`;
        container.appendChild(balloon);

        const blast = (e) => {
            if (balloon.clientWidth > 0) {
                e.preventDefault();
                
                // Haptic feedback
                triggerHaptic();
                
                // Visual feedback - touch ripple
                createTouchRipple(e.clientX, e.clientY);
                
                // Play appropriate sound
                if (balloonType === 'golden' || balloonType === 'rainbow' || balloonType === 'star') {
                    playSound(specialSound, 0.4, true);
                } else {
                    playSound(popSound1, 0.3, false);
                }
                
                // Update score
                updateScore(points);
                
                // Combo system
                combo++;
                clearTimeout(comboTimer);
                comboTimer = setTimeout(() => {
                    combo = 0;
                }, 2000);
                
                // Bonus for combos
                if (combo >= 5) {
                    updateScore(combo);
                    showEncouragement(combo);
                }
                
                // Create burst effect
                createBurstEffect(balloon, e);
                balloon.remove();
            }
        };

        balloon.addEventListener('pointerdown', blast);
        
        // For mobile - easier touch
        if (isMobile()) {
            balloon.addEventListener("pointerenter", blast);
        }

        // Remove balloon after animation completes
        setTimeout(() => {
            if (container.contains(balloon)) {
                container.removeChild(balloon);
            }
        }, 15000);
    }

    // Create burst effect with more fragments for special balloons
    function createBurstEffect(balloon, e) {
        const burstContainer = document.createElement('div');
        burstContainer.className = 'burst';        
        burstContainer.style.left = e.clientX + "px";
        burstContainer.style.top = e.clientY + "px";
        burstContainer.style.background = balloon.style.background || 'radial-gradient(circle, #FFD700, #FFF9C4)';

        const fragmentCount = balloon.dataset.type === 'normal' ? 10 : 15;
        
        for (let i = 0; i < fragmentCount; i++) {
            const fragment = document.createElement('div');
            fragment.className = 'fragment';
            fragment.style.setProperty('--x', `${Math.random() * 400 - 200}px`);
            fragment.style.setProperty('--y', `${Math.random() * 400 - 200}px`);
            burstContainer.appendChild(fragment);
        }

        container.appendChild(burstContainer);

        setTimeout(() => {
            burstContainer.remove();
        }, 500);
    }

    // Start creating balloons
    setInterval(createBalloon, 1000);

    // Mute button
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
    });

    // Fullscreen button
    fullscreenBtn.addEventListener('click', () => {
        const elem = document.documentElement;

        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
            fullscreenBtn.textContent = "⊗";
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            fullscreenBtn.textContent = "⛶";
        }
    });

});
