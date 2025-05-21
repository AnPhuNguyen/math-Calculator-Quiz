# Calculator and Quiz Web App
<**this was made while in tenomad inc. internship**>

This web application provides two main features:

1. **Calculator**  
   A simple calculator that supports basic arithmetic operations: addition, subtraction, multiplication, and division. Users can input two numbers and select an operation to get the result.

2. **Math Quiz**  
   An interactive math quiz that generates random questions based on user-selected settings such as number of questions, question type (trivia or logic), difficulty, and allowance of negative numbers.  
   - Trivia questions involve arithmetic operations.  
   - Logic questions present true/false statements with randomized operators and expressions.  
   - The quiz records the time taken to answer each question.  
   - After completing the quiz, results are displayed with a chart showing the time taken per question and a trend line for performance.

----------------------------------------------------------------------------------------

## Technical Details

- The backend is built with FastAPI, serving API endpoints and static HTML pages.  
- The frontend uses vanilla JavaScript and Chart.js for interactive UI and result visualization.  
- Static files (HTML, CSS, JS) are served via FastAPI's static file mounting.

## CORS Usage and Current Limitation

Because the frontend and backend may be served from different origins during development (e.g., frontend served via a local file server at `http://192.168.1.5:5500` and backend running on `http://127.0.0.1:8000`), Cross-Origin Resource Sharing (CORS) policies can block API requests from the frontend to the backend.

To address this, the FastAPI backend includes CORS middleware configured to allow requests from all origins for testing purposes. However, this is not recommended for production environments due to security concerns.

**Current Problem:**  
If you run the frontend and backend separately without proper CORS configuration or serving the frontend through the backend, the app will not function correctly because browsers block cross-origin API calls by default.

**Recommended Solution:**  
Serve the frontend static files through the FastAPI backend so that both frontend and backend share the same origin, avoiding CORS issues altogether.

Alternatively, configure CORS middleware in FastAPI to allow requests from the frontend's origin during development.
