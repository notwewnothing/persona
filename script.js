document.addEventListener("keydown", function (event) {
    if (event.key === "Tab") {
        event.preventDefault();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    let menuItems = document.querySelectorAll('.text');
    let itemSpans = document.querySelectorAll('.text span[id^="m_"]');
    let currentIndex = 0;

    const sideIndex = document.getElementById('side_index');
    const cmdDesc = document.getElementById('cmd_desc');
    const bottomBar = document.getElementById('bottom_bar');
    const siteFooter = document.getElementById('site_footer');
    const bgVideo = document.getElementById('bg_video');
    const container = document.getElementById('menu_container');

    // Submenu Elements
    const submenuOverlay = document.getElementById('submenu_overlay');
    const reveal1 = document.getElementById('reveal_1');
    const reveal2 = document.getElementById('reveal_2');
    const submenuBackBtn = document.getElementById('submenu_back_btn');
    const submenuVideo = document.getElementById('submenu_video');
    const panels = document.querySelectorAll('.submenu-panel');
    const music = document.getElementById('music-toggle');

    let isSubmenuOpen = false;
    let currentPanel = null;


    // Per-item highlight transforms (keyed by element id)
    const highlightData = {
        m_skill: { transform: 'scale(130%) rotate(-28deg) translate(28px, 10px)', prefix: 'skill', panelId: 'panel_skill' },
        m_item: { transform: 'scale(130%) rotate(-14deg) translate(36px, 6px)', prefix: 'item', panelId: 'panel_item' },
        m_equip: { transform: 'scale(130%) rotate(-20deg) translate(32px, 8px)', prefix: 'equip', panelId: 'panel_equip' },
        m_persona: { transform: 'scale(130%) rotate(-18deg) translate(24px, 2px)', prefix: 'persona', panelId: 'panel_persona' },
        m_stats: { transform: 'scale(130%) translate(40px, -4px)', prefix: 'stats', panelId: 'panel_stats' },
        m_quest: { transform: 'scale(130%) rotate(-12deg) translate(36px, 4px)', prefix: 'quest', panelId: 'panel_quest' },
        m_socialLink: { transform: 'scale(130%) rotate(-6deg) translate(28px, -2px)', prefix: 'socialLink', panelId: 'panel_socialLink' },
        m_calendar: { transform: 'scale(130%) rotate(-4deg) translate(26px, 0px)', prefix: 'calendar', panelId: 'panel_calendar' },
        m_system: { transform: 'scale(130%) rotate(8deg) translate(32px, 0px)', prefix: 'system', panelId: 'panel_system' },
    };


    function waitForVideo(video) {
        return new Promise((resolve) => {
            if (!video) { resolve(); return; }
            // If the video already has enough data, resolve immediately
            if (video.readyState >= 4) { resolve(); return; }
            video.addEventListener('canplaythrough', () => resolve(), { once: true });
            // Start loading if not already
            video.load();
        });
    }

    function waitForImage(img) {
        return new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) { resolve(); return; }
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
        });
    }

    function preloadAllAssets() {
        const promises = [];

        // Wait for both videos
        promises.push(waitForVideo(bgVideo));
        promises.push(waitForVideo(submenuVideo));

        // Wait for all images in the document (including SVGs and GIFs)
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => promises.push(waitForImage(img)));

        // Wait for fonts
        if (document.fonts && document.fonts.ready) {
            promises.push(document.fonts.ready);
        }

        return Promise.all(promises);
    }

    preloadAllAssets().then(() => {
        const loader = document.getElementById('loading_screen');
        if (loader) {
            loader.classList.add('hidden');
        }

        document.body.classList.add('loaded');

        // Play the background video
        if (bgVideo) bgVideo.play().catch(e => console.log("Video auto-play prevented:", e));

        // Stagger in the menu items (bottom to top pop)
        setTimeout(() => {
            const reversedItems = Array.from(menuItems).reverse();
            reversedItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('spawned');
                }, index * 100); // 100ms stagger for a more visible pop effect
            });
        }, 100);

        // Initialize first selection after items have popped in
        setTimeout(() => {
            selectItem(0);
        }, 1200);
    });

    // Idle animation removed per user request


    function selectItem(index, force = false) {
        if (isSubmenuOpen && !force) return;

        currentIndex = index;
        const itemSpan = itemSpans[currentIndex];
        const itemDiv = menuItems[currentIndex];

        // Reset every menu item
        itemSpans.forEach(i => {
            i.style.transform = '';
            i.style.zIndex = '';
            i.style.color = '';
        });

        // Hide all highlight wrappers
        document.querySelectorAll('.highlight-wrapper').forEach(wrapper => {
            wrapper.classList.remove('active');
            wrapper.style.opacity = '0';
        });

        // Hide all decoration elements
        document.querySelectorAll('[id^="t_"]').forEach(el => {
            el.style.opacity = '0';
        });

        // Apply highlight for the selected item
        const data = highlightData[itemSpan.id];
        if (data) {
            itemSpan.style.transform = data.transform;
            itemSpan.style.zIndex = '1';
            itemSpan.style.color = 'black'; // Ensure color change

            // Show the wrapper and make it active for pulse animation
            const wrapper = document.getElementById('hw_' + data.prefix);
            if (wrapper) {
                wrapper.classList.add('active');
                wrapper.style.opacity = '1';
            }

            // Show decoration overlays inside
            document.getElementById('t_' + data.prefix).style.opacity = '1';
            document.getElementById('t_' + data.prefix + 'w').style.opacity = '1';
            document.getElementById('t_' + data.prefix + 'ch').style.opacity = '1';
            document.getElementById('t_' + data.prefix + 'ch1').style.opacity = '1';
        }

        // Update Side Index
        if (sideIndex) {
            const num = itemDiv.getAttribute('data-index') || '1';
            sideIndex.innerHTML = `<span class="z-1">0${num}</span>`;
        }

        // Update Bottom Bar Description
        if (cmdDesc) {
            cmdDesc.textContent = itemDiv.getAttribute('data-desc') || '';
        }

        itemSpan.focus();
    }

    // Initial selection is now handled in the load event listener above


    function openSubmenu() {
        if (isSubmenuOpen) return;
        isSubmenuOpen = true;

        const data = highlightData[itemSpans[currentIndex].id];
        currentPanel = document.getElementById(data.panelId);


        // Play submenu video
        if (submenuVideo) {
            submenuVideo.play().catch(e => console.log("Video auto-play prevented:", e));
        }

        // Get coordinates of the clicked item to center the reveal
        const rect = menuItems[currentIndex].getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Use percentage coordinates for clip-path
        const xPct = (x / window.innerWidth) * 100 + '%';
        const yPct = (y / window.innerHeight) * 100 + '%';
        const x2Pct = ((x / window.innerWidth) * 100 - 5) + '%';

        reveal1.style.setProperty('--reveal-x', xPct);
        reveal1.style.setProperty('--reveal-y', yPct);
        reveal2.style.setProperty('--reveal-x2', x2Pct);
        reveal2.style.setProperty('--reveal-y2', yPct);

        // Start overlay & reveal transition
        submenuOverlay.classList.add('active');

        // Show random photos when submenu opens
        const wrapper = document.getElementById('about_me_photos');
        if (wrapper) {
            wrapper.classList.add('visible');
            randomizePhotos();
        }

        // Slight delay to allow CSS properties to update
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                reveal1.classList.add('expanding');
                reveal2.classList.add('expanding');

                // Show the specific panel content, video, and back button
                if (currentPanel) {
                    currentPanel.classList.remove('hiding');
                    currentPanel.classList.add('visible');
                }
                if (submenuVideo) {
                    submenuVideo.classList.add('visible');

                }
                if (music)
                    setTimeout(() => {
                        submenuBackBtn.classList.add('visible');
                    }, 400);
            });
        });
    }

    function closeSubmenu() {
        if (!isSubmenuOpen) return;

        const panelToHide = currentPanel;


        if (panelToHide) {
            panelToHide.classList.remove('visible');
            panelToHide.classList.add('hiding');
        }
        if (submenuVideo) {
            submenuVideo.classList.remove('visible');
            setTimeout(() => submenuVideo.pause(), 500); // Pause video after fade out
        }
        submenuBackBtn.classList.remove('visible');

        // Collapse the circular reveal
        reveal1.classList.remove('expanding');
        reveal2.classList.remove('expanding');
        reveal1.classList.add('collapsing');
        reveal2.classList.add('collapsing');

        // Hide photos when submenu closes
        const wrapper = document.getElementById('about_me_photos');
        if (wrapper) {
            wrapper.classList.remove('visible');
            hidePhotos();
        }

        // Wait for the collapse animation
        setTimeout(() => {
            isSubmenuOpen = false;
            submenuOverlay.classList.remove('active');
            reveal1.classList.remove('collapsing');
            reveal2.classList.remove('collapsing');

            if (panelToHide) {
                panelToHide.classList.remove('hiding');
            }


            // Refocus main menu
            selectItem(currentIndex);
        }, 500);
    }



    // Keyboard navigation
    document.addEventListener("keydown", function (event) {
        if (isSubmenuOpen) {
            // Handle submenu close
            if (event.key === "Escape" || event.key === "Backspace" || (event.key === "a" || event.key === "A")) {
                closeSubmenu();
            }
            return; // Block other navigation while in submenu
        }

        switch (event.key) {
            case "ArrowDown":
            case "s":
            case "S":
                selectItem((currentIndex + 1) % itemSpans.length);
                break;
            case "ArrowUp":
            case "w":
            case "W":
                selectItem((currentIndex - 1 + itemSpans.length) % itemSpans.length);
                break;
            case "Enter":
            case " ":
            case "b":
            case "B":
                openSubmenu();
                break;
            default:
                return;
        }
    });

    // Mouse hover navigation
    menuItems.forEach(function (row, index) {
        row.addEventListener("mouseenter", function () {
            if (!isSubmenuOpen) {
                selectItem(index);
            }
        });

        // Mouse click opens submenu
        row.addEventListener("click", function (e) {
            e.stopPropagation();
            if (isSubmenuOpen) {
                if (currentIndex !== index) {
                    // Hide old panel immediately
                    if (currentPanel) {
                        currentPanel.classList.remove('visible');
                        currentPanel.classList.add('hiding');
                    }

                    selectItem(index, true);

                    const data = highlightData[itemSpans[currentIndex].id];
                    currentPanel = document.getElementById(data.panelId);

                    // Update reveal positions
                    const rect = menuItems[currentIndex].getBoundingClientRect();
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    const xPct = (x / window.innerWidth) * 100 + '%';
                    const yPct = (y / window.innerHeight) * 100 + '%';
                    const x2Pct = ((x / window.innerWidth) * 100 - 5) + '%';

                    reveal1.style.setProperty('--reveal-x', xPct);
                    reveal1.style.setProperty('--reveal-y', yPct);
                    reveal2.style.setProperty('--reveal-x2', x2Pct);
                    reveal2.style.setProperty('--reveal-y2', yPct);

                    if (currentPanel) {
                        currentPanel.classList.remove('hiding');
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                currentPanel.classList.add('visible');
                            });
                        });
                    }
                }
            } else {
                selectItem(index);
                openSubmenu();
            }
        });
    });


    if (submenuBackBtn) {
        submenuBackBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            closeSubmenu();
        });
    }

    // Close when clicking the submenu background
    document.addEventListener("click", function (event) {
        if (isSubmenuOpen) {
            if (!event.target.closest('.bold-shape-container') && !event.target.closest('.submenu-panel') && !event.target.closest('.submenu-back') && !event.target.closest('.text')) {
                closeSubmenu();
            }
        }
    });


    const PLAYLIST = [
        { src: "assets/When The Moon's Reaching Out Stars -Reload-.mp3", title: "When The Moon's Reaching Out Stars" },
        { src: "assets/Color Your Night.mp3", title: "Color Your Night" },
        { src: "assets/巌戸台分寮 -Reload-.mp3", title: "巌戸台分寮" },
    ];

    const musicToggle = document.getElementById('music_toggle');
    const musicPlayer = document.getElementById('music_player');
    const musicAudio = document.getElementById('music_audio');
    const musicTrackName = document.getElementById('music_track_name');
    const musicPlayPause = document.getElementById('music_play_pause');
    const musicPrev = document.getElementById('music_prev');
    const musicNext = document.getElementById('music_next');

    let musicTrackIndex = 0;
    let isMusicPlayerOpen = false;

    function updateMusicTrackLabel() {
        if (musicTrackName) {
            musicTrackName.textContent = PLAYLIST[musicTrackIndex].title;
        }
    }

    function updatePlayPauseButton() {
        if (!musicPlayPause || !musicAudio) return;
        const playing = !musicAudio.paused;
        musicPlayPause.textContent = playing ? '❚❚' : '▶';
        musicPlayPause.setAttribute('aria-label', playing ? 'Pause' : 'Play');
        if (musicToggle) {
            musicToggle.classList.toggle('is-playing', playing);
        }
    }

    function loadMusicTrack(index, autoplay) {
        if (!musicAudio || !PLAYLIST.length) return;
        musicTrackIndex = (index + PLAYLIST.length) % PLAYLIST.length;
        const track = PLAYLIST[musicTrackIndex];
        musicAudio.src = track.src;
        updateMusicTrackLabel();
        if (autoplay) {
            musicAudio.play().catch(() => updatePlayPauseButton());
        }
        updatePlayPauseButton();
    }

    function openMusicPlayer() {
        if (!musicPlayer || !musicToggle) return;
        isMusicPlayerOpen = true;
        musicPlayer.classList.add('open');
        musicPlayer.setAttribute('aria-hidden', 'false');
        musicToggle.setAttribute('aria-expanded', 'true');



        updatePlayPauseButton();
    }

    function closeMusicPlayer() {
        if (!musicPlayer || !musicToggle) return;
        isMusicPlayerOpen = false;
        musicPlayer.classList.remove('open');
        musicPlayer.setAttribute('aria-hidden', 'true');
        musicToggle.setAttribute('aria-expanded', 'false');
    }

    function toggleMusicPlayer() {
        if (isMusicPlayerOpen) {
            closeMusicPlayer();
        } else {
            openMusicPlayer();
        }
    }

    function toggleMusicPlayback() {
        if (!musicAudio) return;
        if (!musicAudio.src) {
            loadMusicTrack(0, true);
            return;
        }
        if (musicAudio.paused) {
            musicAudio.play().catch(() => updatePlayPauseButton());
        } else {
            musicAudio.pause();
        }
        updatePlayPauseButton();
    }

    if (musicToggle) {
        musicToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMusicPlayer();
        });
    }

    if (musicPlayPause) {
        musicPlayPause.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMusicPlayback();
        });
    }

    if (musicPrev) {
        musicPrev.addEventListener('click', function (e) {
            e.stopPropagation();
            loadMusicTrack(musicTrackIndex - 1, true);
        });
    }

    if (musicNext) {
        musicNext.addEventListener('click', function (e) {
            e.stopPropagation();
            loadMusicTrack(musicTrackIndex + 1, true);
        });
    }

    if (musicAudio) {
        musicAudio.addEventListener('ended', function () {
            loadMusicTrack(musicTrackIndex + 1, true);
        });
        musicAudio.addEventListener('play', updatePlayPauseButton);
        musicAudio.addEventListener('pause', updatePlayPauseButton);
    }

    document.addEventListener('click', function (event) {
        if (!isMusicPlayerOpen) return;
        if (!event.target.closest('#music_player') && !event.target.closest('#music_toggle')) {
            closeMusicPlayer();
        }
    });

    // Helper functions for About Me photos
    const predefinedPositions = [
        { left: '2vw', top: '5vh', rot: -8 },
        { left: '18vw', top: '22vh', rot: 12 },
        { left: '4vw', top: '45vh', rot: -5 },
        { left: '22vw', top: '60vh', rot: 15 },
        { left: '8vw', top: '75vh', rot: -10 }
    ];

    function randomizePhotos() {
        const photos = Array.from(document.querySelectorAll('.photo-container'));

        // Make sure all are hidden initially
        photos.forEach(photo => {
            photo.classList.remove('show');
        });

        // Determine random number between 3 and 5
        const numToShow = 5;

        // Shuffle photos and positions
        const shuffledPhotos = [...photos].sort(() => 0.5 - Math.random()).slice(0, numToShow);
        const shuffledPositions = [...predefinedPositions].sort(() => 0.5 - Math.random()).slice(0, numToShow);

        // Small timeout to allow transition resets if needed
        setTimeout(() => {
            shuffledPhotos.forEach((photo, i) => {
                const pos = shuffledPositions[i];
                photo.style.left = pos.left;
                photo.style.top = pos.top;
                photo.style.setProperty('--rot', pos.rot);

                // Stagger spawn
                setTimeout(() => {
                    photo.classList.add('show');
                }, i * 80); // 80ms stagger
            });
        }, 20);
    }

    function hidePhotos() {
        const photos = document.querySelectorAll('.photo-container');
        photos.forEach(photo => {
            photo.classList.remove('show');
        });
    }
});

// crt i guess
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class ScreenEffect {
    constructor(parent, options) {
        this.parent = parent;
        if (typeof parent === "string") {
            this.parent = document.querySelector(parent);
        }

        this.config = Object.assign({}, {}, options)
        this.effects = {};
        this.events = {
            resize: this.onResize.bind(this)
        };

        window.addEventListener("resize", this.events.resize, false);
        this.render();
    }

    render() {
        const container = document.createElement("div");
        container.classList.add("screen-container");

        const wrapper1 = document.createElement("div");
        wrapper1.classList.add("screen-wrapper");

        const wrapper2 = document.createElement("div");
        wrapper2.classList.add("screen-wrapper");

        const wrapper3 = document.createElement("div");
        wrapper3.classList.add("screen-wrapper");

        wrapper1.appendChild(wrapper2);
        wrapper2.appendChild(wrapper3);

        container.appendChild(wrapper1);

        this.parent.parentNode.insertBefore(container, this.parent);
        wrapper3.appendChild(this.parent);

        this.nodes = { container, wrapper1, wrapper2, wrapper3 };
        this.onResize();
    }

    onResize(e) {
        this.rect = this.parent.getBoundingClientRect();
        if (this.effects.vcr && !!this.effects.vcr.enabled) {
            this.generateVCRNoise();
        }
    }

    add(type, options) {
        const config = Object.assign({}, {
            fps: 30,
            blur: 1
        }, options);

        if (Array.isArray(type)) {
            for (const t of type) {
                this.add(t);
            }
            return this;
        }

        const that = this;

        if (type === "snow") {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.classList.add(type);
            canvas.width = this.rect.width / 2;
            canvas.height = this.rect.height / 2;

            this.nodes.wrapper2.appendChild(canvas);

            animate();

            function animate() {
                that.generateSnow(ctx);
                that.snowframe = requestAnimationFrame(animate);
            }

            this.effects[type] = {
                wrapper: this.nodes.wrapper2,
                node: canvas,
                enabled: true,
                config
            };
            return this;
        }

        if (type === "roll") {
            return this.enableRoll();
        }

        if (type === "vcr") {
            const canvas = document.createElement("canvas");
            canvas.classList.add(type);
            this.nodes.wrapper2.appendChild(canvas);

            canvas.width = this.rect.width;
            canvas.height = this.rect.height;

            this.effects[type] = {
                wrapper: this.nodes.wrapper2,
                node: canvas,
                ctx: canvas.getContext("2d"),
                enabled: true,
                config
            };

            this.generateVCRNoise();
            return this;
        }

        let node = false;
        let wrapper = this.nodes.wrapper2;

        switch (type) {
            case "wobblex":
            case "wobbley":
                wrapper.classList.add(type);
                break;
            case "scanlines":
                node = document.createElement("div");
                node.classList.add(type);
                wrapper.appendChild(node);
                break;
            case "vignette":
                wrapper = this.nodes.container;
                node = document.createElement("div");
                node.classList.add(type);
                wrapper.appendChild(node);
                break;
            case "image":
                wrapper = this.parent;
                node = document.createElement('img');
                node.classList.add(type);
                node.src = config.src;
                wrapper.appendChild(node);
                break;
            case "video":
                wrapper = this.parent;
                node = document.createElement('video');
                node.classList.add(type);
                node.src = config.src;
                node.crossOrigin = 'anonymous';
                node.autoplay = true;
                node.muted = true;
                node.loop = true;
                wrapper.appendChild(node);
                break;
        }

        this.effects[type] = {
            wrapper,
            node,
            enabled: true,
            config
        };
        return this;
    }

    remove(type) {
        const obj = this.effects[type];
        if (type in this.effects && !!obj.enabled) {
            obj.enabled = false;

            if (type === "roll" && obj.original) {
                this.parent.appendChild(obj.original);
            }

            if (type === "vcr") {
                clearInterval(this.vcrInterval);
            }

            if (type === "snow") {
                cancelAnimationFrame(this.snowframe);
            }

            if (obj.node) {
                obj.wrapper.removeChild(obj.node);
            } else {
                obj.wrapper.classList.remove(type);
            }
        }
        return this;
    }

    enableRoll() {
        const el = this.parent.firstElementChild;
        if (el) {
            const div = document.createElement("div");
            div.classList.add("roller");
            this.parent.appendChild(div);
            div.appendChild(el);
            div.appendChild(el.cloneNode(true));

            this.effects.roll = {
                enabled: true,
                wrapper: this.parent,
                node: div,
                original: el
            };
        }
    }

    generateVCRNoise() {
        const canvas = this.effects.vcr.node;
        const config = this.effects.vcr.config;
        const div = this.effects.vcr.node;

        if (config.fps >= 60) {
            cancelAnimationFrame(this.vcrInterval);
            const animate = () => {
                this.renderTrackingNoise();
                this.vcrInterval = requestAnimationFrame(animate);
            };
            animate();
        } else {
            clearInterval(this.vcrInterval);
            this.vcrInterval = setInterval(() => {
                this.renderTrackingNoise();
            }, 1000 / config.fps);
        }
    }

    generateSnow(ctx) {
        var w = ctx.canvas.width,
            h = ctx.canvas.height,
            d = ctx.createImageData(w, h),
            b = new Uint32Array(d.data.buffer),
            len = b.length;

        for (var i = 0; i < len; i++) {
            b[i] = ((255 * Math.random()) | 0) << 24;
        }

        ctx.putImageData(d, 0, 0);
    }

    renderTrackingNoise(radius = 2, xmax, ymax) {
        const canvas = this.effects.vcr.node;
        const ctx = this.effects.vcr.ctx;
        const config = this.effects.vcr.config;
        let posy1 = config.miny || 0;
        let posy2 = config.maxy || canvas.height;
        let posy3 = config.miny2 || 0;
        const num = config.num || 20;

        if (xmax === undefined) {
            xmax = canvas.width;
        }
        if (ymax === undefined) {
            ymax = canvas.height;
        }

        canvas.style.filter = `blur(${config.blur}px)`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `#fff`;

        ctx.beginPath();
        for (var i = 0; i <= num; i++) {
            var x = Math.random(i) * xmax;
            var y1 = getRandomInt(posy1 += 3, posy2);
            var y2 = getRandomInt(0, posy3 -= 3);
            ctx.fillRect(x, y1, radius, radius);
            ctx.fillRect(x, y2, radius, radius);
            ctx.fill();

            this.renderTail(ctx, x, y1, radius);
            this.renderTail(ctx, x, y2, radius);
        }
        ctx.closePath();
    }

    renderTail(ctx, x, y, radius) {
        const n = getRandomInt(1, 50);
        const dirs = [1, -1];
        let rd = radius;
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        for (let i = 0; i < n; i++) {
            const step = 0.01;
            let r = getRandomInt((rd -= step), radius);
            let dx = getRandomInt(1, 4);
            radius -= 0.1;
            dx *= dir;
            ctx.fillRect((x += dx), y, r, r);
            ctx.fill();
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const screen = new ScreenEffect("#screen", {});
    setTimeout(() => {
        screen.add("vignette");
        screen.add("scanlines");
        screen.add("vcr", {
            opacity: 1,
            miny: 220,
            miny2: 220,
            num: 70,
            fps: 60
        });
        screen.add("wobbley");
        screen.add("snow", {
            opacity: 0.2
        });
    }, 100);
});