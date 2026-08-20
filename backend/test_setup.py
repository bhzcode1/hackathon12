#!/usr/bin/env python3
"""
Test script to verify that the Phase 1 setup is working correctly.
"""

def test_imports():
    """Test that all modules can be imported."""
    try:
        # Test core imports
        from app.core.config import settings
        from app.core.database import Base, engine, SessionLocal, get_db
        from app.core.security import get_password_hash, verify_password, create_access_token, decode_token

        # Test model imports
        from app.models.user import User

        # Test schema imports
        from app.schemas.user import UserCreate, UserUpdate, UserInDB, User, Token

        # Test CRUD imports
        from app.crud import user

        # Test API imports
        from app.api.v1.endpoints import auth, users
        from app.api.v1.api import api_router

        # Test main app
        from app.main import app

        print("[SUCCESS] All imports successful!")
        return True

    except Exception as e:
        print(f"[ERROR] Import error: {e}")
        return False

def test_database_connection():
    """Test that we can create a database session."""
    try:
        from app.core.database import SessionLocal

        db = SessionLocal()
        # Just test that we can create a session - don't actually query
        db.close()
        print("[SUCCESS] Database session creation successful!")
        return True
    except Exception as e:
        print(f"[ERROR] Database connection error: {e}")
        return False

def test_password_hashing():
    """Test password hashing and verification."""
    try:
        from app.core.security import get_password_hash, verify_password

        password = "testpassword123"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) == True
        assert verify_password("wrongpassword", hashed) == False

        print("[SUCCESS] Password hashing and verification successful!")
        return True
    except Exception as e:
        print(f"[ERROR] Password hashing error: {e}")
        return False

def test_token_creation():
    """Test JWT token creation and decoding."""
    try:
        from app.core.security import create_access_token, decode_token
        from app.core.config import settings

        subject = "testuser"
        token = create_access_token(subject)

        decoded = decode_token(token)
        assert decoded is not None
        assert decoded["sub"] == subject

        print("[SUCCESS] JWT token creation and decoding successful!")
        return True
    except Exception as e:
        print(f"[ERROR] Token creation error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Phase 1 setup...")
    print("=" * 50)

    tests = [
        test_imports,
        test_database_connection,
        test_password_hashing,
        test_token_creation
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1
        print()

    print("=" * 50)
    print(f"Results: {passed}/{total} tests passed")

    if passed == total:
        print("SUCCESS: All tests passed! Phase 1 setup is working correctly.")
    else:
        print("WARNING: Some tests failed. Please check the errors above.")