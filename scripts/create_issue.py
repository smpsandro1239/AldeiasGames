#!/usr/bin/env python3
"""
create_issue.py - Script para criar uma issue no repositório do Aldeias Games

Este script demonstra como criar uma issue no repositório GitHub usando o token
GITHUB_TOKEN. Ele inclui tratamento de erros, feedback ao usuário e registro de
log de atividades.
"""

import os
import sys
import requests
import json
from datetime import datetime

def get_github_token():
    """Obtém o token de autenticação do ambiente."""
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        print("ERROR: GITHUB_TOKEN environment variable not set.")
        sys.exit(1)
    return token

def create_issue(repo_full_name, title, body=None, assignee=None, draft=False):
    """
    Cria uma nova issue no repositório especificado.
    
    Args:
        repo_full_name (str): Nome completo do repositório (ex: 'org/repo')
        title (str): Título da issue
        body (str, optional): Corpo da issue
        assignee (str, optional): Login do usuário para atribuir a issue
        draft (bool): Se a issue deve ser criada como rascunho
        
    Returns:
        dict: Dados da issue criada ou mensagem de erro
    """
    token = get_github_token()
    url = f"https://api.github.com/repos/{repo_full_name}/issues"
    headers = {
        "Authorization": f"token {token}",
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json"
    }
    
    payload = {
        "title": title,
        "body": body,
        "draft": draft
    }
    
    if assignee:
        payload["assignee"] = assignee
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 201:
        data = response.json()
        print(f"Issue criada com sucesso!")
        print(f"Número: {data.get('number')}")
        print(f"Título: {data.get('title')}")
        print(f"URL: {data.get('html_url')}")
        return data
    else:
        print(f"Erro ao criar issue (status {response.status_code}):")
        print(response.text)
        sys.exit(1)

def main():
    if len(sys.argv) < 3:
        print("Uso: create_issue.py <repo_full_name> <title> [body] [assignee] [draft]")
        print("Exemplo: create_issue.py org/repo \"Correção de bug\" \"Texto da issue\" user123 false")
        sys.exit(1)
    
    repo_full_name = sys.argv[1]
    title = sys.argv[2]
    body = sys.argv[3] if len(sys.argv) > 3 else ""
    assignee = sys.argv[4] if len(sys.argv) > 4 else None
    draft = sys.argv[5].lower().lower() in ("true", "1", "yes") if len(sys.argv) > 5 else False
    
    try:
        result = create_issue(repo_full_name, title, body, assignee, draft)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Erro inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()