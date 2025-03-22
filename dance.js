import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "",
    authDomain: "cmpsc421-ddr.firebaseapp.com",
    databaseURL: "https://cmpsc421-ddr-default-rtdb.firebaseio.com",
    projectId: "cmpsc421-ddr",
    storageBucket: "cmpsc421-ddr.firebasestorage.app",
    messagingSenderId: "242802249641",
    appId: "1:242802249641:web:db0ba715101e07612afeb8"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

// Fetches the top 3 scores from the Firebase database
async function fetchScores() {
    try {
        const scoresCollection = collection(db, "highscores");
        const scoresQuery = query(scoresCollection, orderBy("score", "desc"), limit(3));
        const querySnapshot = await getDocs(scoresQuery);
        let scores = [];

        querySnapshot.forEach((doc) => {
            scores.push({ id: doc.id, ...doc.data() });
        });
        return scores;
    } catch (error) {
        console.error("Error fetching scores:", error);
    }
}

// Uploads a score to the database.
async function uploadScore(username, score) {
    try {
        const scoresCollection = collection(db, "highscores");
        await addDoc(scoresCollection, {
            username: username,
            score: score,
            timestamp: new Date()
        });

    } catch (error) {
        console.error("Error uploading score:", error);
    }
}

const {createApp} = Vue;

createApp({
    data() {
        return {
            score: 0,
            misses: 5,
            in_play: false,
            moving_arrows: null,
            creating_arrows: null,
            arrow_speed: 100,
            creation_speed: 3000,
            perfect_multiplier: 2,
            great_multipler: 1.5,
            good_multiplier: 1,
            perfect_timing: [5, -5],
            great_timing: [10, -10],
            good_timing: [15, -15],
        }
    }, methods: {
        setDefaults: function() {
            this.score = 0;
            this.misses = 5;
        },
        getScores: async function() {
            let scores = await fetchScores();
            let leaderboard = document.getElementById('leaderboard');
            for (let score of scores) {
                let score_element = document.createElement('li');
                score_element.innerHTML = score.username + ": " + score.score;
                leaderboard.append(score_element);
            }
        },
        addScore: function(timing) {
            let points = 100;
            if (timing <= this.perfect_timing[0] && timing >= this.perfect_timing[1])
                this.score += points * this.perfect_multiplier;
            else if (timing <= this.great_timing[0] && timing >= this.great_timing[1])
                this.score += points * this.great_multipler;
            else if (timing <= this.good_timing[0] && timing >= this.good_timing[1])
                this.score += points * this.good_multiplier;
        },
        setDifficulty: function(difficulty) {
            if (this.in_play) {
                return;
            }
            if (difficulty === 'easy') {
                this.arrow_speed = 45;
                this.creation_speed = 2500;
            }
            else if (difficulty === 'medium') {
                this.arrow_speed = 35;
                this.creation_speed = 2000;
            }
            else if (difficulty === 'hard') {
                this.arrow_speed = 25;
                this.creation_speed = 1000;
            }
        },
        createRow: function() {
            // Pick a random number from 1 to 4
            let random_number = Math.floor(Math.random() * 4) + 1;
            let arrow = this.createArrow(random_number);
            let arrow_container = document.getElementById('arrow-container');
            arrow_container.append(arrow);
        },
        createArrow: function(rand_num) {
            let arrow;
            let gameplay_container = document.getElementById('gameplay-container');
            if (rand_num == 1) {
                const left_arrow_img = "resources/left-arrow.png";
                arrow = document.createElement('img');
                arrow.src = left_arrow_img;
                arrow.style.left = 23 + '%' ;
                arrow.style.top = gameplay_container.clientHeight - arrow.height + 'px';
                arrow.className = 'dynamic_left_arrow';
            }
            else if (rand_num == 2) {
                const down_arrow_img = "resources/down-arrow.png";
                arrow = document.createElement('img');
                arrow.src = down_arrow_img;
                arrow.style.left = 37 + '%' ;
                arrow.style.top = gameplay_container.clientHeight - arrow.height + 'px';
                arrow.className = 'dynamic_down_arrow';
            }
            else if (rand_num == 3) {
                const up_arrow_img = "resources/up-arrow.png";
                arrow = document.createElement('img');
                arrow.src = up_arrow_img;
                arrow.style.left = 51 + '%' ;
                arrow.style.top = gameplay_container.clientHeight - arrow.height + 'px';
                arrow.className = 'dynamic_up_arrow';
            }
            else if (rand_num == 4) {
                const right_arrow_img = "resources/right-arrow.png";
                arrow = document.createElement('img');
                arrow.src = right_arrow_img;
                arrow.style.left = 65 + '%' ;
                arrow.style.top = gameplay_container.clientHeight - arrow.height + 'px';
                arrow.className = 'dynamic_right_arrow';
            }
            arrow.style.position = 'absolute';
            return arrow;
        },
        togglePlay: function() {
            if (this.misses === 0)
                return;
            this.in_play = !this.in_play;
            this.play();
        },
        resetGame: function() {
            let arrow_container = document.getElementById('arrow-container');
            arrow_container.innerHTML = '';
            this.setDefaults();
            this.in_play = false;
            this.play();
        },
        handleKeyEvents: function(event) {
            if (event.key == 'p') {
                this.togglePlay();
                return;
            }
            let arrow_container = document.getElementById('arrow-container');
            let dynamic_arrow;
            let static_arrow;
            let arrow_class_name;
            let static_glow_arrow_img;
            let static_arrow_img;

            if (event.key == 'ArrowLeft') {
                dynamic_arrow = document.getElementsByClassName('dynamic_left_arrow')[0];
                static_arrow = document.getElementById('static_left_arrow');
                arrow_class_name = 'dynamic_left_arrow';
                static_glow_arrow_img = 'resources/glow-left-arrow.png';
                static_arrow_img = 'resources/left-arrow-white.png';
            }
            else if (event.key == 'ArrowRight') {
                dynamic_arrow = document.getElementsByClassName('dynamic_right_arrow')[0];
                static_arrow = document.getElementById('static_right_arrow');
                arrow_class_name = 'dynamic_right_arrow';
                static_glow_arrow_img = 'resources/glow-right-arrow.png';
                static_arrow_img = 'resources/right-arrow-white.png';
            }
            else if (event.key == 'ArrowUp') {
                dynamic_arrow = document.getElementsByClassName('dynamic_up_arrow')[0];
                static_arrow = document.getElementById('static_up_arrow');
                arrow_class_name = 'dynamic_up_arrow';
                static_glow_arrow_img = 'resources/glow-up-arrow.png';
                static_arrow_img = 'resources/up-arrow-white.png';
            }
            else if (event.key == 'ArrowDown') {
                dynamic_arrow = document.getElementsByClassName('dynamic_down_arrow')[0];
                static_arrow = document.getElementById('static_down_arrow');
                arrow_class_name = 'dynamic_down_arrow';
                static_glow_arrow_img = 'resources/glow-down-arrow.png';
                static_arrow_img = 'resources/down-arrow-white.png';
            }
            if (dynamic_arrow === undefined)
                return;
            let timing = dynamic_arrow.style.top.split('px')[0];
            if (timing > this.good_timing[0] || timing < this.good_timing[1])
                this.loseLife();
            else {
                for (let child of arrow_container.children) {
                    if (child.className === arrow_class_name) {
                        child.remove();
                        this.addScore(timing);
                        break;
                    }
                }
                static_arrow.src = static_glow_arrow_img;
                setTimeout(() => {static_arrow.src = static_arrow_img;}, 300);
            }
        },
        loseLife: function() {
            // Bug: continues to lost lives if key is held down.
            this.misses -= 1;
            if (this.misses === 0) {
                this.endGame();
                this.in_play = false;
                this.play();
            }
        },
        endGame: function() {
            // Have a user input their name in a form
            // Upload their score to the database after they submit
            let username = prompt("Enter your username if you would like to save your score: ");
            if (username === null)
                return;
            uploadScore(username, this.score);
        },
        gameLoop: function() {
            let arrow_container = document.getElementById("arrow-container");
            for (let child of arrow_container.children) {
                child.style.top = (child.style.top.replace('px', '') - 5) + 'px';
                if (child.style.top.replace('px', '') < -5) {
                    child.remove();
                    this.loseLife();
                }
            }
        },
        play: function() {
            if (this.in_play === true) {
                let audio = document.getElementById('music_track');
                audio.muted = false;
                this.moving_arrows = setInterval(this.gameLoop, this.arrow_speed);
                this.creating_arrows = setInterval(this.createRow, this.creation_speed);
            }
            else {
                clearInterval(this.moving_arrows);
                clearInterval(this.creating_arrows);
                this.moving_arrows = null;
                this.creating_arrows = null;
            }
        },
        muteMusic() {
            let audio = document.getElementById('music_track');
            audio.muted = !audio.muted;
        }
    },
    mounted() {
        window.addEventListener('keydown', this.handleKeyEvents);
        let audio = document.getElementById('music_track');
        audio.volume = 0.5;
        this.getScores();
      },
    beforeUnmount() {
        window.removeEventListener('keydown', this.handleKeyEvents);
      }
}).mount('#app');