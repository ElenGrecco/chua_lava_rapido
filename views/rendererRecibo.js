// --- ELEMENTOS DE INTERFACE DO CLIENTE ---
const input = document.getElementById('inputSearchClient')               // Campo de busca de cliente
const suggestionList = document.getElementById('viewListSuggestion')    // Lista de sugestões visuais
let idClient = document.getElementById('inputIdClient')                 // Campo ID cliente oculto
let nameClient = document.getElementById('inputNameClient')            // Nome do cliente
let phoneClient = document.getElementById('inputPhoneClient')          // Telefone do cliente

let arrayClients = [] // Armazena clientes carregados para filtrar localmente

// Ao digitar no campo de busca de cliente
input.addEventListener('input', () => {
    const search = input.value.toLowerCase()
    suggestionList.innerHTML = "" // Limpa sugestões anteriores

    api.searchClients() // Apenas trigger visual no backend

    // Busca todos os clientes e filtra localmente
    api.listClients((event, clients) => {
        const listaClientes = JSON.parse(clients)
        arrayClients = listaClientes

        // Filtra por nome, até 10 resultados
        const results = arrayClients.filter(c =>
            c.nomeCliente && c.nomeCliente.toLowerCase().includes(search)
        ).slice(0, 10)

        suggestionList.innerHTML = "" // Limpa sugestões novamente

        // Cria sugestões clicáveis
        results.forEach(c => {
            const item = document.createElement('li')
            item.classList.add('list-group-item', 'list-group-item-action')
            item.textContent = c.nomeCliente

            item.addEventListener('click', () => {
                idClient.value = c._id
                nameClient.value = c.nomeCliente
                phoneClient.value = c.foneCliente
                input.value = ""
                suggestionList.innerHTML = ""
            })

            suggestionList.appendChild(item)
        })
    })
})

// Atalho do backend para focar no campo de busca
api.setSearch(() => {
    input.focus()
})

// Oculta sugestões ao clicar fora
document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestionList.contains(e.target)) {
        suggestionList.innerHTML = ""
    }
})

// Desativa botões ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
})

// --- ELEMENTOS DE INTERFACE DO RECIBO / ORDEM DE SERVIÇO ---
let frmRecibo = document.getElementById('frmRecibo')
let statusRecibo = document.getElementById('inputStatus')
let veiculo = document.getElementById('inputVeiculo')
let modelo = document.getElementById('inputModelo')
let ano = document.getElementById('inputano')
let servico = document.getElementById('inputservico')
let obs = document.getElementById('inputObs')
let total = document.getElementById('inputTotal')
let idRecibo = document.getElementById('inputRecibo')
let dateRecibo = document.getElementById('inputData')

// Função para resetar o formulário (via reload)
function resetForm() {
    location.reload()
}

// Atalho do backend para resetar
api.resetForm(() => {
    resetForm()
})

// Cria novo recibo
function criarRecibo() {
    const recibo = {
        idCliente: idClient.value,
        nomeCliente: nameClient.value,
        telefoneCliente: phoneClient.value,
        statusRecibo: statusRecibo.value,
        veiculo: veiculo.value,
        modelo: modelo.value,
        ano: ano.value,
        servico: servico.value,
        date: dateRecibo.value,
        observacao: obs.value,
        valor: total.value
    }
    api.newRecibo(recibo)
}

// Requisição para buscar recibo (para edição)
function findRecibo() {
    api.searchRecibo()
}

// Preenche formulário com os dados do recibo retornado
api.renderRecibo((event, dataRecibo) => {
    const recibo = JSON.parse(dataRecibo)
    idRecibo.value = recibo._id

    const data = new Date(recibo.dataEntrada)
    const formatada = data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    })
    dateRecibo.value = formatada

    idClient.value = recibo.idCliente
    nameClient.value = recibo.nomeCliente || ""
    phoneClient.value = recibo.telefoneCliente || ""
    statusRecibo.value = recibo.statusRecibo
    veiculo.value = recibo.veiculo
    modelo.value = recibo.modelo
    ano.value = recibo.ano
    servico.value = recibo.servico
    obs.value = recibo.observacao
    total.value = recibo.valor

    btnCreate.disabled = true
    btnUpdate.disabled = false
    btnDelete.disabled = false
})

// Atualiza recibo existente
function atualizarRecibo() {
    const reciboEditado = {
        _id: idRecibo.value,
        idCliente: idClient.value,
        nomeCliente: nameClient.value,
        telefoneCliente: phoneClient.value,
        statusRecibo: statusRecibo.value,
        veiculo: veiculo.value,
        modelo: modelo.value,
        ano: ano.value,
        servico: servico.value,
        date: dateRecibo.value,
        observacao: obs.value,
        valor: total.value
    }
    api.updateRecibo(reciboEditado)
}

// Submissão do formulário
frmRecibo.addEventListener('submit', (event) => {
    event.preventDefault()

    if (idClient.value === "") {
        api.validateClient()
        return
    }

    if (idRecibo.value === "") {
        criarRecibo()
    } else {
        atualizarRecibo()
    }
})

// Remove recibo
function removeRecibo() {
    api.deleteRecibo(idRecibo.value)
}

// --- IMPRESSÃO DO RECIBO ---
const btnPrintRecibo = document.getElementById('btnPrintRecibo')

btnPrintRecibo.addEventListener('click', () => {
    if (!idRecibo.value) {
        alert("Nenhum Recibo carregado para impressão!")
        return
    }
    imprimirRecibo()
})

// Gera o HTML da impressão
function imprimirRecibo() {
    const conteudo = `
        <html>
        <head>
            <title>Ordem de Serviço - ${idRecibo.value}</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; margin: 40px; color: #333; }
                h1 { text-align: center; color: #005B8F; }
                .section { margin-bottom: 25px; padding-bottom: 10px; border-bottom: 1px dashed #aaa; }
                .label { font-weight: 600; width: 180px; display: inline-block; }
                .termos { font-size: 11px; margin-top: 40px; border-top: 1px dashed #aaa; padding-top: 20px; }
                .termos h3 { font-size: 14px; color: #005B8F; margin-bottom: 8px; }
            </style>
        </head>
        <body>
            <h1>Ordem de serviço - MobiTech</h1>
            <div class="section">
                <div><span class="label">Número Recibo:</span> ${idRecibo.value}</div>
                <div><span class="label">Data:</span> ${dateRecibo.value}</div>
                <div><span class="label">Status:</span> ${statusRecibo.value}</div>
            </div>
            <div class="section">
                <div><span class="label">Cliente ID:</span> ${idClient.value}</div>
                <div><span class="label">Nome do Cliente:</span> ${nameClient.value}</div>
                <div><span class="label">Telefone:</span> ${phoneClient.value}</div>
            </div>
            <div class="section">
                <div><span class="label">Veículo:</span> ${veiculo.value}</div>
                <div><span class="label">Modelo:</span> ${modelo.value}</div>
                <div><span class="label">Ano:</span> ${ano.value}</div>
                <div><span class="label">Serviço:</span> ${servico.value}</div>
            </div>
            <div class="section">
                <div><span class="label">Observação:</span> ${obs.value}</div>
            </div>
            <div class="section">
                <div><span class="label">Total:</span> R$ ${total.value}</div>
            </div>
            <div style="text-align:center; margin-top: 50px;">
                <p>Assinatura do Cliente: ___________________________</p>
            </div>
            <div class="termos">
                <h3>Termo de Serviço e Garantia</h3>
                <p>O serviço descrito nesta ordem foi executado conforme especificações fornecidas pelo cliente. A conferência prévia do local de execução e condições do serviço é responsabilidade do contratante.</p>
                <p>A garantia cobre exclusivamente defeitos no serviço prestado e não cobre mau uso ou alterações posteriores sem autorização técnica.</p>
                <p>O prazo de garantia é de <strong>90 dias</strong>, conforme o Código de Defesa do Consumidor.</p>
                <p>Ao assinar, o cliente declara estar ciente e de acordo com os termos acima.</p>
            </div>
        </body>
        </html>
    `
    let janelaPrint = window.open('', '', 'width=800,height=600')
    janelaPrint.document.write(conteudo)
    janelaPrint.document.close()
    janelaPrint.focus()
    janelaPrint.print()
    janelaPrint.close()
}
