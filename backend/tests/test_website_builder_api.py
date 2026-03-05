import os
import uuid

import pytest
import requests

# Website builder API regression tests with authenticated project CRUD checks.
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")


@pytest.fixture(scope="session")
def api_base_url():
    if not BASE_URL:
        pytest.skip("REACT_APP_BACKEND_URL is not set")
    return BASE_URL.rstrip("/")


@pytest.fixture(scope="session")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def auth_token(api_client, api_base_url):
    uid = str(uuid.uuid4())[:10]
    payload = {
        "name": f"TEST_Regression_{uid}",
        "email": f"test_regression_{uid}@example.com",
        "password": "Password123!",
    }
    response = api_client.post(f"{api_base_url}/api/auth/signup", json=payload)
    if response.status_code != 201:
        pytest.skip(f"Signup failed for auth fixture: {response.status_code} {response.text}")
    return response.json()["access_token"]


def _build_payload(name_suffix: str):
    return {
        "name": f"TEST_Builder_{name_suffix}",
        "description": "TEST payload for CRUD verification",
        "status": "draft",
        "pages": [
            {
                "name": "Home",
                "slug": "home",
                "seo_title": "Home",
                "seo_description": "Home page",
                "sections": [
                    {
                        "id": str(uuid.uuid4()),
                        "presetKey": "hero-electric",
                        "type": "hero",
                        "name": "Hero",
                        "description": "Hero section",
                        "category": "Hero",
                        "content": {"title": "Initial Title"},
                        "styles": {"background": "#09090B", "text": "#FAFAFA"},
                    }
                ],
            }
        ],
    }


def test_health_ok(api_client, api_base_url):
    response = api_client.get(f"{api_base_url}/api/website-builder/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_create_and_get_project_persistence(api_client, api_base_url, auth_token):
    payload = _build_payload(str(uuid.uuid4())[:8])
    headers = {"Authorization": f"Bearer {auth_token}"}

    create_response = api_client.post(f"{api_base_url}/api/website-builder/projects", json=payload, headers=headers)
    assert create_response.status_code == 200

    created = create_response.json()
    assert created["name"] == payload["name"]
    assert isinstance(created["id"], str)

    get_response = api_client.get(f"{api_base_url}/api/website-builder/projects/{created['id']}", headers=headers)
    assert get_response.status_code == 200

    fetched = get_response.json()
    assert fetched["name"] == payload["name"]
    assert fetched["pages"][0]["sections"][0]["content"]["title"] == "Initial Title"

    cleanup_response = api_client.delete(f"{api_base_url}/api/website-builder/projects/{created['id']}", headers=headers)
    assert cleanup_response.status_code == 200


def test_update_and_get_project_persistence(api_client, api_base_url, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    create_payload = _build_payload(str(uuid.uuid4())[:8])
    create_response = api_client.post(f"{api_base_url}/api/website-builder/projects", json=create_payload, headers=headers)
    assert create_response.status_code == 200
    created = create_response.json()

    created["name"] = f"{created['name']}_Updated"
    created["pages"][0]["name"] = "Landing"
    created["pages"][0]["sections"][0]["content"]["title"] = "Updated Title"

    update_payload = {
        "name": created["name"],
        "description": created["description"],
        "status": created["status"],
        "pages": created["pages"],
    }

    update_response = api_client.put(
        f"{api_base_url}/api/website-builder/projects/{created['id']}",
        json=update_payload,
        headers=headers,
    )
    assert update_response.status_code == 200

    updated = update_response.json()
    assert updated["name"] == created["name"]

    get_response = api_client.get(f"{api_base_url}/api/website-builder/projects/{created['id']}", headers=headers)
    assert get_response.status_code == 200
    fetched = get_response.json()
    assert fetched["pages"][0]["name"] == "Landing"
    assert fetched["pages"][0]["sections"][0]["content"]["title"] == "Updated Title"

    cleanup_response = api_client.delete(f"{api_base_url}/api/website-builder/projects/{created['id']}", headers=headers)
    assert cleanup_response.status_code == 200


def test_delete_and_verify_404(api_client, api_base_url, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = _build_payload(str(uuid.uuid4())[:8])
    create_response = api_client.post(f"{api_base_url}/api/website-builder/projects", json=payload, headers=headers)
    assert create_response.status_code == 200
    project_id = create_response.json()["id"]

    delete_response = api_client.delete(f"{api_base_url}/api/website-builder/projects/{project_id}", headers=headers)
    assert delete_response.status_code == 200
    deleted = delete_response.json()
    assert deleted["success"] is True
    assert deleted["deleted_id"] == project_id

    get_response = api_client.get(f"{api_base_url}/api/website-builder/projects/{project_id}", headers=headers)
    assert get_response.status_code == 404
    assert get_response.json()["detail"] == "Project not found"


def test_list_projects_has_summary_shape(api_client, api_base_url, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = api_client.get(f"{api_base_url}/api/website-builder/projects", headers=headers)
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    if data:
        item = data[0]
        assert isinstance(item["id"], str)
        assert isinstance(item["name"], str)
        assert isinstance(item["page_count"], int)
        assert isinstance(item["section_count"], int)
