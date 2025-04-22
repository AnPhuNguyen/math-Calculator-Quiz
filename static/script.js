// Calculator functionality
const calcForm = document.getElementById('calcForm');
const resultDiv = document.getElementById('result');

calcForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const num1 = parseFloat(calcForm.num1.value);
    const num2 = parseFloat(calcForm.num2.value);
    const operation = calcForm.operation.value;

    const response = await fetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num1, num2, operation })
    });

    const data = await response.json();
    if (response.ok) {
        resultDiv.textContent = `Result: ${data.result}`;
    } else {
        resultDiv.textContent = `Error: ${data.detail}`;
    }
});

// Quiz functionality
const quizSettingsForm = document.getElementById('quizSettingsForm');
const quizContainer = document.getElementById('quizContainer');
const quizForm = document.getElementById('quizForm');
const submitQuizBtn = document.getElementById('submitQuizBtn');
const quizResults = document.getElementById('quizResults');
const resultsContainer = document.getElementById('resultsContainer');
const resultsChart = document.getElementById('resultsChart').getContext('2d');

let currentQuiz = [];
let startTimes = [];

quizSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Get quiz settings
    const num_questions = parseInt(quizSettingsForm.quizLength.value);
    const question_type = quizSettingsForm.quizType.value;
    const difficulty = parseInt(quizSettingsForm.quizDifficulty.value);
    const allow_negative = quizSettingsForm.allowNegative.value === 'true';

    // Request quiz questions from API
    const response = await fetch('/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num_questions, question_type, difficulty, allow_negative })
    });

    const data = await response.json();
    if (response.ok) {
        currentQuiz = data.quiz;
        startTimes = [];
        displayQuizQuestions(currentQuiz);
        quizSettingsForm.style.display = 'none';
        quizContainer.style.display = 'block';
        quizResults.style.display = 'none';
    } else {
        alert('Failed to start quiz: ' + data.detail);
    }
});

function displayQuizQuestions(quiz) {
    quizForm.innerHTML = '';
    quiz.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'quiz-question';
        const label = document.createElement('label');
        label.textContent = `Q${index + 1}: ${q.question}`;
        label.htmlFor = `answer${index}`;
        div.appendChild(label);

        let input;
        if (q.question.startsWith('Is the following statement true?')) {
            // Logic question expects True/False
            input = document.createElement('select');
            input.id = `answer${index}`;
            input.name = `answer${index}`;
            const optionTrue = document.createElement('option');
            optionTrue.value = 'true';
            optionTrue.textContent = 'True';
            const optionFalse = document.createElement('option');
            optionFalse.value = 'false';
            optionFalse.textContent = 'False';
            input.appendChild(optionTrue);
            input.appendChild(optionFalse);
        } else {
            // Trivia question expects numeric answer
            input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.id = `answer${index}`;
            input.name = `answer${index}`;
            input.required = true;
        }
        div.appendChild(input);
        quizForm.appendChild(div);
        startTimes[index] = Date.now();
    });
}

submitQuizBtn.addEventListener('click', async () => {
    const user_answers = [];
    const times = [];
    let allAnswered = true;

    currentQuiz.forEach((q, index) => {
        const input = document.getElementById(`answer${index}`);
        let answer;
        if (input.tagName.toLowerCase() === 'select') {
            const val = input.value;
            answer = (val === 'true');
        } else {
            answer = parseFloat(input.value);
            if (isNaN(answer)) {
                allAnswered = false;
            }
        }
        user_answers.push(answer);
        const timeTaken = (Date.now() - startTimes[index]) / 1000;
        times.push(timeTaken);
    });

    if (!allAnswered) {
        alert('Please answer all questions before submitting.');
        return;
    }

    // Submit answers to API
    const response = await fetch('/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz: currentQuiz, user_answers, times })
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
});

let chartInstance = null;

function displayQuizResults(results) {
    resultsContainer.innerHTML = '';
    const times = [];
    const correctness = [];
    results.forEach((r, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.textContent = `Q${index + 1}: ${r.question} | Your answer: ${r.user_answer} | Correct answer: ${r.correct_answer} | ${r.is_correct ? 'Correct' : 'Wrong'} | Time: ${r.time_taken.toFixed(2)}s`;
        resultsContainer.appendChild(div);
        times.push(r.time_taken);
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
                    label: 'Time Taken (s)',
                    data: times,
                    backgroundColor: correctness.map(c => c ? 'green' : 'red'),
                    borderWidth: 1
                },
                {
                    label: 'Time Trend',
                    type: 'line',
                    data: times,
                    borderColor: 'blue',
                    fill: false,
                    tension: 0.1
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
