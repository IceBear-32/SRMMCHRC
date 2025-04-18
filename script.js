// Sample songs data
const songs = [
    {
        id: 1,
        title: "KURAI ONDRUM ILLAI",
        artist: "Deccaan Music",
        album: "Therapy Sessions Vol. 1",
        duration: 242,
        cover: "a.png",
        src: "a.mp3"
    },
    {
        id: 2,
        title: "ADITYA HRIDAYAM",
        artist: "Deccaan Music",
        album: "Therapy Sessions Vol. 1",
        duration: 569,
        cover: "a.png",
        src: "b.mp3"
    },
    {
        id: 3,
        title: "RELAXING FLUTE",
        artist: "Deccaan Music",
        album: "Therapy Sessions Vol. 2",
        duration: 366,
        cover: "a.png",
        src: "c.mp3"
    }
];

// Default scheduled songs (fixed schedule)
let scheduledSongs = [
    {
        songId: 1,
        date: 'daily',
        time: "17:45:00", // Exact time with seconds for precision
        played: false,
        fixed: true,
        loop: false
    },
    {
        songId: 2,
        date: 'daily',
        time: "after:1:10", // 10 seconds after the first song ends
        played: false,
        fixed: true,
        loop: false
    }
];

// App state
let currentSongIndex = -1;
let isPlaying = false;
let totalSongsPlayed = 0;
let totalDurationPlayed = 0;
let equalizerInterval;
let isLooping = false;
let loopEndTime = null;
let username = '';
let password = '';
let volume = 1;
let isMuted = false;
let currentAction = null;
let currentActionData = null;
let secondSongPlayed = false; // Track if second song has played

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeUser = document.getElementById('welcomeUser');
const currentTimeEl = document.getElementById('currentTime');
const currentDateEl = document.getElementById('currentDate');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const loopBtn = document.getElementById('loopBtn');
const muteBtn = document.getElementById('muteBtn');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const currentTimeDisplay = document.getElementById('currentTimeDisplay');
const totalTimeDisplay = document.getElementById('totalTimeDisplay');
const currentSongTitle = document.getElementById('currentSongTitle');
const currentSongArtist = document.getElementById('currentSongArtist');
const currentSongAlbum = document.getElementById('currentSongAlbum');
const currentSongCover = document.getElementById('currentSongCover');
const songList = document.getElementById('songList');
const scheduledList = document.getElementById('scheduledList');
const schedulerForm = document.getElementById('schedulerForm');
const scheduleSong = document.getElementById('scheduleSong');
const scheduleDate = document.getElementById('scheduleDate');
const scheduleTime = document.getElementById('scheduleTime');
const loopSchedule = document.getElementById('loopSchedule');
const endTimeGroup = document.getElementById('endTimeGroup');
const scheduleEndTime = document.getElementById('scheduleEndTime');
const totalSongsEl = document.getElementById('totalSongs');
const totalPlayedEl = document.getElementById('totalPlayed');
const totalDurationEl = document.getElementById('totalDuration');
const scheduledCountEl = document.getElementById('scheduledCount');
const nextScheduleTimeEl = document.getElementById('nextScheduleTime');
const equalizer = document.getElementById('equalizer');
const schedulerAlert = document.getElementById('schedulerAlert');
const volumeSlider = document.getElementById('volumeSlider');
const volumeLevel = document.getElementById('volumeLevel');
const authModal = document.getElementById('authModal');
const authModalClose = document.getElementById('authModalClose');
const authPassword = document.getElementById('authPassword');
const authSubmit = document.getElementById('authSubmit');
const authError = document.getElementById('authError');
const loginLogo = document.getElementById('loginLogo');
const headerLogo = document.getElementById('headerLogo');
const favicon = document.getElementById('favicon');
const downloadScheduleBtn = document.getElementById('downloadScheduleBtn');

// Initialize the app
function init() {
    // Load saved schedules from local storage
    loadSchedules();

    // Create equalizer bars
    createEqualizer();

    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Populate song list
    populateSongList();

    // Populate song select in scheduler
    populateSongSelect();

    // Render scheduled songs
    renderScheduledSongs();

    // Update stats
    updateStats();

    // Check for scheduled songs every second
    setInterval(checkScheduledSongs, 1000);

    // Set up audio player event listeners
    setupAudioPlayer();

    // Initialize date picker
    initDatePicker();

    // Set up loop checkbox
    loopSchedule.addEventListener('change', function () {
        endTimeGroup.classList.toggle('hidden', !this.checked);
    });

    // Set up authentication modal
    setupAuthModal();

    // Set audio volume
    audioPlayer.volume = volume;

    // Set up download button
    downloadScheduleBtn.addEventListener('click', generateSchedulePDF);
}

// Initialize date picker
function initDatePicker() {
    flatpickr(scheduleDate, {
        dateFormat: "Y-m-d",
        minDate: "today",
        defaultDate: "today"
    });
}

// Set up authentication modal
function setupAuthModal() {
    authModalClose.addEventListener('click', function () {
        closeAuthModal();
    });

    authSubmit.addEventListener('click', function () {
        const enteredPassword = authPassword.value;

        if (enteredPassword === password) {
            authError.style.display = 'none';
            closeAuthModal();

            // Execute the pending action
            if (currentAction === 'add-schedule') {
                addSchedule(currentActionData);
            } else if (currentAction === 'delete-schedule') {
                deleteSchedule(currentActionData);
            }

            // Reset current action
            currentAction = null;
            currentActionData = null;
        } else {
            authError.style.display = 'block';
        }
    });
}

// Open authentication modal
function openAuthModal(action, data) {
    currentAction = action;
    currentActionData = data;
    authPassword.value = '';
    authError.style.display = 'none';
    authModal.classList.add('show');
    authPassword.focus();
}

// Close authentication modal
function closeAuthModal() {
    authModal.classList.remove('show');
}

// Login functionality
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    username = document.getElementById('username').value;
    password = document.getElementById('password').value;

    // Hardcoded credentials for testing - in a real app, this would be server-side
    if (username === 'TSRMMCHRC2025' && password === 'TSRM62110') {
        loginContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        welcomeUser.textContent = `Welcome, ${username}`;
        console.log("Login successful!");
    } else {
        loginError.style.display = 'block';
        console.log("Login failed. Username: " + username + ", Password: " + password);
        setTimeout(() => {
            loginError.style.display = 'none';
        }, 3000);
    }
});

// Logout functionality
logoutBtn.addEventListener('click', function () {
    loginContainer.style.display = 'flex';
    appContainer.style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    pauseSong();
});

// Update date and time
function updateDateTime() {
    const now = new Date();

    // Format time: HH:MM:SS
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    currentTimeEl.textContent = `${hours}:${minutes}:${seconds}`;

    // Format date: Day, Month Date, Year
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);

    // Check for scheduled songs
    checkScheduledSongs();
}

// Create equalizer
function createEqualizer() {
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'equalizer-bar';
        bar.style.height = '5px';
        equalizer.appendChild(bar);
    }
}

// Animate equalizer
function animateEqualizer(active) {
    const bars = document.querySelectorAll('.equalizer-bar');

    if (active) {
        if (!equalizerInterval) {
            equalizerInterval = setInterval(() => {
                bars.forEach(bar => {
                    const height = Math.floor(Math.random() * 50) + 5;
                    bar.style.height = `${height}px`;
                });
            }, 100);
        }
    } else {
        if (equalizerInterval) {
            clearInterval(equalizerInterval);
            equalizerInterval = null;
            bars.forEach(bar => {
                bar.style.height = '5px';
            });
        }
    }
}

// Populate song list
function populateSongList() {
    songList.innerHTML = '';
    songs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.innerHTML = `
                    <div class="song-number">${index + 1}</div>
                    <div class="song-title">
                        <strong>${song.title}</strong>
                        <div>${song.artist} - ${song.album}</div>
                    </div>
                    <div class="song-duration">${formatTime(song.duration)}</div>
                    <div class="song-actions">
                        <button class="play-song" data-index="${index}" title="Play"><i class="fas fa-play"></i></button>
                        <button class="schedule-song" data-id="${song.id}" title="Schedule"><i class="fas fa-clock"></i></button>
                    </div>
                `;
        songList.appendChild(songItem);
    });

    // Add event listeners to play buttons
    document.querySelectorAll('.play-song').forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            playSong(index);
        });
    });

    // Add event listeners to schedule buttons
    document.querySelectorAll('.schedule-song').forEach(button => {
        button.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            scheduleTime.focus();
            scheduleSong.value = id;
        });
    });
}

// Populate song select in scheduler
function populateSongSelect() {
    scheduleSong.innerHTML = '<option value="">Select a song</option>';
    songs.forEach(song => {
        const option = document.createElement('option');
        option.value = song.id;
        option.textContent = `${song.title} - ${formatTime(song.duration)}`;
        scheduleSong.appendChild(option);
    });
}

// Render scheduled songs
function renderScheduledSongs() {
    scheduledList.innerHTML = '';

    // Sort scheduled songs by date and time
    const sortedSchedules = [...scheduledSongs].sort((a, b) => {
        if (a.date === 'daily' && b.date !== 'daily') return -1;
        if (a.date !== 'daily' && b.date === 'daily') return 1;
        if (a.date === b.date) {
            return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
    });

    sortedSchedules.forEach((schedule, index) => {
        const song = songs.find(s => s.id === schedule.songId);
        if (song) {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = schedule.fixed ? 'schedule-item fixed-schedule' : 'schedule-item';

            let timeDisplay = formatScheduleTime(schedule.time);
            if (schedule.time.startsWith('after:')) {
                const [_, songIndex, seconds] = schedule.time.match(/after:(\d+):(\d+)/);
                const prevSong = songs.find(s => s.id === parseInt(songIndex));
                timeDisplay = `After ${prevSong ? prevSong.title : 'previous song'} (${seconds}s)`;
            }

            let dateDisplay = schedule.date === 'daily' ? 'Daily' : formatDate(schedule.date);

            scheduleItem.innerHTML = `
                        <div class="schedule-time">${timeDisplay.substring(0, 2)}</div>
                        <div class="schedule-song">
                            <strong>${song.title}</strong>
                            <div>${dateDisplay} at ${timeDisplay}</div>
                            ${schedule.loop ? '<div><i class="fas fa-redo"></i> Loop until ' + schedule.endTime + '</div>' : ''}
                        </div>
                        <div class="schedule-duration">${formatTime(song.duration)}</div>
                        <div class="schedule-actions">
                            ${!schedule.fixed ? `<button class="delete-schedule" data-index="${index}" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
                        </div>
                    `;
            scheduledList.appendChild(scheduleItem);
        }
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-schedule').forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            openAuthModal('delete-schedule', index);
        });
    });

    updateNextSchedule();
    updateStats();
    saveSchedules();
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Delete schedule
function deleteSchedule(index) {
    const schedule = scheduledSongs[index];
    if (schedule && !schedule.fixed) {
        scheduledSongs.splice(index, 1);
        renderScheduledSongs();
        showAlert('Schedule deleted successfully!', 'success');
    } else {
        showAlert('Cannot delete fixed schedule!', 'danger');
    }
}

// Format schedule time for display
function formatScheduleTime(time) {
    // If time includes seconds (HH:MM:SS), convert to HH:MM format for display
    if (time.startsWith('after:')) {
        return time;
    }

    if (time.split(':').length === 3) {
        return time.split(':').slice(0, 2).join(':');
    }
    return time;
}

// Add new schedule
schedulerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const scheduleData = {
        songId: parseInt(scheduleSong.value),
        date: scheduleDate.value || 'daily',
        time: scheduleTime.value,
        played: false,
        fixed: false,
        loop: loopSchedule.checked
    };

    if (loopSchedule.checked) {
        scheduleData.endTime = scheduleEndTime.value;
    }

    if (!scheduleData.songId || !scheduleData.time) {
        showAlert('Please select a song and time', 'danger');
        return;
    }

    openAuthModal('add-schedule', scheduleData);
});

// Add schedule after authentication
function addSchedule(scheduleData) {
    scheduledSongs.push(scheduleData);
    renderScheduledSongs();
    schedulerForm.reset();
    endTimeGroup.classList.add('hidden');
    showAlert('Song scheduled successfully!', 'success');
}

// Show alert
function showAlert(message, type) {
    schedulerAlert.textContent = message;
    schedulerAlert.className = `alert alert-${type}`;

    setTimeout(() => {
        schedulerAlert.className = 'alert hidden';
    }, 3000);
}

// Check for scheduled songs
function checkScheduledSongs() {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentSeconds = now.getSeconds().toString().padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}:${currentSeconds}`;
    const currentTimeMinStr = `${currentHours}:${currentMinutes}`;

    // Check for songs that should play now
    scheduledSongs.forEach(schedule => {
        // Skip if already played today
        if (schedule.played && schedule.date !== 'daily') return;

        // Check if date matches (either 'daily' or today's date)
        if (schedule.date === 'daily' || schedule.date === currentDate) {
            // Handle regular time schedules
            if (!schedule.time.startsWith('after:')) {
                let scheduleTime = schedule.time;

                // If time doesn't include seconds, add :00 for seconds
                if (scheduleTime.split(':').length === 2) {
                    scheduleTime = `${scheduleTime}:00`;
                }

                if (currentTimeStr === scheduleTime && !schedule.played) {
                    const song = songs.find(s => s.id === schedule.songId);
                    if (song) {
                        const index = songs.indexOf(song);
                        playSong(index, schedule.loop, schedule.endTime);

                        // Mark as played (only for today if it's a daily schedule)
                        if (schedule.date === 'daily') {
                            schedule.played = true;

                            // Reset played status at midnight for daily schedules
                            const midnight = new Date();
                            midnight.setHours(24, 0, 0, 0);
                            const timeUntilMidnight = midnight - now;

                            setTimeout(() => {
                                schedule.played = false;
                            }, timeUntilMidnight);
                        } else {
                            schedule.played = true;
                        }
                    }
                }
            }
        }
    });

    // Check for "after:" schedules if a song just ended
    if (audioPlayer.ended) {
        scheduledSongs.forEach(schedule => {
            if (schedule.time.startsWith('after:')) {
                const [_, prevSongId, seconds] = schedule.time.match(/after:(\d+):(\d+)/);

                if (currentSongIndex >= 0 && songs[currentSongIndex].id === parseInt(prevSongId)) {
                    // Schedule to play after specified seconds
                    setTimeout(() => {
                        const song = songs.find(s => s.id === schedule.songId);

                        if (song && !schedule.played) {
                            const index = songs.indexOf(song);
                            playSong(index, schedule.loop, schedule.endTime);

                            if (schedule.date === 'daily') {
                                schedule.played = true;
    
                                // Reset played status at midnight for daily schedules
                                const midnight = new Date();
                                midnight.setHours(24, 0, 0, 0);
                                const timeUntilMidnight = midnight - now;
    
                                setTimeout(() => {
                                    schedule.played = false;
                                }, timeUntilMidnight);
                            } else schedule.played = true;

                            // Mark this as the second song played
                            if (parseInt(prevSongId) === 1 && schedule.songId === 2) {
                                secondSongPlayed = true;
                            }
                        }
                    }, parseInt(seconds) * 1000);
                }
            }
        });
    }

    updateNextSchedule();
}

// Update next schedule display
function updateNextSchedule() {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHours * 60 + currentMinutes;

    // Find the next unplayed schedule
    const unplayedSchedules = scheduledSongs.filter(s =>
        !s.played && (s.date === 'daily' || s.date === currentDate || new Date(s.date) >= now)
    );

    if (unplayedSchedules.length === 0) {
        nextScheduleTimeEl.textContent = 'No upcoming schedule';
        nextScheduleTimeEl.classList.remove('pulse-animation');
        return;
    }

    // Sort by date and time
    unplayedSchedules.sort((a, b) => {
        if (a.date === 'daily' && b.date !== 'daily') return -1;
        if (a.date !== 'daily' && b.date === 'daily') return 1;
        if (a.date !== b.date) {
            return new Date(a.date) - new Date(b.date);
        }

        // Handle "after:" schedules
        if (a.time.startsWith('after:') && !b.time.startsWith('after:')) return 1;
        if (!a.time.startsWith('after:') && b.time.startsWith('after:')) return -1;

        if (!a.time.startsWith('after:') && !b.time.startsWith('after:')) {
            const timeA = a.time.split(':');
            const timeB = b.time.split(':');
            const minutesA = parseInt(timeA[0]) * 60 + parseInt(timeA[1]);
            const minutesB = parseInt(timeB[0]) * 60 + parseInt(timeB[1]);
            return minutesA - minutesB;
        }

        return 0;
    });

    // Find the next schedule
    let nextSchedule = unplayedSchedules[0];

    if (nextSchedule.time.startsWith('after:')) {
        const [_, prevSongId, seconds] = nextSchedule.time.match(/after:(\d+):(\d+)/);
        const prevSong = songs.find(s => s.id === parseInt(prevSongId));

        if (currentSongIndex >= 0 && songs[currentSongIndex].id === parseInt(prevSongId)) {
            nextScheduleTimeEl.textContent = `Next in ${seconds}s (after current song)`;
            nextScheduleTimeEl.classList.add('pulse-animation');
        } else {
            nextScheduleTimeEl.textContent = `After ${prevSong ? prevSong.title : 'song ' + prevSongId}`;
            nextScheduleTimeEl.classList.remove('pulse-animation');
        }

        return;
    }

    const nextTime = nextSchedule.time.split(':');
    const nextMinutes = parseInt(nextTime[0]) * 60 + parseInt(nextTime[1]);

    // Calculate time difference
    let diff = nextMinutes - currentTime;
    if (diff < 0 && nextSchedule.date === 'daily') {
        diff += 24 * 60; // Add a day if the schedule is for tomorrow
    }

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    let displayText = '';

    if (nextSchedule.date !== 'daily' && nextSchedule.date !== currentDate) {
        displayText = `${formatDate(nextSchedule.date)} at ${formatScheduleTime(nextSchedule.time)}`;
    } else if (hours === 0 && minutes === 0) {
        displayText = 'Playing now!';
        nextScheduleTimeEl.classList.add('pulse-animation');
    } else {
        displayText = `Next in ${hours > 0 ? hours + 'h ' : ''}${minutes}m`;
        nextScheduleTimeEl.classList.remove('pulse-animation');
    }

    nextScheduleTimeEl.textContent = displayText;
}

// Update stats
function updateStats() {
    totalSongsEl.textContent = songs.length;
    totalPlayedEl.textContent = totalSongsPlayed;
    totalDurationEl.textContent = formatTime(totalDurationPlayed);
    scheduledCountEl.textContent = scheduledSongs.filter(s => !s.played || s.date !== 'daily').length;
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Set up audio player
function setupAudioPlayer() {
    // Play/Pause button
    playPauseBtn.addEventListener('click', function () {
        if (isPlaying) {
            pauseSong();
        } else {
            if (currentSongIndex === -1 && songs.length > 0) {
                playSong(0);
            } else {
                resumeSong();
            }
        }
    });

    // Previous button
    prevBtn.addEventListener('click', function () {
        if (currentSongIndex > 0) {
            playSong(currentSongIndex - 1);
        }
    });

    // Next button
    nextBtn.addEventListener('click', function () {
        if (currentSongIndex < songs.length - 1) {
            playSong(currentSongIndex + 1);
        }
    });

    // Loop button
    loopBtn.addEventListener('click', function () {
        isLooping = !isLooping;
        audioPlayer.loop = isLooping;
        loopBtn.innerHTML = isLooping ? '<i class="fas fa-redo text-primary"></i>' : '<i class="fas fa-redo"></i>';
    });

    // Mute button
    muteBtn.addEventListener('click', function () {
        toggleMute();
    });

    // Volume slider
    volumeSlider.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / this.offsetWidth;
        setVolume(percent);
    });

    // Progress bar
    progressBar.addEventListener('click', function (e) {
        const percent = e.offsetX / this.offsetWidth;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    });

    // Update progress
    audioPlayer.addEventListener('timeupdate', function () {
        if (audioPlayer.duration) {
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progress.style.width = `${percent}%`;
            currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);

            // Check for loop end time
            if (loopEndTime) {
                const now = new Date();
                const currentHours = now.getHours().toString().padStart(2, '0');
                const currentMinutes = now.getMinutes().toString().padStart(2, '0');
                const currentSeconds = now.getSeconds().toString().padStart(2, '0');
                const currentTimeStr = `${currentHours}:${currentMinutes}:${currentSeconds}`;

                const loopET = loopEndTime.split(':') === 3 ? loopEndTime : `${loopEndTime}:00`;

                if (currentTimeStr === loopET) {
                    pauseSong();
                    isLooping = false;
                    audioPlayer.loop = false;
                    loopBtn.innerHTML = '<i class="fas fa-redo"></i>';
                    loopEndTime = null;
                }
            }
        }
    });

    // Song ended
    audioPlayer.addEventListener('ended', function () {
        if (!isLooping) {
            // If this is the second song and it just ended, don't auto-play the next song
            if (secondSongPlayed && currentSongIndex === 1) {
                pauseSong();
                audioPlayer.currentTime = 0;
                progress.style.width = '0%';
                currentTimeDisplay.textContent = '0:00';
                secondSongPlayed = false; // Reset for next day
            } else if (currentSongIndex < songs.length - 1) {
                const nidx = currentSongIndex + 1;
                const ss = scheduledSongs.find(s => s.songId == songs[nidx].id);
                if (!ss.time.startsWith('after')) {
                    playSong(nidx);
                }
                else pauseSong();
            } else {
                pauseSong();
                audioPlayer.currentTime = 0;
                progress.style.width = '0%';
                currentTimeDisplay.textContent = '0:00';
            }
        }
    });

    // Song loaded
    audioPlayer.addEventListener('loadedmetadata', function () {
        totalTimeDisplay.textContent = formatTime(audioPlayer.duration);

        // Update song duration in the songs array
        if (currentSongIndex >= 0) {
            songs[currentSongIndex].duration = audioPlayer.duration;
        }
    });
}

// Toggle mute
function toggleMute() {
    isMuted = !isMuted;
    audioPlayer.muted = isMuted;
    muteBtn.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
}

// Set volume
function setVolume(value) {
    volume = Math.max(0, Math.min(1, value));
    audioPlayer.volume = volume;
    volumeLevel.style.width = `${volume * 100}%`;

    if (volume === 0) {
        isMuted = true;
        audioPlayer.muted = true;
        muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (isMuted) {
        isMuted = false;
        audioPlayer.muted = false;
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

// Play song
function playSong(index, loop = false, endTime = null) {
    if (index >= 0 && index < songs.length) {
        currentSongIndex = index;
        const song = songs[index];

        audioPlayer.src = song.src;
        audioPlayer.play();
        isPlaying = true;

        // Set loop if specified
        isLooping = loop;
        audioPlayer.loop = loop;
        loopBtn.innerHTML = loop ? '<i class="fas fa-redo text-primary"></i>' : '<i class="fas fa-redo"></i>';
        loopEndTime = endTime;

        // Update UI
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        currentSongTitle.textContent = song.title;
        currentSongArtist.textContent = song.artist;
        currentSongAlbum.textContent = song.album;
        currentSongCover.src = song.cover;

        // Start equalizer animation
        animateEqualizer(true);

        // Update stats
        totalSongsPlayed++;
        totalDurationPlayed += song.duration;
        updateStats();
    }
}

// Pause song
function pauseSong() {
    audioPlayer.pause();
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';

    // Stop equalizer animation
    animateEqualizer(false);
}

// Resume song
function resumeSong() {
    audioPlayer.play();
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';

    // Start equalizer animation
    animateEqualizer(true);
}

// Save schedules to local storage
function saveSchedules() {
    // Only save non-fixed schedules
    const schedulesToSave = scheduledSongs.filter(s => !s.fixed);
    localStorage.setItem('deccaanMusicSchedules', JSON.stringify(schedulesToSave));
}

// Load schedules from local storage
function loadSchedules() {
    const savedSchedules = localStorage.getItem('deccaanMusicSchedules');
    if (savedSchedules) {
        const parsedSchedules = JSON.parse(savedSchedules);

        // Merge with fixed schedules
        scheduledSongs = [
            ...scheduledSongs.filter(s => s.fixed),
            ...parsedSchedules
        ];
    }
}

// Update favicon and logo
function updateLogo(logoUrl) {
    if (logoUrl) {
        loginLogo.src = logoUrl;
        headerLogo.src = logoUrl;
        favicon.href = logoUrl;
    }
}

// Generate PDF schedule
function generateSchedulePDF() {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add logo
    const logoX = doc.internal.pageSize.getWidth() / 2 - 20;
    doc.addImage('b.png', 'PNG', logoX, 10, 40, 40);

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241); // Primary color
    doc.text('TSRMMCHRC Music Schedule', doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });

    // Add subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Report Generated: ${dateStr}`, doc.internal.pageSize.getWidth() / 2, 70, { align: 'center' });

    // Add description
    doc.setFontSize(10);
    doc.text('This report contains the scheduled music sessions.', doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });

    // Create table data
    const tableColumn = ["No.", "Song Title", "Artist", "Schedule", "Duration"];
    const tableRows = [];

    // Sort scheduled songs by date and time
    const sortedSchedules = [...scheduledSongs].sort((a, b) => {
        if (a.date === 'daily' && b.date !== 'daily') return -1;
        if (a.date !== 'daily' && b.date === 'daily') return 1;
        if (a.date === b.date) {
            return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
    });

    // Add data to table
    sortedSchedules.forEach((schedule, index) => {
        const song = songs.find(s => s.id === schedule.songId);
        if (song) {
            let timeDisplay = formatScheduleTime(schedule.time);
            if (schedule.time.startsWith('after:')) {
                const [_, songIndex, seconds] = schedule.time.match(/after:(\d+):(\d+)/);
                const prevSong = songs.find(s => s.id === parseInt(songIndex));
                timeDisplay = `After ${prevSong ? prevSong.title : 'previous song'} (${seconds}s)`;
            }

            let dateDisplay = schedule.date === 'daily' ? 'Daily' : formatDate(schedule.date);

            tableRows.push([
                index + 1,
                song.title,
                song.artist,
                `${dateDisplay} at ${timeDisplay}`,
                formatTime(song.duration)
            ]);
        }
    });

    // Generate table
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 90,
        styles: {
            halign: 'center',
            valign: 'middle',
            fontSize: 10,
            cellPadding: 3,
            overflow: 'linebreak',
            lineWidth: 0.5
        },
        headStyles: {
            fillColor: [99, 102, 241],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 240, 250]
        },
        margin: { top: 90 }
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
            ' All rights Reserved -DECCAANOW CORP Deccaan Music a Product of DECCAANOW CORP',
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() - 20,
            doc.internal.pageSize.getHeight() - 10
        );
    }

    // Save the PDF
    doc.save('music-schedule.pdf');
}

// Make sure the application continues to run when minimized
// This uses the Page Visibility API to keep the app running in the background
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        // Page is hidden (minimized or in background)
        // Set up a background interval to keep checking schedules
        if (!window.backgroundInterval) {
            window.backgroundInterval = setInterval(function () {
                checkScheduledSongs();
            }, 1000);
        }
    } else {
        // Page is visible again
        if (window.backgroundInterval) {
            clearInterval(window.backgroundInterval);
            window.backgroundInterval = null;
        }
    }
});

// Initialize the app
init();
