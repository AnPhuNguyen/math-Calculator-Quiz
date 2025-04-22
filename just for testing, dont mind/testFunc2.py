op1 = '+'; op2 = '=='
a = 1; b = 2; c = 3
expr_left = f"{a} {op1} {b}"
expr_right = f"{c}"
q = f'{expr_left} {op2} {expr_right} #(true or false)'
print(q)
print(eval(q))