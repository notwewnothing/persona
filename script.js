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

    // ===== Asset Preloader =====
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

    // ===== Opening Sequence =====
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

    // ===== Selection Logic =====
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

    // ===== Submenu Transitions =====
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
                    currentPanel.classList.add('visible');
                }
                if (submenuVideo) {
                    submenuVideo.classList.add('visible');

                }
                setTimeout(() => {
                    submenuBackBtn.classList.add('visible');
                }, 400);
            });
        });
    }

    function closeSubmenu() {
        if (!isSubmenuOpen) return;

        // Hide panel content immediately
        if (currentPanel) {
            currentPanel.classList.remove('visible');
            currentPanel.classList.add('hiding');
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

            if (currentPanel) {
                currentPanel.classList.remove('hiding');
            }


            // Refocus main menu
            selectItem(currentIndex);
        }, 500);
    }

    // ===== Event Listeners =====

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