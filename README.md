# Script de Teste de Carga Simples para Postman

Este documento descreve um script em **JavaScript** desenvolvido para ser executado dentro da aba **"Tests"** do Postman.

O objetivo do script é realizar um **teste de carga leve (Stress Test)**, disparando múltiplas requisições simultâneas (assíncronas) contra um endpoint, algo que o *Collection Runner* padrão do Postman não faz nativamente (ele executa em sequência).

## 📋 Funcionalidades

* **Execução Assíncrona:** Utiliza `pm.sendRequest` para disparar requisições em paralelo, sem esperar a anterior terminar.
* **Herança de Configuração:** Captura automaticamente o método (GET, POST, etc.), URL, Headers e Body da requisição onde o script está inserido.
* **Resolução de Variáveis:** Identifica e substitui variáveis de ambiente/coleção (ex: `{{API_URL}}`, `{{TOKEN}}`) antes de enviar as requisições de carga.
* **Contadores de Status:** Classifica os retornos em:
    * `2xx` (Sucesso)
    * `4xx` (Erro do Cliente)
    * `5xx` (Erro do Servidor)
    * Outros (Erros de rede, timeouts, etc.)
* **Relatório:** Exibe um resumo no **Console do Postman** e na aba **Test Results**.

## 🚀 Como Usar

1.  Abra sua requisição no **Postman**.
2.  Vá até a aba **Tests**.
3.  Cole o código JavaScript completo.
4.  Abra o **Postman Console** (Atalho: `Ctrl + Alt + C` ou `Cmd + Option + C`).
5.  Clique em **Send** na requisição principal.

## ⚙️ Configuração

No início do script, você pode ajustar a quantidade de requisições que deseja disparar:

```javascript
// Configuração do teste de carga
const TOTAL_REQUESTS = 10; // Altere este valor para aumentar a carga
