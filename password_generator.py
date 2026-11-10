"""Password logic (CLI + reusable module). Uses `secrets`, not `random`."""
import math
import secrets
import string

AMBIGUOUS = "O0oIl1|"


def build_pool(upper=True, lower=True, digits=True, symbols=True, avoid_ambiguous=False):
    sets = []
    if upper:
        sets.append(string.ascii_uppercase)
    if lower:
        sets.append(string.ascii_lowercase)
    if digits:
        sets.append(string.digits)
    if symbols:
        sets.append(string.punctuation)
    if avoid_ambiguous:
        sets = ["".join(c for c in s if c not in AMBIGUOUS) for s in sets]
    return sets


def generate_password(length=12, **options):
    sets = build_pool(**options)
    if not sets:
        raise ValueError("Select at least one character type.")
    if length < len(sets):
        raise ValueError("Length is too short for the selected character types.")
    pool = "".join(sets)
    # one guaranteed character from each selected set, then fill the rest
    chars = [secrets.choice(s) for s in sets]
    chars += [secrets.choice(pool) for _ in range(length - len(chars))]
    secrets.SystemRandom().shuffle(chars)
    return "".join(chars)


def strength(password, pool_size=94):
    bits = len(password) * math.log2(pool_size)
    if bits < 45:
        return "Weak"
    if bits < 75:
        return "Medium"
    return "Strong"


if __name__ == "__main__":
    try:
        n = int(input("Enter the desired password length: "))
        pw = generate_password(n)
        print("Generated password:", pw)
        print("Strength:", strength(pw))
    except ValueError as e:
        print("Error:", e)
