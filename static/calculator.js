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
