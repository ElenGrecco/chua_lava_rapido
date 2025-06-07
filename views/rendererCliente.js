// Aplica máscara de telefone conforme o número digitado
function mascaraTelefone(input) {
    let valor = input.value.replace(/\D/g, '') // Remove tudo que não for dígito

    if (valor.length <= 2) {
        input.value = `(${valor}` // Se tem até 2 dígitos, adiciona parêntese de abertura
    } else if (valor.length <= 6) {
        input.value = `(${valor.substring(0, 2)}) ${valor.substring(2)}` // Adiciona DDD e separação
    } else {
        input.value = `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7, 11)}` // Formato completo (XX) XXXXX-XXXX
    }
}

// Valida CPF com base nos dígitos verificadores
function validarCPF(input) {
    var cpf = input.value.replace(/\D/g, '') // Remove caracteres não numéricos

    // Verifica se tem 11 dígitos ou todos iguais (inválido)
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        input.setCustomValidity("CPF inválido!")
        return false
    }

    var soma = 0
    var peso = 10

    // Calcula o primeiro dígito verificador
    for (var i = 0; i < 9; i++) {
        soma += cpf[i] * peso
        peso--
    }
    var resto = soma % 11
    var primeiroDigito = (resto < 2) ? 0 : 11 - resto

    // Calcula o segundo dígito verificador
    soma = 0
    peso = 11
    for (var i = 0; i < 10; i++) {
        soma += cpf[i] * peso
        peso--
    }
    resto = soma % 11
    var segundoDigito = (resto < 2) ? 0 : 11 - resto

    // Compara os dígitos
    if (cpf[9] == primeiroDigito && cpf[10] == segundoDigito) {
        input.setCustomValidity("")
        return true
    } else {
        input.setCustomValidity("CPF inválido!")
        return false
    }
}

let arrayClient = [] // Lista auxiliar de clientes (não usada diretamente aqui)

const foco = document.getElementById('searchClient') // Input de busca

// Referências aos campos do formulário
let frmClient = document.getElementById("frmClient")
let nameClient = document.getElementById("inputNameClient")
let cpfClient = document.getElementById("inputCPFClient")
let veiculoClient = document.getElementById("inputVeiculoClient")
let foneClient = document.getElementById("inputIPhoneClient")
let modeloClient = document.getElementById("inputModeloClient")
let anoClient = document.getElementById("inputAnoClient")
const btnUpdate = document.getElementById('btnUpdate') // Botão de atualizar
const btnCreate = document.getElementById('btnCreate') // Botão de criar
const btnDelete = document.getElementById('btnDelete') // Botão de deletar
const searchInput = document.getElementById('searchClient') // Input de busca
const suggestionList = document.getElementById('suggestionList') // Lista de sugestões

// Ao carregar o DOM, configura estado inicial dos botões e foca no campo
document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    btnCreate.disabled = false
    foco.focus()
})

// Permite buscar cliente pressionando Enter
function teclaEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        buscarCliente()
    }
}

// Remove o evento de tecla Enter do formulário
function restaurarEnter() {
    frmClient.removeEventListener("keydown", teclaEnter)
}

// Adiciona o evento da tecla Enter no formulário
frmClient.addEventListener("keydown", teclaEnter)

// Reseta o formulário recarregando a página
function resetForm() {
    location.reload()
}

// Escuta comando da API para resetar o formulário
api.resetForm(() => {
    resetForm()
})

// Evento da API para limpar CPF e focar no campo
window.electron.onReceiveMessage('reset-cpf', () => {
    cpfClient.value = ""
    cpfClient.focus()
    cpfClient.style.border = '2px solid red' // Indica erro com borda vermelha
})

// Envio do formulário de cliente
frmClient.addEventListener('submit', async (event) => {
    event.preventDefault()

    // Validação nativa do HTML (caso existam regras nos inputs)
    if (!frmClient.checkValidity()) {
        frmClient.reportValidity()
        return
    }

    const client = {
        nameCli: nameClient.value,
        cpfCli: cpfClient.value,
        veiculoCli: veiculoClient.value,
        foneCli: foneClient.value,
        modeloCli: modeloClient.value,
        anoCli: anoClient.value
    }

    api.newClient(client) // Envia cliente para API
})

// Preenche automaticamente campos com base na busca
api.setName(() => {
    const busca = searchInput.value.trim()
    const cpfRegex = /^\d{11}$/
    foco.value = ""

    if (cpfRegex.test(busca.replace(/\D/g, ''))) {
        cpfClient.value = busca
        cpfClient.focus()
    } else {
        nameClient.value = busca
        nameClient.focus()
    }
})

// Função principal de busca do cliente no banco/API
function buscarCliente() {
    // Limpa campos do formulário
    nameClient.value = ''
    cpfClient.value = ''
    veiculoClient.value = ''
    foneClient.value = ''
    modeloClient.value = ''
    anoClient.value = ''

    // Reseta estado dos botões
    btnCreate.disabled = false
    btnUpdate.disabled = true
    btnDelete.disabled = true

    const cliValor = searchInput.value.trim()

    if (cliValor === "") {
        api.validateSearch() // Valida campo vazio
    } else {
        api.searchName(cliValor) // Envia valor para buscar na API

        // Quando retornar os dados do cliente, preenche o formulário
        api.renderClient((event, client) => {
            const clientData = JSON.parse(client)

            if (clientData.length > 0) {
                clientData.forEach((c) => {
                    nameClient.value = c.nomeCliente
                    cpfClient.value = c.cpfCliente
                    veiculoClient.value = c.veiculoCliente
                    foneClient.value = c.foneCliente
                    modeloClient.value = c.modeloCliente
                    anoClient.value = c.anoCliente

                    restaurarEnter()
                    btnCreate.disabled = true
                    btnUpdate.disabled = false
                    btnDelete.disabled = false
                })
            }
        })
    }
}

// Preenche formulário com dados do cliente (pode ser usado externamente)
function preencherFormulario(c) {
    nameClient.value = c.nomeCliente
    cpfClient.value = c.cpfCliente
    veiculoClient.value = c.veiculoCliente
    foneClient.value = c.foneCliente
    modeloClient.value = c.modeloCliente
    anoClient.value = c.anoCliente

    btnUpdate.disabled = false
}

// Atualiza os dados do cliente
btnUpdate.addEventListener('click', (event) => {
    event.preventDefault()

    const dadosAtualizados = {
        nome: nameClient.value,
        cpf: cpfClient.value,
        veiculo: veiculoClient.value,
        telefone: foneClient.value,
        modelo: modeloClient.value,
        ano: anoClient.value
    }

    api.updateClientes(dadosAtualizados)
})

// Exclui o cliente após confirmação
function excluirCliente() {
    const cpf = cpfClient.value

    if (confirm("Tem certeza que deseja excluir este cliente?")) {
        api.deleteClient(cpf)
    }
}

// Busca sugestões conforme digita no input
searchInput.addEventListener('input', () => {
    const busca = searchInput.value.trim()

    if (busca.length >= 1) {
        api.buscarSugestoes(busca) // Busca sugestões na API
    } else {
        suggestionList.innerHTML = "" // Limpa sugestões se input vazio
    }
})

// Renderiza as sugestões no DOM
api.retornarSugestoes((event, sugestoes) => {
    suggestionList.innerHTML = ""
    const lista = JSON.parse(sugestoes)

    lista.forEach(cli => {
        const li = document.createElement('li')
        li.textContent = `${cli.nomeCliente} (${cli.cpfCliente})`

        // Ao clicar na sugestão, busca cliente com o CPF
        li.addEventListener('click', () => {
            searchInput.value = cli.cpfCliente
            suggestionList.innerHTML = ""
            buscarCliente()
        })

        suggestionList.appendChild(li)
    })
})

// Oculta sugestões ao clicar fora
document.addEventListener('click', (e) => {
    if (!suggestionList.contains(e.target) && e.target !== searchInput) {
        suggestionList.innerHTML = ""
    }
})
