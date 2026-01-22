// teste de carga
const TOTAL_REQUESTS = 10;

// Contadores de respostas
let count2xx = 0;
let count4xx = 0;
let count5xx = 0;
let countOther = 0;
let completedRequests = 0;

// Captura a URL, método, headers e body da requisição atual
const currentRequest = pm.request;
const requestUrl = currentRequest.url.toString();
const requestMethod = currentRequest.method;

// Monta os headers, substituindo variáveis
const requestHeaders = {};
currentRequest.headers.each((header) => {
  if (!header.disabled) {
    let value = header.value;
    // Substitui {{TOKEN}} pelo valor da variável
    if (value.includes("{{TOKEN}}")) {
      value = value.replace(
        "{{TOKEN}}",
        pm.environment.get("TOKEN") ||
          pm.collectionVariables.get("TOKEN") ||
          pm.globals.get("TOKEN") ||
          "",
      );
    }
    requestHeaders[header.key] = value;
  }
});

// Adiciona Authorization se não existir nos headers
if (!requestHeaders["Authorization"] && !requestHeaders["authorization"]) {
  const token =
    pm.environment.get("TOKEN") ||
    pm.collectionVariables.get("TOKEN") ||
    pm.globals.get("TOKEN");
  if (token) {
    requestHeaders["Authorization"] = "Bearer " + token;
  }
}

// Captura o body se existir
let requestBody = undefined;
if (currentRequest.body && currentRequest.body.raw) {
  requestBody = currentRequest.body.raw;
}

// Resolve a URL substituindo variáveis
let resolvedUrl = requestUrl;
if (resolvedUrl.includes("{{API_URL}}")) {
  const apiUrl =
    pm.environment.get("API_URL") ||
    pm.collectionVariables.get("API_URL") ||
    pm.globals.get("API_URL") ||
    "";
  resolvedUrl = resolvedUrl.replace("{{API_URL}}", apiUrl);
}

// Função para processar resposta
function processResponse(err, response) {
  completedRequests++;

  if (err) {
    countOther++;
  } else {
    const statusCode = response.code;
    if (statusCode >= 200 && statusCode < 300) {
      count2xx++;
    } else if (statusCode >= 400 && statusCode < 500) {
      count4xx++;
    } else if (statusCode >= 500 && statusCode < 600) {
      count5xx++;
    } else {
      countOther++;
    }
  }

  // Quando todas as requisições completarem, exibe o resumo
  if (completedRequests === TOTAL_REQUESTS) {
    console.log("=== RESUMO DO TESTE DE CARGA ===");
    console.log("Total de requisições: " + TOTAL_REQUESTS);
    console.log("Respostas 2xx (sucesso): " + count2xx);
    console.log("Respostas 4xx (erro cliente): " + count4xx);
    console.log("Respostas 5xx (erro servidor): " + count5xx);
    console.log("Outras/Erros: " + countOther);

    pm.test(
      "Resumo do Teste de Carga: " +
        TOTAL_REQUESTS +
        " requisições - 2xx: " +
        count2xx +
        ", 4xx: " +
        count4xx +
        ", 5xx: " +
        count5xx +
        ", Outros: " +
        countOther,
      function () {
        pm.expect(completedRequests).to.eql(TOTAL_REQUESTS);
      },
    );
  }
}

// Dispara todas as requisições de forma assíncrona (praticamente ao mesmo tempo)
console.log(
  "Disparando " + TOTAL_REQUESTS + " requisições para: " + resolvedUrl,
);

for (let i = 0; i < TOTAL_REQUESTS; i++) {
  const requestConfig = {
    url: resolvedUrl,
    method: requestMethod,
    header: requestHeaders,
  };

  if (requestBody) {
    requestConfig.body = {
      mode: "raw",
      raw: requestBody,
    };
  }

  pm.sendRequest(requestConfig, processResponse);
}
