function client() {
    // Função chamada ao clicar no botão "Clientes"
    // Chama a função 'clientWindow()' da API exposta no preload.js (provavelmente abre uma nova janela de clientes)
    api.clientWindow()
}

function recibo() {
    // Função chamada ao clicar no botão relacionado a "Recibo"
    // Chama a função 'reciboWindow()' da API exposta no preload.js (abre janela de ordens de serviço)
    api.reciboWindow()
}

// Ouve o status da conexão com o banco de dados através da API do preload
api.dbStatus((event, message) => {
    
    // Verifica se a mensagem recebida indica que está "conectado"
    if (message === "conectado") {
        // Se conectado, altera o ícone para mostrar "DB Online"
        document.getElementById('statusdb').src = "../public/img/dbon.png"
    } else {
        // Caso contrário, mostra o ícone de "DB Offline"
        document.getElementById('statusdb').src = "../public/img/dboff.png"
    }
})
