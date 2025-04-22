import random
import time
import matplotlib.pyplot as plt

# -------------------- for generating trivia question --------------------
#  by default, difficulty is easiest and no negative number allowed

def generate_trivia_question(difficulty=1, allow_negative=False):
    # difficulty: 1=easy(1-20), 2=normal(1-50), 3=hard(1-500)
    ranges = {1: 20, 2: 50, 3: 500}
    max_num = ranges.get(difficulty, 20)
    operations = ['+', '-', '*', '/']
    op = random.choice(operations)
    if op == '/':  # Avoid division by zero and ensure integer division for simplicity
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
    question = f"{a} {op} {b}"
    answer = eval(question)
    return question, answer

# -------------------- for generating logic question --------------------
#  by default, difficulty is easiest and no negative number allowed

def generate_logic_question(difficulty=1, allow_negative=False):
    # Generate a trivia question first
    question, correct_answer = generate_trivia_question(difficulty, allow_negative)
    # Randomly decide if the displayed answer is correct or incorrect
    is_correct = random.choice([True, False])
    if not is_correct:
        # Modify the answer slightly to make it incorrect
        # Add or subtract a small random value
        delta = random.choice([1, 2, 3])
        displayed_answer = correct_answer + delta if random.choice([True, False]) else correct_answer - delta
    else:
        displayed_answer = correct_answer
    # Formulate the logic question as a string
    logic_question = f"Is the following statement true? {question} = {displayed_answer} (True/False)"
    return logic_question, is_correct

# ------------------ Main function base on selected type, difficulty,... ----------

def generate_question(question_type='trivia', difficulty=1, allow_negative=False):
    if question_type == 'trivia':
        return generate_trivia_question(difficulty, allow_negative)
    elif question_type == 'logic':
        return generate_logic_question(difficulty, allow_negative)
    elif question_type == 'mix_up':
        chosen_type = random.choice(['trivia', 'logic'])
        return generate_question(chosen_type, difficulty, allow_negative)
    else:
        # Default to trivia if unknown type
        return generate_trivia_question(difficulty, allow_negative)



def run_quiz(num_questions=5, question_type='trivia', difficulty=1, allow_negative=False):
    results = []
    print(f"Math Quiz ({question_type} mode): Answer the following questions:")
    for i in range(num_questions):
        question, correct_answer = generate_question(question_type, difficulty, allow_negative)
        print(f"Question {i+1}: {question}")
        start_time = time.time()
        if question_type == 'logic' or (question_type == 'mix_up' and question.startswith("Is the following statement true?")):
            # Expect True/False answer
            user_input = input("Your answer (True/False): ").strip().lower()
            if user_input in ['true', 't', 'yes', 'y']:
                user_answer = True
            elif user_input in ['false', 'f', 'no', 'n']:
                user_answer = False
            else:
                user_answer = None
        else:
            try:
                user_answer = float(input("Your answer: "))
            except ValueError:
                user_answer = None
        end_time = time.time()
        time_taken = end_time - start_time
        is_correct = (user_answer == correct_answer)
        results.append({
            'question': question,
            'correct_answer': correct_answer,
            'user_answer': user_answer,
            'time_taken': time_taken,
            'is_correct': is_correct
        })
        print(f"{'Correct!' if is_correct else f'Wrong! Correct answer: {correct_answer}'}\nTime taken: {time_taken:.2f} seconds\n")
        print("\n--------------------------------------------------------------\n")
    return results

# draw chart for performance result through the quiz

def plot_results(results):
    times = [r['time_taken'] for r in results]
    correctness = [r['is_correct'] for r in results]
    questions = [f"Q{i+1}" for i in range(len(results))]

    fig, ax1 = plt.subplots()

    # Line plot for trend of time taken
    ax1.plot(questions, times, color='blue', marker='o', label='Time Taken - trend (s)')
    ax1.set_xlabel('Questions')
    ax1.set_ylabel('Time Taken (seconds)', color='blue')
    ax1.tick_params(axis='y', labelcolor='blue')

    # Bar plot for time taken with color based on correctness
    ax2 = ax1.twinx()
    bar_colors = ['green' if correct else 'red' for correct in correctness]
    ax2.bar(questions, times, alpha=0.3, color=bar_colors, label='Correctness')
    ax2.set_ylabel('Time Taken (seconds)', color='gray')
    ax2.tick_params(axis='y', labelcolor='gray')

    plt.title('Math Quiz Results: Time Taken and Correctness')
    fig.tight_layout()
    plt.show()

if __name__ == "__main__":
    # Example usage with user input for quiz settings
    print("Welcome to the Math Quiz!")
    length_input = input("Choose quiz length (5, 10, 20): ").strip()
    length = int(length_input) if length_input in ['5', '10', '20'] else 5

    print("Choose difficulty level: 1=easy, 2=normal, 3=hard")
    diff_input = input("Enter difficulty (1, 2, or 3): ").strip()
    difficulty = int(diff_input) if diff_input in ['1', '2', '3'] else 1

    print("Choose question type: trivia, logic, mix_up")
    qtype_input = input("Enter question type: ").strip().lower()
    question_type = qtype_input if qtype_input in ['trivia', 'logic', 'mix_up'] else 'trivia'

    allow_neg_input = input("Allow negative numbers? (yes/no): ").strip().lower()
    allow_negative = allow_neg_input in ['yes', 'y']

    results = run_quiz(num_questions=length, question_type=question_type, difficulty=difficulty, allow_negative=allow_negative)
    plot_results(results)
