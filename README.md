# 🚀 git-to-linkedin

- 🤖 Geração por IA: Analisa o git diff para escrever posts técnicos precisos.
- 📸 Suporte a Imagens: Anexa automaticamente o último print de código da sua pasta.
- 🐶 Integração com Husky: Dispara o menu de publicação milissegundos antes do seu push.
- 🛠️ Configuração Dinâmica: Controle tom de voz, idioma, hashtags e nível de detalhes via JSON.
- 🔄 Sistema de Retry: Lógica robusta para garantir a publicação mesmo com instabilidades na API.

---

## 🛠️ Instalação

Instale globalmente ou como dependência de desenvolvimento no seu projeto:

`npm install @martinezrafael/git-to-linkedin --save-dev`

### Inicialização

Na raiz do seu projeto, execute o comando abaixo para configurar o Husky, as pastas de imagens e o arquivo de configuração:

`npx git-to-linkedin --init`

---

## ⚙️ Configuração

**1. Variáveis de Ambiente**
Crie um arquivo .env na raiz do projeto com suas credenciais:

```
LINKEDIN_ACCESS_TOKEN=LINKEDIN_ACCESS_TOKEN
LINKEDIN_CLIENT_ID=LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET=LINKEDIN_CLIENT_SECRET
LINKEDIN_MEMBER_URN=LINKEDIN_MEMBER_URN
IA_API_KEY=IA_API_KEY
```

**2. Personalização (git-to-linkedin.config.json)**
O arquivo gerado permite ajustar como a IA deve se comportar:

```
{
  "tone": "profissional e técnico",
  "language": "pt-BR",
  "technicalDepth": "intermediário",
  "hashtags": {
    "mode": "mixed",
    "fixed": ["#NodeJS", "#Git"],
    "max": 6
  }
}
```

---

## 🚀 Como usar

1. Faça suas alterações no código e dê um `git commit`.
2. Tire um print da parte interessante e salve na pasta `images-to-linkedin-post/`.
3. Execute `git push`.
4. O menu interativo surgirá no seu terminal:

- `1`: Publica no LinkedIn e segue com o Push.
- `2`: Publica apenas no LinkedIn.
- `3`: Apenas faz o Push (ignora postagem).
- `0`: Cancela tudo.

---

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

---

📝 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
