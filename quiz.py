import random
from typing import List, Dict, Any

def generate_trivia_question(difficulty=1, allow_negative=False):
    # using number's range depend on diffuculty
    ranges = {1: 20, 2: 50, 3: 500}
    max_num = ranges.get(difficulty, 20)
    
    # prep' question with ramdomized arithmetic operators and number
    operations = ['+', '-', '*', '/']
    op = random.choice(operations)
    if op == '/':
        b = random.randint(1, max_num)
        a = b * random.randint(1, max_num // b if b != 0 else 1)
    else:
        a = random.randint(1, max_num)
        b = random.randint(1, max_num)
    if allow_negative:
        if random.choice([True, False]):
            a = -a
        if random.choice([True, False]):
            b = -b
    
    # decided question and its answer   
    question = f"{a} {op} {b}"
    answer = eval(question) #eval() exectue string as a python code line, if legal
    return question, answer

def generate_logic_question(difficulty=1, allow_negative=False):
    # using number's range depend on diffuculty
    ranges = {1: 20, 2: 50, 3: 500}
    max_num = ranges.get(difficulty, 20)
    
    # prep' question with ramdomized operators and number
    comparison_operators = ['<', '>', '!=', '==', '>=', '<=']
    op2 = random.choice(comparison_operators)

    arithmetic_operator = ['+', '-', '*', '/']
    op1 = random.choice(arithmetic_operator)
    
    if op1 == '/':
        b = random.randint(1, max_num)
        a = b * random.randint(1, max_num // b if b != 0 else 1)
    else:
        a = random.randint(1, max_num)
        b = random.randint(1, max_num)
    
    c = random.randint(1, max_num)

    if allow_negative:
        if random.choice([True, False]):
            a = -a
        if random.choice([True, False]):
            b = -b
        if random.choice([True, False]):
            c = -c

    # prepare question depend on using 3 variables or not
    use_three_vars = random.choice([True, False])
    if use_three_vars:
        expr_left = f"{a} {op1} {b}"
        expr_right = f"{c}"
    else:
        expr_left = f"{a}"
        expr_right = f"{b}"

    #decided question and answer
    question = f"{expr_left} {op2} {expr_right}             #(1 -> true or 0 -> false)"
    answer = eval(question) #eval() exectue string as a python code line, if legal
    return question, answer

# called it main hub for generating question
def generate_question(question_type='trivia', difficulty=1, allow_negative=False):
    if question_type == 'trivia':
        return generate_trivia_question(difficulty, allow_negative)
    elif question_type == 'logic':
        return generate_logic_question(difficulty, allow_negative)
    elif question_type == 'mix_up':
        chosen_type = random.choice(['trivia', 'logic'])
        return generate_question(chosen_type, difficulty, allow_negative)
    else:
        return generate_trivia_question(difficulty, allow_negative)


# function to generate quiz base on number of question, difficulty, and whether negative number can appear in question or not
def generate_quiz(num_questions=5, question_type='trivia', difficulty=1, allow_negative=False) -> List[Dict[str, Any]]:
    quiz = []
    for i in range(num_questions):
        question, answer = generate_question(question_type, difficulty, allow_negative)
        quiz.append({
            'question': question,
            'correct_answer': answer
        })
    return quiz

# collect all quiz's questions and answers and perform benchmark of performance
# 'any' -> since 2 type of quiz is present, use this for flexibility
# '-> List[Dict[str, Any]' is an function annotation -> hint the kind of value the function supposed to return
def evaluate_answers(quiz: List[Dict[str, Any]], user_answers: List[Any], times: List[float]) -> List[Dict[str, Any]]:
    results = []
    for i, item in enumerate(quiz):
        correct_answer = item['correct_answer']
        user_answer = user_answers[i] if i < len(user_answers) else None
        time_taken = times[i] if i < len(times) else 0
        is_correct = (user_answer == correct_answer)
        results.append({
            'question': item['question'],
            'correct_answer': correct_answer,
            'user_answer': user_answer,
            'time_taken': time_taken,
            'is_correct': is_correct
        })
    return results
