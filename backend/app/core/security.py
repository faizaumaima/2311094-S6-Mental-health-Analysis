import os

from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError


password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    pepper = os.environ["PEPPER"]
    return password_hasher.hash(password + pepper)


def verify_password(password: str, password_hash: str) -> bool:
    pepper = os.environ["PEPPER"]

    try:
        return password_hasher.verify(password_hash, password + pepper)
    except (VerifyMismatchError, VerificationError):
        return False