from fastapi import HTTPException

def calculate(num1: float, num2: float, operation: str) -> float:
    op = operation.lower().strip()
    a, b = num1, num2
    result = 0

    if op == "add" or op == "+":
        result = a + b
    elif op == "subtract" or op == "-":
        result = a - b
    elif op == "multiply" or op == "*":
        result = a * b
    elif op == "divide" or op == "/":
        if b == 0:
            raise HTTPException(status_code=400, detail="Cannot divide by zero")
        result = a / b
    else:
        raise HTTPException(status_code=400, detail="Invalid operation")

    return result
