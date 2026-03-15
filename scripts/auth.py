#!/usr/bin/env python3
"""
auth.py - Example authentication script using GITHUB_TOKEN
Demonstrates how to use the token for GitHub API calls.
"""
import os
import sys
import requests

def get_github_token():
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        print("ERROR: GITHUB_TOKEN environment variable not set.")
        print("Please set it in your environment or .env.local")
        sys.exit(1)
    return token

def main():
    token = get_github_token()
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    # Example: Get authenticated user
    resp = requests.get("https://api.github.com/user", headers=headers)
    if resp.status_code == 200:
        user = resp.json()
        print(f"Authenticated as: {user.get('login')} ({user.get('name')})")
        print(f"Public repos: {user.get('public_repos')}")
        print(f"Private repos: {user.get('total_private_repos')}")
    else:
        print(f"Failed to authenticate: {resp.status_code}")
        print(resp.text)
        sys.exit(1)

if __name__ == "__main__":
    main()