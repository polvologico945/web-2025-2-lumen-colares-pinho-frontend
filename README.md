# Lumen - Rede Social

Lumen é uma rede social moderna, com foco em feed de notícias, perfil de usuário, dashboard com estatísticas e funcionalidades adicionais, como horários de ônibus e notícias que expiram. O projeto utiliza React, React Router e CSS moderno baseado em variáveis globais.

## Funcionalidades

- Login e registro de usuários  
- Feed de posts com detalhes individuais  
- Perfil de usuário com informações e avatar  
- Dashboard com cards e listas de atividades  
- Menu lateral com tópicos como Horários dos Ônibus e Notícias  
- Notícias expiram automaticamente após a data de validade  
- Layout responsivo para desktop e mobile  
- Temas e cores configuráveis via CSS global  

## Estrutura do projeto

- `/src/pages` – Páginas do projeto (Login, Register, Feed, Dashboard, Bus, Noticia, UserProfile, PostDetails)  
- `/src/components` – Componentes reutilizáveis (NavBar, SideMenu, DashCard, etc.)  
- `/src/styles/global.css` – CSS global com variáveis e estilização base  
- `/src/data/noticias.js` – Dados simulados de notícias (para testes)  

## ⚡ Como rodar o projeto

1. Clonar o repositório:
```bash
git clone https://github.com/polvologico945/web-2025-2-lumen-colares-pinho-frontend.git
cd lumen

Depois:

npm install
# ou
yarn

Depois:

npm run dev
# ou
yarn dev

Depois:

Acesse http://localhost:5173 ou pressione Ctrl + Click no link.

