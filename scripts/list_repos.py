#!/usr/bin/env python3
"""
list_repos.py - List repositories accessible by the provided GITHUB_TOKEN.

This script queries the GitHub API to list all repositories the authenticated user
has access to (including private ones if the token has appropriate scopes).

Usage:
    export GITHUB_TOKEN=ghp_xxxxxx
    python scripts/list_repos.py
"""

import os
import sys
import requests
from typing import List, Dict, Any

def get_github_token() -> str:
    """Retrieve GitHub token from environment variables."""
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        print("ERROR: GITHUB_TOKEN environment variable is not set.")
        print("Set it with: export GITHUB_TOKEN='your_token_here'")
        print("Or copy config/example.env to .env.local and source it.")
        sys.exit(1)
    return token

def list_repositories(token: str) -> List[Dict[str, Any]]:
    """Fetch all repositories for the authenticated user (including private)."""
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    repos = []
    url = "https://api.github.com/user/repos"
    params = {"per_page": 100, "visibility": "all"}

    while url:
        resp = requests.get(url, headers=headers, params=params)
        if resp.status_code != 200:
            print(f"ERROR: GitHub API returned {resp.status_code}")
            print(resp.json().get("message", "Unknown error"))
            resp.raise_for_status()

        repos.extend(resp.json())
        # Check for pagination
        links = resp.links
        if "next" in links:
            url = links["next"]["url"]
        else:
            url = None

    return repos

def print_repositories(repos: List[Dict[str, Any]]) -> None:
    """Print a simple table of repositories."""
    print(f"\nFound {len(repos)} repositories accessible:\n")
    print(f"{'Name':<30} {'Visibility':<12} {'URL':<40}")
    print("-" * 90)
    for repo in repos:
        name = repo["full_name"]
        visib = repo["visibility"]
        url = repo["html_url"]
        print(f"{name:<30} {visib:<12} {url:<40}")
    print()

def main() -> None:
    token = get_github_token()
    try:
        repos = list_repositories(token)
        print_repositories(repos)
    except requests.RequestException as e:
        print(f"Network error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()