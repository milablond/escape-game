// Variables globales
let currentEnigma = 0;
let timeLeft = 300; // 5 minutes en secondes
let gameTimer;
let gameStarted = false;
let enigmaStates = {
  enigma3Unlocked: false,
  wrongChoiceCount: 0,
  sequence: [],
};

// Démarrage du jeu
function startGame() {
  gameStarted = true;
  currentEnigma = 1;
  showEnigma('enigma1');
  startTimer();
  updateProgress();
  initEnigmas();
}

// Chrono
function startTimer() {
  gameTimer = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer').textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, '0')}`;

  // Effet de clignotement si moins de 2 minutes
  if (timeLeft < 120) {
    document.getElementById('timer').style.animation = 'flicker 1s infinite';
  }
}

function updateProgress() {
  document.getElementById('progress').textContent = `Énigme ${currentEnigma}/7`;
}

// Navigation
function showEnigma(enigmaId) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.remove('active');
  });
  document.getElementById(enigmaId).classList.add('active');
}

function nextEnigma() {
  currentEnigma++;
  updateProgress();

  if (currentEnigma <= 7) {
    showEnigma(`enigma${currentEnigma}`);
  } else {
    endGame(true);
  }
}

// Pénalités
function penaltyTime() {
  timeLeft = Math.max(0, timeLeft - 10);

  // Effet visuel de la pénalité
  document.body.style.animation = 'glitch 0.5s';
  setTimeout(() => {
    document.body.style.animation = '';
  }, 500);
}

// Initialisation des énigmes
function initEnigmas() {
  // Énigme 3: Grille
  const grid = document.getElementById('grid');
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'puzzle-cell';
    cell.dataset.index = i;
    cell.onclick = () => toggleCell(i);
    grid.appendChild(cell);
  }

  // Énigme 2: Scroll avec drag
  initScrollDrag();

  // Énigme 4: Texte changeant
  startTextChange();

  // Énigme 5: Problème mathématique changeant
  changeMathProblem();
}

// Scroll drag pour l'énigme 2
function initScrollDrag() {
  const scrollContainer = document.getElementById('scroll-zone');
  let isDown = false;
  let startX;
  let scrollLeft;

  scrollContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
  });

  scrollContainer.addEventListener('mouseleave', () => {
    isDown = false;
  });

  scrollContainer.addEventListener('mouseup', () => {
    isDown = false;
  });

  scrollContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainer.scrollLeft = scrollLeft - walk;
  });

  // Support clavier
  scrollContainer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      scrollContainer.scrollLeft -= 20;
    } else if (e.key === 'ArrowRight') {
      scrollContainer.scrollLeft += 20;
    }
  });

  // Focus pour les touches
  scrollContainer.setAttribute('tabindex', '0');
}

// Énigme 1: Bouton piégé
function showHint1() {
  document.getElementById('hint1').style.display = 'block';
}

function showFakeHelp1() {
  alert("Aide: Le bouton est devant vous ! (C'est cadeau)");
  penaltyTime();
}

// Énigme 2: Code caché
function checkCode() {
  const input = document.getElementById('code-input').value;
  if (input === '7394') {
    nextEnigma();
  } else {
    penaltyTime();
    document.getElementById('code-input').value = '';
    document.getElementById('code-input').style.borderColor = '#ff3333';
    setTimeout(() => {
      document.getElementById('code-input').style.borderColor = '#444';
    }, 1000);
  }
}

// Énigme 3: Grille piégée
function revealTrick3() {
  enigmaStates.enigma3Unlocked = true;
  document.querySelector('.trap-text').style.opacity = '0.3';
  document.querySelector('.trap-text').textContent = 'Système activé ✓';
}

function toggleCell(index) {
  const cell = document.querySelector(`[data-index="${index}"]`);
  cell.classList.toggle('selected');
}

function checkPattern() {
  if (!enigmaStates.enigma3Unlocked) {
    penaltyTime();
    // Indice : il faut d'abord activer le système
    document.querySelector('.trap-text').style.color = '#ff3333';
    document.querySelector('.trap-text').style.fontSize = '16px';
    return;
  }

  const selectedCells = document.querySelectorAll('.puzzle-cell.selected');
  const selectedIndexes = Array.from(selectedCells).map((cell) =>
    parseInt(cell.dataset.index)
  );

  // Motif "L": cases 0, 3, 6, 7, 8 (position dans la grille 3x3)
  // 0 1 2
  // 3 4 5
  // 6 7 8
  const correctPattern = [0, 3, 6, 7, 8];

  if (
    selectedIndexes.length === correctPattern.length &&
    correctPattern.every((index) => selectedIndexes.includes(index))
  ) {
    nextEnigma();
  } else {
    penaltyTime();
    // Effet visuel d'erreur
    document.querySelectorAll('.puzzle-cell.selected').forEach((cell) => {
      cell.style.backgroundColor = '#ff3333';
      setTimeout(() => {
        cell.style.backgroundColor = '';
      }, 500);
    });
  }
}

// Énigme 4: Texte changeant
function startTextChange() {
  const words = ['Mystère', 'Secret', 'Caché', 'Piégé', 'COMPUTER'];
  let currentWord = 0;

  setInterval(() => {
    if (document.getElementById('enigma4').classList.contains('active')) {
      document.getElementById('changing-title').textContent =
        words[currentWord];
      currentWord = (currentWord + 1) % words.length;
    }
  }, 3000);
}

function checkWord() {
  const input = document.getElementById('word-input').value;
  if (input === 'COMPUTER') {
    nextEnigma();
  } else {
    penaltyTime();
    document.getElementById('word-input').value = '';
  }
}

// Énigme 5: Calcul piégé
function changeMathProblem() {
  const problems = [
    { text: '2 + 2 = ?', answer: 4 },
    { text: '10 - 5 = ?', answer: 5 },
    { text: 'Combien de lettres dans "TRAP" ?', answer: 4 },
    { text: '3 × 3 = ?', answer: 9 },
    {
      text: 'Quelle heure est-il ? (heure actuelle)',
      answer: new Date().getHours(),
    },
  ];

  let currentProblem = 0;

  setInterval(() => {
    if (document.getElementById('enigma5').classList.contains('active')) {
      const problem = problems[currentProblem];
      document.getElementById('math-problem').textContent = problem.text;
      document.getElementById('math-problem').dataset.answer = problem.answer;
      currentProblem = (currentProblem + 1) % problems.length;
    }
  }, 2000);
}

function checkMath() {
  const input = parseInt(document.getElementById('math-input').value);
  const answer = parseInt(
    document.getElementById('math-problem').dataset.answer
  );

  if (input === answer) {
    nextEnigma();
  } else {
    penaltyTime();
    document.getElementById('math-input').value = '';
  }
}

// Énigme 6: Séquence mémoire
function startSequence() {
  const sequence = generateSequence();
  enigmaStates.sequence = sequence;

  let index = 0;
  document.getElementById('start-sequence').style.display = 'none';

  const interval = setInterval(() => {
    if (index < sequence.length) {
      document.getElementById('sequence-display').textContent = sequence[index];
      index++;
    } else {
      document.getElementById('sequence-display').textContent =
        'Tapez la séquence:';
      document.getElementById('sequence-input').style.display = 'block';
      clearInterval(interval);
    }
  }, 1000);
}

function generateSequence() {
  const chars = ['A', 'B', 'C', 'D', 'E', 'F', '1', '2', '3'];
  return Array.from(
    { length: 5 },
    () => chars[Math.floor(Math.random() * chars.length)]
  );
}

function checkSequence() {
  const input = document.getElementById('sequence-field').value.toUpperCase();
  const correct = enigmaStates.sequence.join('');

  if (input === correct) {
    nextEnigma();
  } else {
    penaltyTime();
    document.getElementById('sequence-field').value = '';
  }
}

// Énigme 7: Finale piégée
function showWrongChoice() {
  enigmaStates.wrongChoiceCount++;

  if (enigmaStates.wrongChoiceCount >= 2) {
    document.getElementById('real-exit').classList.add('revealed');
  }
}

// Fin du jeu
function endGame(success) {
  clearInterval(gameTimer);

  const endContent = document.getElementById('end-content');

  if (success) {
    endContent.innerHTML = `
                    <div class="success">
                        <h2>FÉLICITATIONS!</h2>
                        <p>Vous avez échappé au piège en ${
                          300 - timeLeft
                        } secondes.</p>
                        <p>Mais êtes-vous vraiment gagnant ?</p>
                    </div>
                `;
  } else {
    endContent.innerHTML = `
                    <div class="failure">
                        <h2>TEMPS ÉCOULÉ</h2>
                        <p>Vous restez piégé dans le système.</p>
                    </div>
                `;
  }

  showEnigma('end-screen');
}

function restartGame() {
  // Réinitialisation
  currentEnigma = 0;
  timeLeft = 300;
  gameStarted = false;
  enigmaStates = {
    enigma3Unlocked: false,
    wrongChoiceCount: 0,
    sequence: [],
  };

  // Réinitialisation des champs
  document.querySelectorAll('.input-field').forEach((field) => {
    field.value = '';
    field.style.borderColor = '#444';
  });

  document.querySelectorAll('.puzzle-cell').forEach((cell) => {
    cell.classList.remove('selected');
  });

  document.getElementById('hint1').style.display = 'none';
  document.getElementById('real-exit').classList.remove('revealed');
  document.getElementById('timer').style.animation = '';
  document.body.style.animation = '';

  showEnigma('start-screen');
}

window.addEventListener('load', () => {
  // Ajout d'effets sonores simulés par des vibrations visuelles
  setInterval(() => {
    if (Math.random() < 0.1) {
      const element = document.querySelector('.game-container');
      element.style.transform = 'translate(1px, 1px)';
      setTimeout(() => {
        element.style.transform = '';
      }, 100);
    }
  }, 5000);
});

function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVh();
window.addEventListener('resize', setVh);
