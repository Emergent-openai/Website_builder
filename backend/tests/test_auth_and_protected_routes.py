import os
import uuid

import pytest
import requests

# Auth + protected website-builder route regression tests.
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")


@pytest.fixture(scope="session")
def api_base_url():
    if not BASE_URL:
        pytest.skip("REACT_APP_BACKEND_URL is not set")
    return BASE_URL.rstrip("/")


@pytest.fixture
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


def _signup_payload():
    uid = str(uuid.uuid4())[:10]
    return {
        "name": f"TEST_User_{uid}",
        "email": f"test_auth_{uid}@example.com",
        "password": "Password123!",
    }


def _create_project_payload(name_suffix: str):
    return {
        "name": f"TEST_Project_{name_suffix}",
        "description": "TEST auth-protected project",
        "status": "draft",
        "pages": [
            {
                "name": "Home",
                "slug": "home",
                "seo_title": "Home",
                "seo_description": "Home page",
                "sections": [],
            }
        ],
    }


def test_signup_returns_token_and_user_shape(api_client, api_base_url):
    payload = _signup_payload()
    response = api_client.post(f"{api_base_url}/api/auth/signup", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert isinstance(data["access_token"], str)
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == payload["email"].lower()
    assert data["user"]["name"] == payload["name"]


def test_signup_duplicate_email_returns_409(api_client, api_base_url):
    payload = _signup_payload()

    first = api_client.post(f"{api_base_url}/api/auth/signup", json=payload)
    assert first.status_code == 201

    second = api_client.post(f"{api_base_url}/api/auth/signup", json=payload)
    assert second.status_code == 409
    assert "already exists" in second.json()["detail"].lower()


def test_login_existing_user_and_me_flow(api_client, api_base_url):
    payload = _signup_payload()
    signup_response = api_client.post(f"{api_base_url}/api/auth/signup", json=payload)
    assert signup_response.status_code == 201

    login_response = api_client.post(
        f"{api_base_url}/api/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    assert login_response.status_code == 200

    login_data = login_response.json()
    token = login_data["access_token"]
    assert isinstance(token, str)

    me_response = api_client.get(
        f"{api_base_url}/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == payload["email"].lower()
    assert me_data["name"] == payload["name"]


def test_login_invalid_password_returns_401(api_client, api_base_url):
    payload = _signup_payload()
    signup_response = api_client.post(f"{api_base_url}/api/auth/signup", json=payload)
    assert signup_response.status_code == 201

    login_response = api_client.post(
        f"{api_base_url}/api/auth/login",
        json={"email": payload["email"], "password": "WrongPass999!"},
    )
    assert login_response.status_code == 401
    assert "invalid" in login_response.json()["detail"].lower()


def test_me_unauthorized_without_token(api_client, api_base_url):
    response = api_client.get(f"{api_base_url}/api/auth/me")
    assert response.status_code == 401
    assert "authentication" in response.json()["detail"].lower()


def test_projects_list_unauthorized_without_token(api_client, api_base_url):
    response = api_client.get(f"{api_base_url}/api/website-builder/projects")
    assert response.status_code == 401
    assert "authentication" in response.json()["detail"].lower()


def test_projects_create_unauthorized_without_token(api_client, api_base_url):
    payload = _create_project_payload(str(uuid.uuid4())[:6])
    response = api_client.post(f"{api_base_url}/api/website-builder/projects", json=payload)
    assert response.status_code == 401
    assert "authentication" in response.json()["detail"].lower()


def test_projects_authenticated_crud_and_owner_guard(api_client, api_base_url):
    owner_payload = _signup_payload()
    owner_signup = api_client.post(f"{api_base_url}/api/auth/signup", json=owner_payload)
    assert owner_signup.status_code == 201
    owner_token = owner_signup.json()["access_token"]

    other_payload = _signup_payload()
    other_signup = api_client.post(f"{api_base_url}/api/auth/signup", json=other_payload)
    assert other_signup.status_code == 201
    other_token = other_signup.json()["access_token"]

    create_payload = _create_project_payload(str(uuid.uuid4())[:8])
    create_response = api_client.post(
        f"{api_base_url}/api/website-builder/projects",
        json=create_payload,
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert create_response.status_code == 200
    created = create_response.json()
    assert created["name"] == create_payload["name"]
    assert isinstance(created["id"], str)

    project_id = created["id"]

    owner_get = api_client.get(
        f"{api_base_url}/api/website-builder/projects/{project_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert owner_get.status_code == 200
    assert owner_get.json()["name"] == create_payload["name"]

    other_get = api_client.get(
        f"{api_base_url}/api/website-builder/projects/{project_id}",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert other_get.status_code == 404

    delete_response = api_client.delete(
        f"{api_base_url}/api/website-builder/projects/{project_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert delete_response.status_code == 200
    deleted_data = delete_response.json()
    assert deleted_data["success"] is True
    assert deleted_data["deleted_id"] == project_id

    verify_deleted = api_client.get(
        f"{api_base_url}/api/website-builder/projects/{project_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert verify_deleted.status_code == 404
