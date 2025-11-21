
import pytest
from fastapi.testclient import TestClient
import src.app as appmod

client = TestClient(appmod.app)

@pytest.fixture(autouse=True)
def reset_activities():
    appmod.activities.clear()
    appmod.activities.update(appmod.get_initial_activities())

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "Programming Class" in data


def test_signup_for_activity():
    email = "pytestuser@mergington.edu"
    activity = "Chess Club"
    # 事前に参加者を削除（テストの独立性確保）
    client.delete(f"/activities/{activity}/remove?email={email}")
    # 正常登録
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]
    # 二重登録はエラー
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]


def test_remove_participant():
    email = "pytestuser@mergington.edu"
    activity = "Chess Club"
    # 事前に参加者を削除（テストの独立性確保）
    client.delete(f"/activities/{activity}/remove?email={email}")
    # 事前に参加者を追加
    client.post(f"/activities/{activity}/signup?email={email}")
    # 参加者削除
    response = client.delete(f"/activities/{activity}/remove?email={email}")
    assert response.status_code == 200
    assert f"Removed {email} from {activity}" in response.json()["message"]
    # 存在しない参加者削除はエラー
    response = client.delete(f"/activities/{activity}/remove?email={email}")
    assert response.status_code == 404
    assert "Participant not found" in response.json()["detail"]
