let currentQuiz = [];
let currentIndex = 0;
let startTime = 0;
let userAnswers = [];
let times = [];

const quizSettingsForm = document.getElementById('quizSettingsForm');
const quizContainer = document.getElementById('quizContainer');
const quizForm = document.getElementById('quizForm');
const submitQuizBtn = document.getElementById('submitQuizBtn');
const quizResults = document.getElementById('quizResults');
const resultsContainer = document.getElementById('resultsContainer');
const resultsChart = document.getElementById('resultsChart').getContext('2d');

submitQuizBtn.style.display = 'none';

quizSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    quizResults.style.display = 'none';
    quizContainer.style.display = 'none';
    resultsContainer.innerHTML = '';
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    const num_questions = parseInt(quizSettingsForm.quizLength.value);
    const question_type = quizSettingsForm.quizType.value;
    const difficulty = parseInt(quizSettingsForm.quizDifficulty.value);
    const allow_negative = quizSettingsForm.allowNegative.value === 'true';

    const response = await fetch('/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num_questions, question_type, difficulty, allow_negative })
    });

    const data = await response.json();
    if (response.ok) {
        currentQuiz = data.quiz;
        currentIndex = 0;
        userAnswers = [];
        times = [];
        quizSettingsForm.style.display = 'none';
        startCountdown(3);
    } else {
        alert('Failed to start quiz: ' + data.detail);
    }
});

function startCountdown(seconds) {
    quizContainer.style.display = 'block';
    quizForm.innerHTML = `<h3>Starting in ${seconds}...</h3>`;
    if (seconds > 0) {
        setTimeout(() => startCountdown(seconds - 1), 1000);
    } else {
        showQuestion(currentIndex);
    }
}

function showQuestion(index) {
    quizForm.innerHTML = '';
    const q = currentQuiz[index];
    const div = document.createElement('div');
    div.className = 'quiz-question';
    const label = document.createElement('label');
    label.textContent = `Q${index + 1}: ${q.question}`;
    div.appendChild(label);

    // Check if question is logic type by presence of "True/False" in question string
    const isLogic = q.question.includes('(True/False)');

    if (isLogic) {
        const trueBtn = document.createElement('button');
        trueBtn.textContent = 'True';
        trueBtn.type = 'button';
        trueBtn.addEventListener('click', () => recordAnswer(true, index));
        div.appendChild(trueBtn);

        const falseBtn = document.createElement('button');
        falseBtn.textContent = 'False';
        falseBtn.type = 'button';
        falseBtn.addEventListener('click', () => recordAnswer(false, index));
        div.appendChild(falseBtn);

        // Add Next Question button disabled initially
        const nextBtn = document.createElement('button');
        nextBtn.textContent = index === currentQuiz.length - 1 ? 'Submit Quiz' : 'Next Question';
        nextBtn.type = 'button';
        nextBtn.disabled = true;
        nextBtn.addEventListener('click', () => {
            if (index < currentQuiz.length - 1) {
                showQuestion(index + 1);
            } else {
                submitQuiz();
            }
        });
        div.appendChild(nextBtn);

        // Store nextBtn to enable after answer
        div.nextBtn = nextBtn;
    } else {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';
        input.id = 'answerInput';
        input.name = 'answerInput';
        input.required = true;
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitAnswer(index);
            }
        });
        div.appendChild(input);

        // Set focus and place cursor at end immediately after appending input
        setTimeout(() => {
            input.focus();
            const val = input.value;
            input.value = '';
            input.value = val;
        }, 0);

        const submitBtn = document.createElement('button');
        submitBtn.textContent = index === currentQuiz.length - 1 ? 'Submit Quiz' : 'Next Question';
        submitBtn.type = 'button';
        submitBtn.addEventListener('click', () => submitAnswer(index));
        div.appendChild(submitBtn);
    }

    quizForm.appendChild(div);
    startTime = Date.now();
}

function recordAnswer(answer, index) {
    userAnswers[index] = answer;
    times[index] = (Date.now() - startTime) / 1000;

    // Enable Next button
    const div = quizForm.querySelector('.quiz-question');
    if (div && div.nextBtn) {
        div.nextBtn.disabled = false;
    }
}

async function submitAnswer(index) {
    const input = document.getElementById('answerInput');
    let answer;
    if (!input) {
        alert('Answer input not found.');
        return;
    }
    answer = parseFloat(input.value);
    if (isNaN(answer)) {
        alert('Please enter a valid answer.');
        return;
    }
    const timeTaken = (Date.now() - startTime) / 1000;
    userAnswers[index] = answer;
    times[index] = timeTaken;

    if (index < currentQuiz.length - 1) {
        showQuestion(index + 1);
    } else {
        submitQuiz();
    }
}

async function submitQuiz() {
    const response = await fetch('/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz: currentQuiz, user_answers: userAnswers, times })
    });
    const data = await response.json();
    if (response.ok) {
        displayQuizResults(data.results);
        quizContainer.style.display = 'none';
        quizResults.style.display = 'block';
        quizSettingsForm.style.display = 'block';
    } else {
        alert('Failed to submit quiz: ' + data.detail);
    }
}

let chartInstance = null;

function displayQuizResults(results) {
    resultsContainer.innerHTML = '';
    const timesArr = [];
    const correctness = [];
    results.forEach((r, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.textContent = `Q${index + 1}: ${r.question} | Your answer: ${r.user_answer} | Correct answer: ${r.correct_answer} | ${r.is_correct ? 'Correct' : 'Wrong'} | Time: ${r.time_taken.toFixed(2)}s`;
        resultsContainer.appendChild(div);
        timesArr.push(r.time_taken);
        correctness.push(r.is_correct);
    });

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(resultsChart, {
        type: 'bar',
        data: {
            labels: results.map((_, i) => `Q${i + 1}`),
            datasets: [
                {
                    label: 'Time Trend',
                    type: 'line',
                    data: timesArr,
                    borderColor: 'blue',
                    fill: false,
                    tension: 0.1,
                    order: 2
                },
                {
                    label: 'Time Taken (s)',
                    data: timesArr,
                    backgroundColor: correctness.map(c => c ? 'green' : 'red'),
                    borderWidth: 1,
                    order: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
