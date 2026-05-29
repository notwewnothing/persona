const SMALL_SCREEN_MQ = window.matchMedia("(max-width: 1200px)");

function isDesktopViewport() {
    return !SMALL_SCREEN_MQ.matches;
}

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


    const submenuOverlay = document.getElementById('submenu_overlay');
    const submenuBgOverlay = document.getElementById('submenu_bg_overlay');
    const submenuClickBackdrop = document.getElementById('submenu_click_backdrop');
    const submenuVideo = document.getElementById('submenu_video');
    const panels = document.querySelectorAll('.submenu-panel');
    const music = document.getElementById('music-toggle');

    let isSubmenuOpen = false;
    let currentPanel = null;



    const highlightData = {
        m_skill: { transform: 'scale(130%) rotate(-28deg) translate(28px, 10px)', prefix: 'skill', panelId: 'panel_skill' },
        m_item: { transform: 'scale(130%) rotate(-14deg) translate(36px, 6px)', prefix: 'item', panelId: 'panel_item' },
        m_equip: { transform: 'scale(130%) rotate(-20deg) translate(32px, 8px)', prefix: 'equip', panelId: 'panel_equip' },
        m_persona: { transform: 'scale(130%) rotate(-18deg) translate(24px, 2px)', prefix: 'persona', panelId: 'panel_persona' },
        m_stats: { transform: 'scale(130%) translate(40px, -4px)', prefix: 'stats', panelId: 'panel_stats' },
        m_quest: { transform: 'scale(130%) rotate(-12deg) translate(36px, 4px)', prefix: 'quest', panelId: 'panel_quest' },
        m_socialLink: { transform: 'scale(130%) rotate(-6deg) translate(28px, -2px)', prefix: 'socialLink', panelId: 'panel_socialLink_bars' },
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


        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => promises.push(waitForImage(img)));

        // Wait for fonts
        if (document.fonts && document.fonts.ready) {
            promises.push(document.fonts.ready);
        }

        return Promise.all(promises);
    }

    let desktopExperienceStarted = false;

    function hideLoadingScreen() {
        const loader = document.getElementById('loading_screen');
        if (loader) {
            loader.classList.add('hidden');
        }
    }

    function applyDesktopReadyState(animateMenu) {
        hideLoadingScreen();

        document.body.classList.add('loaded', 'desktop-ready');

        menuItems.forEach((item) => item.classList.remove('spawned'));
        void document.body.offsetWidth;

        if (animateMenu) {
            setTimeout(() => {
                const reversedItems = Array.from(menuItems).reverse();
                reversedItems.forEach((item, index) => {
                    setTimeout(() => item.classList.add('spawned'), index * 100);
                });
            }, 100);
            setTimeout(() => selectItem(0), 1200);
        } else {
            menuItems.forEach((item) => item.classList.add('spawned'));
            selectItem(0);
        }

        if (bgVideo) {
            bgVideo.play().catch(() => { });
        }

        window.dispatchEvent(new Event('resize'));
    }

    function deactivateForSmallScreen() {
        document.body.classList.remove('loaded', 'desktop-ready');
        document.querySelectorAll('video, audio').forEach((media) => media.pause());

        if (isSubmenuOpen) {
            closeSubmenu();
        }
        if (isMusicPlayerOpen) {
            closeMusicPlayer();
        }
    }

    function activateDesktopExperience(animateMenu) {
        if (!isDesktopViewport()) return;

        if (desktopExperienceStarted) {
            applyDesktopReadyState(animateMenu);
            return;
        }

        desktopExperienceStarted = true;
        preloadAllAssets().then(() => applyDesktopReadyState(animateMenu));
    }

    function handleViewportChange() {
        if (SMALL_SCREEN_MQ.matches) {
            deactivateForSmallScreen();
        } else {
            activateDesktopExperience(false);
        }
    }

    SMALL_SCREEN_MQ.addEventListener('change', handleViewportChange);

    if (isDesktopViewport()) {
        activateDesktopExperience(true);
    } else {
        preloadAllAssets().then(hideLoadingScreen);
    }

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


        document.querySelectorAll('.highlight-wrapper').forEach(wrapper => {
            wrapper.classList.remove('active');
            wrapper.style.opacity = '0';
        });

        // Hide all decoration elements
        document.querySelectorAll('[id^="t_"]').forEach(el => {
            el.style.opacity = '0';
        });


        const data = highlightData[itemSpan.id];
        if (data) {
            itemSpan.style.transform = data.transform;
            itemSpan.style.zIndex = '1';
            itemSpan.style.color = 'black';

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

    const HERO_BAR_PANEL_IDS = new Set(['panel_item', 'panel_socialLink_bars']);
    const SOCIALS_TRANSITION_PANEL_IDS = new Set([
        'panel_item',
        'panel_socialLink_bars',
        'panel_calendar',
    ]);
    const PROSE_PANEL_IDS = new Set(['panel_skill', 'panel_persona', 'panel_system']);

    function isHeroBarsPanel(panel) {
        return panel && HERO_BAR_PANEL_IDS.has(panel.id);
    }

    function getTransitionVariant(panel) {
        if (panel && SOCIALS_TRANSITION_PANEL_IDS.has(panel.id)) return 'socials';
        if (panel && PROSE_PANEL_IDS.has(panel.id)) return 'default';
        return 'default';
    }

    function getSubmenuChrome(panel) {
        if (!panel) {
            return { overlay: false, menuShift: false, photos: false };
        }
        if (HERO_BAR_PANEL_IDS.has(panel.id)) {
            return { overlay: true, menuShift: true, photos: false };
        }
        if (panel.id === 'panel_calendar') {
            return { overlay: true, menuShift: false, photos: false };
        }
        if (PROSE_PANEL_IDS.has(panel.id)) {
            return { overlay: true, menuShift: false, photos: true };
        }
        return { overlay: false, menuShift: false, photos: false };
    }

    function applySubmenuChrome(chrome) {
        const { overlay, menuShift, photos } = chrome;

        if (container) {
            container.classList.toggle('menu-shifted', !!menuShift);
        }
        if (submenuBgOverlay) {
            submenuBgOverlay.classList.toggle('visible', !!overlay);
        }
        if (submenuVideo) {
            if (overlay) {
                submenuVideo.classList.add('visible');
                submenuVideo.play().catch(() => { });
            } else {
                submenuVideo.classList.remove('visible');
                setTimeout(() => submenuVideo.pause(), 500);
            }
        }

        const photosWrapper = document.getElementById('about_me_photos');
        if (photosWrapper) {
            if (photos) {
                photosWrapper.classList.add('visible');
                document.body.classList.add('submenu-photos-active');
                randomizePhotos();
            } else {
                photosWrapper.classList.remove('visible');
                document.body.classList.remove('submenu-photos-active');
                hidePhotos();
            }
        }
    }

    function syncSubmenuChrome() {
        applySubmenuChrome(getSubmenuChrome(currentPanel));
    }

    function openSubmenu() {
        if (isSubmenuOpen) return;
        isSubmenuOpen = true;

        const data = highlightData[itemSpans[currentIndex].id];
        currentPanel = document.getElementById(data.panelId);
        const variant = getTransitionVariant(currentPanel);

        document.body.classList.add('submenu-open');
        submenuOverlay.classList.add('active');

        const panel = document.createElement('div');
        panel.className = `transition-panel ${variant}-panel`;
        panel.style.zIndex = '9999';
        document.body.appendChild(panel);

        setTimeout(() => {
            applySubmenuChrome(getSubmenuChrome(currentPanel));

            if (currentPanel) {
                currentPanel.classList.remove('hiding');
                currentPanel.classList.add('visible');
            }

            if (isHeroBarsPanel(currentPanel)) initSocialsPanel(currentPanel);
            else if (data.prefix === 'calendar') initResumePanel();

        }, 280);

        setTimeout(() => {
            if (panel.parentNode) panel.parentNode.removeChild(panel);
        }, 800);
    }

    function closeSubmenu() {
        if (!isSubmenuOpen) return;

        const panelToHide = currentPanel;

        if (panelToHide) {
            panelToHide.classList.remove('visible');
            panelToHide.classList.add('hiding');
        }

        applySubmenuChrome({ overlay: false, menuShift: false, photos: false });

        cleanupSocialsPanel();
        cleanupResumePanel();

        setTimeout(() => {
            isSubmenuOpen = false;
            submenuOverlay.classList.remove('active');
            document.body.classList.remove('submenu-open', 'submenu-photos-active');

            if (panelToHide) {
                panelToHide.classList.remove('hiding');
            }

            selectItem(currentIndex);
        }, 400);
    }



    // Keyboard navigation
    document.addEventListener("keydown", function (event) {
        if (isSubmenuOpen) {
            // Handle custom panel keys
            if (isHeroBarsPanel(currentPanel)) {
                if (handleSocialsKey(event)) return;
            }
            if (currentPanel && currentPanel.id === 'panel_calendar') {
                if (handleResumeKey(event)) return;
            }

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

                    // Cleanup old custom panels
                    cleanupSocialsPanel();
                    cleanupResumePanel();

                    selectItem(index, true);

                    const data = highlightData[itemSpans[currentIndex].id];
                    currentPanel = document.getElementById(data.panelId);

                    syncSubmenuChrome();

                    if (currentPanel) {
                        currentPanel.classList.remove('hiding');
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                currentPanel.classList.add('visible');

                                if (isHeroBarsPanel(currentPanel)) initSocialsPanel(currentPanel);
                                else if (data.prefix === "calendar") initResumePanel();
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


    if (submenuClickBackdrop) {
        submenuClickBackdrop.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isSubmenuOpen) closeSubmenu();
        });
    }

    if (submenuBgOverlay) {
        submenuBgOverlay.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isSubmenuOpen) closeSubmenu();
        });
    }


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

    // --- Socials Panel Logic (ITEMS + SOCIAL LINK — independent instances) ---
    let scActiveIndex = 0;
    let scPanelEl = null;
    let scBars = [];
    let scBarHandlers = [];

    function initSocialsPanel(panelEl) {
        cleanupSocialsPanel();
        scPanelEl = panelEl || document.getElementById('panel_item');
        if (!scPanelEl) return;

        scActiveIndex = 0;
        scBars = Array.from(scPanelEl.querySelectorAll('.sc-bar-outer'));

        scBars.forEach((bar, i) => {
            bar.classList.add('sc-mounted');
            const onEnter = () => {
                scActiveIndex = i;
                updateSocialsSelection();
            };
            const onClick = () => openSocialsLink();
            bar.addEventListener('mouseenter', onEnter);
            bar.addEventListener('click', onClick);
            scBarHandlers.push({ bar, onEnter, onClick });
        });

        const scFooter = scPanelEl.querySelector('.sc-footer');
        if (scFooter) scFooter.classList.add('sc-mounted');

        const scRightNav = scPanelEl.querySelector('.sc-right-nav');
        if (scRightNav) {
            scRightNav.style.display = 'flex';
            setTimeout(() => { scRightNav.style.opacity = '1'; }, 100);
        }

        updateSocialsSelection();
    }

    function cleanupSocialsPanel() {
        scBarHandlers.forEach(({ bar, onEnter, onClick }) => {
            bar.removeEventListener('mouseenter', onEnter);
            bar.removeEventListener('click', onClick);
            bar.classList.remove('sc-mounted');
            bar.classList.remove('active');
        });
        scBarHandlers = [];

        if (scPanelEl) {
            const scFooter = scPanelEl.querySelector('.sc-footer');
            if (scFooter) scFooter.classList.remove('sc-mounted');

            const scRightNav = scPanelEl.querySelector('.sc-right-nav');
            if (scRightNav) {
                scRightNav.style.opacity = '0';
                setTimeout(() => { scRightNav.style.display = 'none'; }, 400);
            }
        }

        scBars = [];
        scPanelEl = null;
    }

    function updateSocialsSelection() {
        scBars.forEach((bar, i) => {
            if (i === scActiveIndex) bar.classList.add('active');
            else bar.classList.remove('active');
        });
        const labels = ['ITEM 1', 'ITEM 2', 'ITEM 3'];
        const labelEl = scPanelEl ? scPanelEl.querySelector('.sc-nav-label') : null;
        if (labelEl) labelEl.textContent = labels[scActiveIndex] || labels[0];
    }

    function openSocialsLink() {
        const links = [
            null, // Discord doesn't have a direct web link
            'https://www.instagram.com/poldak._/',
            'https://hackclub.enterprise.slack.com/team/U0AJAB37BUK'
        ];
        const link = links[scActiveIndex];
        if (link) window.open(link, '_blank');
    }

    function handleSocialsKey(event) {
        if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
            scActiveIndex = (scActiveIndex + 1) % scBars.length;
            updateSocialsSelection();
            return true;
        }
        if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
            scActiveIndex = (scActiveIndex - 1 + scBars.length) % scBars.length;
            updateSocialsSelection();
            return true;
        }
        if (event.key === "Enter" || event.key === " " || event.key === "b" || event.key === "B") {
            openSocialsLink();
            return true;
        }
        return false;
    }


    // --- Resume Panel Logic ---
    let rsActiveIndex = 0;
    const rsCards = document.querySelectorAll('.resume-card-wrap');

    function initResumePanel() {
        rsActiveIndex = 0;
        updateResumeSelection();

        const listTag = document.getElementById('rs_list_tag');
        if (listTag) listTag.classList.add('rs-mounted');

        rsCards.forEach((card, i) => {
            card.classList.add('rs-mounted');
            card.addEventListener('mouseenter', () => {
                rsActiveIndex = i;
                updateResumeSelection();
            });
            card.addEventListener('click', () => {
                openResumeLink();
            });
        });

        const detailPanel = document.getElementById('rs_detail_panel');
        if (detailPanel) {
            setTimeout(() => { detailPanel.style.opacity = '1'; }, 200);
        }
    }

    function cleanupResumePanel() {
        rsCards.forEach(card => {
            card.classList.remove('rs-mounted');
            card.classList.remove('active');
        });
        const listTag = document.getElementById('rs_list_tag');
        if (listTag) listTag.classList.remove('rs-mounted');

        const detailPanel = document.getElementById('rs_detail_panel');
        if (detailPanel) detailPanel.style.opacity = '0';
    }

    function updateResumeSelection() {
        rsCards.forEach((card, i) => {
            if (i === rsActiveIndex) card.classList.add('active');
            else card.classList.remove('active');
        });

        // Update details panel
        const titles = ['AUDIOPHILE', 'MACROPAD', 'PERSONA UI', 'NOTHING TO SEE HERE 🤨'];
        const subtexts = [
            "- It's not maintained tho",
            "- My project for flavortown",
            "- Built with plain HTML/CSS/JS",
            "- Ngl I added this cuz 3 items looked boring"
        ];
        const links = [
            'https://github.com/notwewnothing/SpotiFLac/releases/tag/v1.1.0',
            'https://github.com/notwewnothing/workspace-commander',
            'https://github.com/notwewnothing/persona',
            null
        ];

        document.getElementById('rs_detail_index').textContent = '0' + (rsActiveIndex + 1);
        document.getElementById('rs_detail_title').textContent = titles[rsActiveIndex];
        document.getElementById('rs_detail_progress').textContent = (rsActiveIndex + 1) + '/4';

        const bulletsContainer = document.getElementById('rs_detail_bullets');
        if (bulletsContainer) {
            let html = `<div class="resume-detail-bullet">${subtexts[rsActiveIndex]}</div>`;
            if (links[rsActiveIndex]) {
                html += `<div class="resume-detail-bullet"><a href="${links[rsActiveIndex]}" target="_blank">View on GitHub</a></div>`;
            }
            bulletsContainer.innerHTML = html;
        }
    }

    function openResumeLink() {
        const links = [
            'https://github.com/notwewnothing/SpotiFLac/releases/tag/v1.1.0',
            'https://github.com/notwewnothing/workspace-commander',
            'https://github.com/notwewnothing/persona',
            null
        ];
        const link = links[rsActiveIndex];
        if (link) window.open(link, '_blank');
    }

    function handleResumeKey(event) {
        if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
            rsActiveIndex = (rsActiveIndex + 1) % rsCards.length;
            updateResumeSelection();
            return true;
        }
        if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
            rsActiveIndex = (rsActiveIndex - 1 + rsCards.length) % rsCards.length;
            updateResumeSelection();
            return true;
        }
        if (event.key === "Enter" || event.key === " " || event.key === "b" || event.key === "B") {
            openResumeLink();
            return true;
        }
        return false;
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

