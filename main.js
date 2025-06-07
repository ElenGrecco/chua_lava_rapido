const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')
const mongoose = require('mongoose')
const path = require('node:path')
const { conectar, desconectar } = require("./database.js")
const clientModel = require("./src/models/Clientes.js")
const reciboModel = require('./src/models/Recibo.js')
const { jspdf, default: jsPDF } = require('jspdf')
const fs = require('fs')
const prompt = require('electron-prompt')

let win
const createWindow = () => {
    nativeTheme.themeSource = 'dark'
    win = new BrowserWindow({
        width: 1010,
        height: 720,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    win.loadFile(path.join(__dirname, 'src', 'views', 'index.html'))

    ipcMain.on('client-window', () => {
        clienteWindow()
    })

    ipcMain.on('recibo-window', () => {
        reciboWindow()
    })

}

let client
function clienteWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        client = new BrowserWindow({
            width: 1010,
            height: 650,
            autoHideMenuBar: true,
            resizable: false,
            parent: main,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false
            }
        })
    }
    client.loadFile(path.join(__dirname, 'src', 'views', 'cliente.html'))
    client.center()
}

let reciboScreen
function reciboWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        reciboScreen = new BrowserWindow({
            width: 1010,
            height: 650,
            autoHideMenuBar: true,
            resizable: false,
            parent: main,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false
            }
        })
    }
    reciboScreen.loadFile(path.join(__dirname, 'src', 'views', 'recibo.html'))
    reciboScreen.center()
}

let about
function aboutWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        about = new BrowserWindow({
            width: 800,
            height: 550,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            parent: main,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false
            }
        })
    }

    about.loadFile(path.join(__dirname, 'src', 'views', 'sobre.html'))
}

app.whenReady().then(() => {
    createWindow()

    ipcMain.on('db-connect', async (event) => {
        await conectar()
        setTimeout(() => {
            event.reply('db-status', "conectado")
        }, 500)
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('before-quit', async () => {
    await desconectar()
})

app.commandLine.appendSwitch('log-level', '3')

const template = [
    {
        label: 'Cadastro',
        submenu: [
            {
                label: 'Clientes',
                click: () => clienteWindow()
            },
            {
                label: 'recibo',
                click: () => reciboWindow()
            },
            {
                type: 'separator'
            },
            {
                label: 'Sair',
                accelerator: 'Alt+F4',
                click: () => app.quit()
            }
        ]
    },
    {
        label: 'Relatório',
        submenu: [
            {
                label: 'Clientes',
                click: () => relatorioClientes()
            },
            {
                label: 'veiculo',
                click: () => relatorioReciboporStatus('Veiculo', 'Veiculo', 'recibo_veiculo')
            },
            {
                label: 'modelo',
                click: () => relatorioReciboporStatus('Modelo', 'Modelo', 'recibo_modelo')
            },
            {
                label: 'ano',
                click: () => relatorioReciboporStatus('Ano', 'Ano', 'recibo_aguardando_ano')
            },
            {
                label: 'recibo concluídas',
                click: () => relatorioReciboporStatus('Concluída', 'Concluídas', 'recibo_concluidas')
            },
            {
                label: 'recibo canceladas',
                click: () => relatorioReciboporStatus('Cancelada', 'Canceladas', 'Recibo_canceladas')
            },
            {
                label: 'Todos os Recibos',
                click: () => relatorioTodosRecibos()
            }
        ]
    },
    {
        label: 'Ferramentas',
        submenu: [
            {
                label: 'Aplicar zoom',
                role: 'zoomIn'
            },
            {
                label: 'Reduzir zoom',
                role: 'zoomOut'
            },
            {
                label: 'Restaurar zoom padrão',
                role: 'resetZoom'
            },
            {
                type: 'separator'
            },
            {
                label: 'Recarregar',
                role: 'reload'
            },
            {
                label: 'DevTools',
                role: 'toggleDevTools'
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Repositório',
                click: () => shell.openExternal('https://github.com/ElenGrecco/chua_lava_rapido')
            },
            {
                label: 'Sobre',
                click: () => aboutWindow()
            }
        ]
    }
]

async function relatorioClientes() {
    try {
        const clientes = await clientModel.find().sort({ nomeCliente: 1 })
        const doc = new jsPDF('p', 'mm', 'a4')
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
        doc.addImage(imageBase64, 'PNG', 5, 8)

        doc.setFontSize(26)
        doc.text("Relatório de clientes", 14, 45)

        const dataAtual = new Date().toLocaleDateString('pt-br')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 160, 10)

        let y = 60
        doc.text("Nome", 14, y)
        doc.text("Telefone", 80, y)
        doc.text("Email", 130, y)
        y += 5

        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)

        y += 10
        clientes.forEach((c) => {
            if (y > 280) {
                doc.addPage()
                y = 20
                doc.text("Nome", 14, y)
                doc.text("Telefone", 80, y)
                doc.text("Email", 130, y)
                y += 5
                doc.setLineWidth(0.5)
                doc.line(10, y, 200, y)
                y += 10
            }

            doc.text(String(c.nomeCliente || ''), 14, y)
            doc.text(String(c.foneCliente || ''), 80, y)
            doc.text(String(c.emailCliente || ''), 130, y)
            y += 10
        })

        const paginas = doc.internal.getNumberOfPages()
        for (let i = 1; i <= paginas; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.text(`Páginas ${i} de ${paginas}`, 105, 200, { align: 'center' })
        }

        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, 'clientes.pdf')

        doc.save(filePath)
        shell.openPath(filePath)
    } catch (error) {
        console.log(error)
    }
}

ipcMain.on('search-suggestions', async (event, termo) => {
    try {
        const regex = new RegExp(termo, 'i')
        let sugestoes = await clientModel.find({
            $or: [
                { nomeCliente: regex },
                { cpfCliente: regex }
            ]
        }).limit(10)

        sugestoes = sugestoes.sort((a, b) => a.nomeCliente.localeCompare(b.nomeCliente))

        event.reply('suggestions-found', JSON.stringify(sugestoes))
    } catch (error) {
        console.error("Erro ao buscar sugestões:", error)
    }
})


ipcMain.on('new-client', async (event, client) => {
    try {
        const newClient = new clientModel({
            nomeCliente: client.nameCli,
            cpfCliente: client.cpfCli,
            veiculoCliente: client.veiculoCli,
            foneCliente: client.foneCli,
            anoCliente: client.anoCli,
            modeloCliente: client.modeloCli,
            Cliente: client.numCli,
            
        })
        await newClient.save()

        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Cliente adicionado com sucesso",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })

    } catch (error) {
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "ATENÇÃO!",
                message: "CPF já cadastrado. \n Verfique o número digitado.",
                buttons: ['OK']
            }).then((result) => {
                if (result.response === 0) {
                    event.reply('reset-cpf')
                }
            })
        } else {
            console.log(error)
        }
    }

})

ipcMain.on('search-name', async (event, cliValor) => {

    try {
        const valor = cliValor.trim()
        const cpfRegex = /^\d{11}$/

        const query = cpfRegex.test(valor.replace(/\D/g, ''))
            ? { cpfCliente: new RegExp(valor, 'i') }
            : { nomeCliente: new RegExp(valor, 'i') }

        const client = await clientModel.find(query)

        if (client.length === 0) {
            dialog.showMessageBox({
                type: 'warning',
                title: 'Aviso',
                message: 'Cliente não cadastrado. \nDeseja cadastrar este cliente?',
                defaultId: 0,
                buttons: ['Sim', 'Não']
            }).then((result) => {
                if (result.response === 0) {
                    event.reply('set-name')
                } else {
                    event.reply('reset-form')
                }
            })
        } else {
            event.reply('render-client', JSON.stringify(client))
        }
    } catch (error) {
        console.error("Erro ao buscar cliente:", error)
    }
})

ipcMain.on('update-clientes', async (event, dadosAtualizados) => {
    try {
        const cliente = await clientModel.findOne({ cpfCliente: dadosAtualizados.cpf })
        if (!cliente) {
            dialog.showMessageBox({
                type: 'error',
                title: 'Erro',
                message: 'O CPF não pode ser alterado! Para corrigir esse dado, exclua o cliente e cadastre novamente.',
                buttons: ['OK']
            })
            return
        }

        cliente.nomeCliente = dadosAtualizados.nome
        cliente.cpfCliente = dadosAtualizados.cpf
        cliente.veiculoCliente = dadosAtualizados.veiculo
        cliente.foneCliente = dadosAtualizados.telefone
        cliente.modeloCliente = dadosAtualizados.modelo
        cliente.anoCliente = dadosAtualizados.ano
        cliente.servicoCliente = dadosAtualizados.servico
        

        await cliente.save()

        dialog.showMessageBox({
            type: 'info',
            title: 'Sucesso',
            message: 'Cliente atualizado com sucesso!',
            buttons: ['OK']
        })

        event.reply('reset-form')

    } catch (error) {
        console.log(error)
        dialog.showMessageBox({
            type: 'error',
            title: 'Erro',
            message: 'Ocorreu um erro ao atualizar o cliente.',
            buttons: ['OK']
        })
    }
})

ipcMain.on('delete-client', async (event, cpf) => {
    try {
        const resultado = await clientModel.deleteOne({ cpfCliente: cpf })
        if (resultado.deletedCount > 0) {
            dialog.showMessageBox({
                type: 'info',
                title: 'Exclusão concluída',
                message: 'Cliente excluído com sucesso!'
            })
            event.reply('reset-form')
        } else {
            dialog.showMessageBox({
                type: 'warning',
                title: 'Erro',
                message: 'Cliente não encontrado para exclusão.'
            })
        }
    } catch (erro) {
        console.log(erro)
        dialog.showErrorBox('Erro ao excluir cliente', erro.message)
    }
})


ipcMain.on('search-clients', async (event) => {
    try {
        const clients = await clientModel.find().sort({ nomeCliente: 1 })
        event.reply('list-clients', JSON.stringify(clients))
    } catch (error) {
        console.log(error)
    }
})


ipcMain.on('validate-client', (event) => {
    dialog.showMessageBox({
        type: 'warning',
        title: "Aviso!",
        message: "É obrigatório vincular o cliente na ordem de serviço",
        buttons: ['OK']
    }).then((result) => {
        if (result.response === 0) {
            event.reply('set-search')
        }
    })
})

ipcMain.on('new-recibo', async (event, recibo) => {

    try {
        const newRecibo = new reciboModel({
            idCliente: recibo.idClient_Recibo,
            nomeCliente: recibo.nameClient_Recibo,
            telefoneCliente: recibo.phoneClient_Recibo,
            statusRecibo: recibo.stat_Recibo,
           
            modelo: recibo.model_Recibo,
           
            ano: recibo.ano_Recibo,
            
           servico: recibo.servico_Recibo,
            
            observacao: recibo.obs_Recibo,
            valor: recibo.total_Recibo
        })
        await newRecibo.save()
        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Recibo gerado com sucesso",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })
    } catch (error) {
        console.log(error)
    }
})

ipcMain.on('search-recibo', async (event) => {
    prompt({
        title: 'Buscar Recibo',
        label: 'Digite o número Recibo:',
        inputAttrs: {
            type: 'text'
        },
        type: 'input',
        width: 400,
        height: 200
    }).then(async (result) => {
        if (result !== null) {
            if (mongoose.Types.ObjectId.isValid(result)) {
                try {
                    const dataRecibo = await reciboModel.findById(result)
                    if (dataRecibo) {
                        event.reply('render-recibo', JSON.stringify(dataRecibo))
                    } else {
                        dialog.showMessageBox({
                            type: 'warning',
                            title: "Aviso!",
                            message: "Recibo não encontrada",
                            buttons: ['OK']
                        })
                    }
                } catch (error) {
                    console.log(error)
                }
            } else {
                dialog.showMessageBox({
                    type: 'error',
                    title: "Atenção!",
                    message: "Formato do número do Recibo inválido.\nVerifique e tente novamente.",
                    buttons: ['OK']
                })
            }
        }
    })
})

ipcMain.on('update-recibo', async (event, recibo) => {
    try {
        const atualizada = await reciboModel.findByIdAndUpdate(
            recibo._id,
            {
                idCliente: recibo.idCliente,
                nomeCliente: recibo.nomeCliente,
                telefoneCliente: recibo.telefoneCliente,
                statusRecibo: recibo.statusRecibo,
                veiculo: recibo.veiculo,
                modelo: recibo.modelo,
                ano: recibo.ano,
               
                observacao: recibo.observacao,
                valor: recibo.valor
            },
            { new: true }
        )

        dialog.showMessageBox({
            type: 'info',
            title: 'Aviso',
            message: 'Recibo atualizado com sucesso!',
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })
    } catch (error) {
        console.log(error)
        dialog.showErrorBox('Erro ao atualizar Recibo', error.message)
    }
})

ipcMain.on('delete-recibo', async (event, idRecibo) => {

    try {
        const { response } = await dialog.showMessageBox(reciboScreen, {
            type: 'warning',
            title: "Atenção!",
            message: "Deseja excluir esta ordem de serviço?\nEsta ação não poderá ser desfeita.",
            buttons: ['Cancelar', 'Excluir']
        })
        if (response === 1) {
            const delRecibo = await reciboModel.findByIdAndDelete(idRecibo)
            event.reply('reset-form')
        }
    } catch (error) {
        console.log(error)
    }
})


async function relatorioReciboporStatus(statusDesejado, tituloRelatorio, nomeArquivo) {
    try {
        const reciboFiltradas = await reciboModel.find({ statusRecibo: statusDesejado }).sort({ dataEntrada: -1 })

        const doc = new jsPDF('l', 'mm', 'a4')
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
        doc.addImage(imageBase64, 'PNG', 5, 8)

        doc.setFontSize(26)
        doc.text(`Relatório Recibo - ${tituloRelatorio}`, 14, 45)

        const dataAtual = new Date().toLocaleDateString('pt-br')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 160, 10)

        let y = 60
        doc.setFontSize(12)

        doc.text("Nº Recibo", 10, y)
        doc.text("Nome Cliente", 70, y)
        doc.text("Telefone", 110, y)
        doc.text("Móvel", 160, y)
        doc.text("Problema", 200, y)
        doc.text("Valor", 260, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(5, y, 290, y)
        y += 10

        const formatarValor = (valorStr) => {
            const numero = Number(valorStr.replace(/\./g, '').replace(',', '.')) || 0
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero)
        }

        reciboFiltradas.forEach((o) => {
            if (y > 280) {
                doc.addPage()
                y = 20
                doc.text("Nº Recibo", 10, y)
                doc.text("Nome Cliente", 70, y)
                doc.text("Telefone", 110, y)
                doc.text("Móvel", 160, y)
                doc.text("Problema", 200, y)
                doc.text("Valor", 260, y)
                y += 5
                doc.setLineWidth(0.5)
                doc.line(10, y, 200, y)
                y += 10
            }

            doc.text(String(o._id || ''), 10, y)
            doc.text(String(o.nomeCliente || ''), 70, y)
            doc.text(String(o.telefoneCliente || ''), 110, y)
            doc.text(String(o.movel || ''), 160, y)
            doc.text(String(o.problema || ''), 200, y)
            doc.text(formatarValor(o.valor || '0'), 260, y)
            y += 10
        })

        const paginas = doc.internal.getNumberOfPages()
        for (let i = 1; i <= paginas; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.text(`Página ${i} de ${paginas}`, 105, 200, { align: 'center' })
        }

        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, `${nomeArquivo}.pdf`)
        doc.save(filePath)
        shell.openPath(filePath)
    } catch (error) {
        console.log(error)
    }
}


async function relatorioTodasRecibo() {
    try {
        const reciboList = await reciboModel.find().sort({ dataEntrada: -1 })

        const doc = new jsPDF('l', 'mm', 'a4')
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
        doc.addImage(imageBase64, 'PNG', 5, 8)

        doc.setFontSize(22)
        doc.text(`Relatório Geral de Ordens de Serviço`, 14, 45)

        const dataAtual = new Date().toLocaleDateString('pt-br')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 240, 10)

        let y = 60
        doc.setFontSize(11)

        doc.text("Nº Recibo", 5, y)
        doc.text("Nome Cliente", 60, y)
        doc.text("Telefone", 90, y)
        doc.text("Móvel", 130, y)
        doc.text("Problema", 160, y)
        doc.text("Status", 220, y)
        doc.text("Valor", 270, y)

        y += 5
        doc.setLineWidth(0.5)
        doc.line(5, y, 290, y)
        y += 10

        const formatarValor = (valorStr) => {
            const numero = Number(valorStr.replace(/\./g, '').replace(',', '.')) || 0
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero)
        }

        reciboList.forEach((o) => {
            if (y > 190) {
                doc.addPage()
                y = 20
                doc.text("Nº Recibo", 5, y)
                doc.text("Nome Cliente", 60, y)
                doc.text("Telefone", 90, y)
                doc.text("Móvel", 130, y)
                doc.text("Problema", 160, y)
                doc.text("Status", 220, y)
                doc.text("Valor", 270, y)
                y += 5
                doc.setLineWidth(0.5)
                doc.line(10, y, 285, y)
                y += 10
            }

            doc.text(String(o._id || ''), 5, y)
            doc.text(String(o.nomeCliente || ''), 60, y)
            doc.text(String(o.telefoneCliente || ''), 90, y)
            doc.text(String(o.movel || ''), 130, y)
            doc.text(String(o.problema || ''), 160, y)
            doc.text(String(o.statusRecibo || ''), 220, y)
            doc.text(formatarValor(o.valor || '0'), 270, y)
            y += 10
        })

        const paginas = doc.internal.getNumberOfPages()
        for (let i = 1; i <= paginas; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.text(`Página ${i} de ${paginas}`, 150, 200, { align: 'center' })
        }

        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, `Recibo_todas.pdf`)
        doc.save(filePath)
        shell.openPath(filePath)
    } catch (error) {
        console.log(error)
    }
}
