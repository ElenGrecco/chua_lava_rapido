/**
 * validarcpf.js
 */

function validarCPF(input) {
    var cpf = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    var cpfHelp = document.getElementById('cpfHelp');
    var btnCreate = document.getElementById('btnCreate');

    if (cpf.length === 11 && validarCPFNumerico(cpf)) {
        cpfHelp.style.color = 'green';
        cpfHelp.textContent = 'CPF válido';
        btnCreate.disabled = false; // Habilita o botão "Adicionar"
        input.classList.remove('input-error'); // Remove a classe de erro se o CPF for válido
    } else {
        cpfHelp.style.color = 'red';
        cpfHelp.textContent = 'CPF inválido';
        btnCreate.disabled = true; // Desabilita o botão "Adicionar"
        input.classList.add('input-error'); // Adiciona a classe de erro se o CPF for inválido
    }
}

function validarCPFNumerico(cpf) {
    if (cpf.length !== 11 || !/^\d{11}$/.test(cpf)) return false;

    // Validação do primeiro dígito verificador
    var soma = 0;
    for (var i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    var resto = 11 - (soma % 11);
    var digitoVerificador1 = resto === 10 || resto === 11 ? 0 : resto;
    if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;

    // Validação do segundo dígito verificador
    soma = 0;
    for (var i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    var digitoVerificador2 = resto === 10 || resto === 11 ? 0 : resto;
    if (digitoVerificador2 !== parseInt(cpf.charAt(10))) return false;

    return true;
}