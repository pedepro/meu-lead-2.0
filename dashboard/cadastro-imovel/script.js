// Pré-visualização de imagens com toggles
const imagensInput = document.getElementById('imagensInput');
const imagensPreview = document.getElementById('imagensPreview');
const formImovel = document.getElementById('form-imovel');
const loadingOverlay = document.getElementById('loading-overlay');

console.log('Script carregado. Elemento imagensInput encontrado:', imagensInput);
console.log('Elemento imagensPreview encontrado:', imagensPreview);
console.log('Elemento form-imovel encontrado:', formImovel);
console.log('Elemento loading-overlay encontrado:', loadingOverlay);

// Array para manter controle das imagens (com IDs)
let imagensAtuais = [];
let imagensParaExcluir = [];
let imagensEditadas = [];

// Função para exibir notificação personalizada
function mostrarNotificacao(mensagem, tipo = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <i class="material-icons">${tipo === "success" ? "check_circle" : "error"}</i>
        <span>${mensagem}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 100);
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Função para adicionar imagem à pré-visualização
function adicionarImagemPreview(fileOuUrl, index, toggleData = {}, imagemId = null) {
    const div = document.createElement('div');
    div.className = 'image-container';
    div.dataset.index = index;
    if (imagemId) div.dataset.imagemId = imagemId;

    const img = document.createElement('img');
    if (typeof fileOuUrl === 'string') {
        console.log(`Tentando carregar imagem existente no preview: ${fileOuUrl}`);
        const adjustedUrl = fileOuUrl.startsWith('http://cloud.meuleaditapema.com.br') 
            ? fileOuUrl.replace('http://', 'https://')
            : fileOuUrl;
        console.log(`URL ajustada para: ${adjustedUrl}`);
        img.src = adjustedUrl;
        img.onerror = () => console.error(`Erro ao carregar imagem: ${adjustedUrl}`);
        img.onload = () => console.log(`Imagem carregada com sucesso: ${adjustedUrl}`);
    } else {
        console.log(`Carregando nova imagem local: ${fileOuUrl.name}`);
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            console.log(`Pré-visualização local gerada para: ${fileOuUrl.name}`);
        };
        reader.readAsDataURL(fileOuUrl);
    }
    img.alt = `Imagem ${index + 1}`;
    div.appendChild(img);

    const toggleDiv = document.createElement('div');
    toggleDiv.className = 'toggle-container';
    toggleDiv.innerHTML = `
        <label><input type="checkbox" name="imagens[${index}][livre]" ${toggleData.livre ? 'checked' : ''}> Livre</label>
        <label><input type="checkbox" name="imagens[${index}][afiliados]" ${toggleData.afiliados ? 'checked' : ''}> Afiliados</label>
        <label><input type="checkbox" name="imagens[${index}][privado]" ${toggleData.compradores ? 'checked' : ''}> Privado Compradores</label>
    `;

    if (imagemId) {
        const checkboxes = toggleDiv.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (!imagensEditadas.includes(imagemId)) {
                    imagensEditadas.push(imagemId);
                    console.log(`Imagem ID ${imagemId} marcada como editada. Lista atual:`, imagensEditadas);
                }
            });
        });
    }

    div.appendChild(toggleDiv);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-image';
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => {
        console.log(`Removendo imagem localmente: ID ${imagemId}, URL: ${fileOuUrl}`);
        if (imagemId) {
            imagensParaExcluir.push(imagemId);
            console.log(`Imagem ID ${imagemId} marcada para exclusão. Lista atual:`, imagensParaExcluir);
        }
        div.remove();
        imagensAtuais[index] = null;
        atualizarIndices();
    };
    div.appendChild(removeBtn);

    imagensPreview.appendChild(div);
}

// Função para atualizar os índices após remoção
function atualizarIndices() {
    const containers = imagensPreview.querySelectorAll('.image-container');
    containers.forEach((container, newIndex) => {
        container.dataset.index = newIndex;
        const toggles = container.querySelectorAll('input[type="checkbox"]');
        toggles.forEach(toggle => {
            const nameParts = toggle.name.match(/imagens\[\d+\]\[(livre|afiliados|privado)\]/);
            if (nameParts) {
                toggle.name = `imagens[${newIndex}][${nameParts[1]}]`;
            }
        });
    });
    console.log('Índices atualizados. Imagens atuais:', imagensAtuais);
}

// Função para carregar as cidades da API
async function carregarCidades() {
    try {
        const response = await fetch("https://backand.meuleaditapema.com.br/cidades", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Cidades recebidas:', data);

        const selectCidade = document.getElementById('cidade');
        selectCidade.innerHTML = '<option value="">Selecione</option>';

        const cidades = Array.isArray(data) ? data : [];
        if (cidades.length === 0) {
            console.warn('Nenhuma cidade encontrada na resposta da API.');
            return;
        }

        cidades.forEach(cidade => {
            const option = document.createElement('option');
            option.value = cidade.id;
            option.textContent = cidade.name;
            selectCidade.appendChild(option);
        });

        return true; // Indica que as cidades foram carregadas com sucesso
    } catch (error) {
        console.error("Erro ao carregar cidades:", error);
        mostrarNotificacao('Erro ao carregar lista de cidades: ' + error.message, 'error');
        return false;
    }
}

// Função para formatar valor em reais
function formatarReais(input) {
    let valor = input.value.replace(/\D/g, '');
    if (!valor) {
        input.value = '';
        return 0;
    }
    valor = valor.padStart(3, '0');
    const centavos = valor.slice(-2);
    const reais = valor.slice(0, -2) || '0';
    const numeroFormatado = Number(reais + '.' + centavos).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    input.value = numeroFormatado;
    return parseFloat(reais + '.' + centavos);
}

// Função customizada para converter número por extenso
function numeroPorExtenso(valor) {
    const unidades = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const dezenas = ['dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const onzeADezenove = ['onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const centenas = ['cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    function converterMenorQueMil(num) {
        if (num === 0) return '';
        if (num < 10) return unidades[num];
        if (num < 20) return onzeADezenove[num - 11];
        if (num < 100) {
            const dezena = Math.floor(num / 10);
            const unidade = num % 10;
            return unidade === 0 ? dezenas[dezena - 1] : `${dezenas[dezena - 1]} e ${unidades[unidade]}`;
        }
        const centena = Math.floor(num / 100);
        const resto = num % 100;
        if (num === 100) return 'cem';
        return resto === 0 ? centenas[centena - 1] : `${centenas[centena - 1]} e ${converterMenorQueMil(resto)}`;
    }

    function converterNumero(num) {
        if (num === 0) return 'zero';
        let resultado = '';
        const milhoes = Math.floor(num / 1000000);
        const restoMilhoes = num % 1000000;
        const milhares = Math.floor(restoMilhoes / 1000);
        const resto = restoMilhoes % 1000;

        if (milhoes > 0) {
            resultado += milhoes === 1 ? 'um milhão' : `${converterMenorQueMil(milhoes)} milhões`;
            if (restoMilhoes > 0) resultado += ' ';
        }
        if (milhares > 0) {
            resultado += milhares === 1 ? 'mil' : `${converterMenorQueMil(milhares)} mil`;
            if (resto > 0) resultado += ' ';
        }
        if (resto > 0) {
            resultado += converterMenorQueMil(resto);
        }
        return resultado.trim();
    }

    const reais = Math.floor(valor);
    const centavos = Math.round((valor - reais) * 100);
    let texto = '';

    if (reais > 0) {
        texto += converterNumero(reais) + (reais === 1 ? ' real' : ' reais');
    }
    if (centavos > 0) {
        texto += (reais > 0 ? ' e ' : '') + converterNumero(centavos) + (centavos === 1 ? ' centavo' : ' centavos');
    }
    return texto || 'zero reais';
}

// Função para atualizar valor por extenso
function atualizarValorExtenso(inputId, extensoId) {
    const input = document.getElementById(inputId);
    const extenso = document.getElementById(extensoId);
    let valor = input.value.replace(/\D/g, '');
    if (!valor) {
        extenso.textContent = '';
        return;
    }
    valor = valor.padStart(3, '0');
    const centavos = valor.slice(-2);
    const reais = valor.slice(0, -2) || '0';
    const valorNumerico = parseFloat(reais + '.' + centavos);
    if (isNaN(valorNumerico)) {
        extenso.textContent = '';
        return;
    }
    extenso.textContent = numeroPorExtenso(valorNumerico);
}

// Função para carregar os dados do imóvel em modo de edição
async function carregarDadosImovel(editId) {
    try {
        console.log(`Buscando dados do imóvel ${editId}`);
        const response = await fetch(`https://backand.meuleaditapema.com.br/get-imovel/${editId}`);
        const imovel = await response.json();
        console.log('Dados do imóvel recebidos:', imovel);

        if (imovel.error) {
            throw new Error(imovel.error);
        }

        document.getElementById('nome_proprietario').value = imovel.nome_proprietario || '';
        const valorInput = document.getElementById('valor');
        const priceContatoInput = document.getElementById('price_contato');
        valorInput.value = imovel.valor ? Number(imovel.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
        priceContatoInput.value = imovel.price_contato ? Number(imovel.price_contato).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
        document.getElementById('categoria').value = imovel.categoria || '';
        document.getElementById('quartos').value = imovel.quartos || '';
        document.getElementById('banheiros').value = imovel.banheiros || '';
        document.getElementById('metros_quadrados').value = imovel.metros_quadrados || '';
        document.getElementById('vagas_garagem').value = imovel.vagas_garagem || '';
        document.getElementById('andar').value = imovel.andar || '';
        document.getElementById('imovel_pronto').value = imovel.imovel_pronto ? 'sim' : 'nao';
        document.getElementById('mobiliado').value = imovel.mobiliado ? 'sim' : 'nao';
        document.getElementById('endereco').value = imovel.endereco || '';
        document.getElementById('whatsapp').value = imovel.whatsapp || '';
        document.getElementById('tipoSelect').value = imovel.tipo || '';
        document.getElementById('texto_principal').value = imovel.texto_principal || '';
        document.getElementById('descricao').value = imovel.descricao || '';
        document.getElementById('descricao_negociacao').value = imovel.descricao_negociacao || '';
        document.getElementById('estado').value = imovel.estado || ''; // Preenche o campo estado

        // Aguarda o carregamento das cidades antes de definir o valor
        await carregarCidades();
        const selectCidade = document.getElementById('cidade');
        console.log('Valor de imovel.cidade:', imovel.cidade, 'Tipo:', typeof imovel.cidade);
        if (imovel.cidade) {
            selectCidade.value = imovel.cidade;
            if (selectCidade.value !== imovel.cidade.toString()) {
                console.warn(`Cidade ${imovel.cidade} não encontrada nas opções do select. Opções disponíveis:`, Array.from(selectCidade.options).map(opt => opt.value));
            }
        } else {
            console.log('Nenhuma cidade definida para este imóvel.');
        }

        atualizarValorExtenso('valor', 'valorExtenso');
        atualizarValorExtenso('price_contato', 'priceContatoExtenso');

        imagensPreview.innerHTML = '';
        imagensAtuais = imovel.imagens.map(img => ({ url: img.url, id: img.id }));
        console.log('Imagens atuais mapeadas:', imagensAtuais);
        imovel.imagens.forEach((imagem, i) => {
            console.log(`Adicionando imagem ${i} ao preview: ${imagem.url}, ID: ${imagem.id}`);
            adicionarImagemPreview(imagem.url, i, {
                livre: imagem.livre,
                afiliados: imagem.afiliados,
                compradores: imagem.compradores
            }, imagem.id);
        });

        document.getElementById('titulo-form').textContent = 'Editar Imóvel';
        document.getElementById('btn-submit').textContent = 'Salvar Alterações';
    } catch (error) {
        console.error('Erro ao carregar dados do imóvel:', error);
        mostrarNotificacao('Erro ao carregar dados do imóvel: ' + error.message, 'error');
    }
}

async function inicializarTelaCadastroImovel() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('editid');

    const valorInput = document.getElementById('valor');
    const priceContatoInput = document.getElementById('price_contato');

    const newValorInput = valorInput.cloneNode(true);
    const newPriceContatoInput = priceContatoInput.cloneNode(true);
    valorInput.parentNode.replaceChild(newValorInput, valorInput);
    priceContatoInput.parentNode.replaceChild(newPriceContatoInput, priceContatoInput);

    newValorInput.addEventListener('input', () => {
        formatarReais(newValorInput);
        atualizarValorExtenso('valor', 'valorExtenso');
    });

    newPriceContatoInput.addEventListener('input', () => {
        formatarReais(newPriceContatoInput);
        atualizarValorExtenso('price_contato', 'priceContatoExtenso');
    });

    // Adicionar os toggles apenas no modo cadastro (quando não há editId)
    if (!editId) {
        const toggleContainer = document.getElementById('toggle-options-container');
        toggleContainer.innerHTML = `
            <fieldset class="section">
                <legend>Opções de Envio</legend>
                <div class="field-group">
                    <div class="toggle-container">
                        <label>
                            <input type="checkbox" id="enviarEmail" name="enviarEmail"> 
                            Enviar para corretores por email
                        </label>
                    </div>
                    <div class="toggle-container">
                        <label>
                            <input type="checkbox" id="enviarWhatsapp" name="enviarWhatsapp"> 
                            Enviar para corretores por whatsapp
                        </label>
                    </div>
                </div>
            </fieldset>
        `;
    }

    if (editId) {
        await carregarDadosImovel(editId);
    } else {
        await carregarCidades();
        document.getElementById('valorExtenso').textContent = '';
        document.getElementById('priceContatoExtenso').textContent = '';
    }
}

// Pré-visualização de novas imagens
if (imagensInput) {
    imagensInput.addEventListener('change', function(e) {
        console.log('Evento change disparado no input de imagens');
        const files = Array.from(e.target.files);

        console.log('Arquivos selecionados:', files);

        if (!files || files.length === 0) {
            console.log('Nenhum arquivo selecionado.');
            return;
        }

        const proximoIndice = imagensAtuais.length;
        files.forEach((file, i) => {
            if (file.type.startsWith('image/')) {
                imagensAtuais.push({ file });
                adicionarImagemPreview(file, proximoIndice + i);
            }
        });
        imagensInput.value = '';
    });
}

// Enviar ou atualizar imóvel
if (formImovel) {
    formImovel.addEventListener('submit', async function(e) {
        e.preventDefault();

        loadingOverlay.style.display = 'flex';

        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('editid');

        const imovelData = {};
        const elements = document.querySelectorAll('.imovel-cadastro input, .imovel-cadastro select, .imovel-cadastro textarea');
        const imagensToggles = [];

        const imovelProntoValue = document.getElementById('imovel_pronto').value;
        const mobiliadoValue = document.getElementById('mobiliado').value;
        const valorInput = document.getElementById('valor').value;
        const priceContatoInput = document.getElementById('price_contato').value;
        const estadoInput = document.getElementById('estado').value; // Captura o valor do campo estado

        console.log('Valor bruto de imovel_pronto:', imovelProntoValue);
        console.log('Valor bruto de mobiliado:', mobiliadoValue);
        console.log('Valor bruto de estado:', estadoInput);

        // Adicionar os toggles apenas no modo cadastro (quando não há editId)
        if (!editId) {
            imovelData.enviarEmail = document.getElementById('enviarEmail')?.checked || false;
            imovelData.enviarWhatsapp = document.getElementById('enviarWhatsapp')?.checked || false;
        }

        elements.forEach(element => {
            if (element.name === 'imagens') {
                // Ignorar imagens por enquanto
            } else if (element.name === 'imovel_pronto') {
                imovelData.imovel_pronto = imovelProntoValue === 'sim' ? true : false;
            } else if (element.name === 'mobiliado') {
                imovelData.mobiliado = mobiliadoValue === 'sim' ? true : false;
            } else if (element.name === 'valor') {
                imovelData.valor = valorInput ? parseFloat(valorInput.replace(/\./g, '').replace(',', '.')) : '';
            } else if (element.name === 'price_contato') {
                imovelData.price_contato = priceContatoInput ? parseFloat(priceContatoInput.replace(/\./g, '').replace(',', '.')) : '';
            } else if (element.name === 'estado') {
                imovelData.estado = estadoInput || ''; // Inclui o campo estado no imovelData
            } else if (!['enviarEmail', 'enviarWhatsapp'].includes(element.name)) {
                // Evitar sobrescrever os toggles já definidos no modo cadastro
                imovelData[element.name] = element.value || '';
            }
        });

        console.log('Dados do imóvel antes de enviar (JSON):', imovelData);

        const toggles = document.querySelectorAll('.toggle-container input[type="checkbox"]');
        toggles.forEach(toggle => {
            const nameParts = toggle.name.match(/imagens\[(\d+)\]\[(livre|afiliados|privado)\]/);
            if (nameParts) {
                const index = nameParts[1];
                const status = nameParts[2];
                if (!imagensToggles[index]) imagensToggles[index] = {};
                imagensToggles[index][status] = toggle.checked;
            }
        });

        console.log('Estado atual de imagensAtuais antes de salvar:', imagensAtuais);
        console.log('Imagens marcadas para exclusão:', imagensParaExcluir);
        console.log('Imagens marcadas como editadas:', imagensEditadas);
        console.log('Estados dos toggles coletados:', imagensToggles);

        const baseUrl = editId ? `https://backand.meuleaditapema.com.br/imoveis/${editId}` : 'https://backand.meuleaditapema.com.br/imoveis/novo';
        const method = editId ? 'PUT' : 'POST';

        try {
            const imovelResponse = await fetch(baseUrl, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(imovelData)
            });
            const imovelResult = await imovelResponse.json();
            console.log('Resposta do servidor:', imovelResult);

            if (!imovelResult.success) {
                throw new Error(imovelResult.message);
            }

            const imovelId = editId || imovelResult.imovelId;

            if (editId && imagensParaExcluir.length > 0) {
                for (const imagemId of imagensParaExcluir) {
                    console.log(`Tentando excluir imagem ${imagemId} do imóvel ${imovelId}`);
                    const response = await fetch(`https://backand.meuleaditapema.com.br/imoveis/${imovelId}/imagens/${imagemId}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const result = await response.json();
                    console.log(`Resposta da exclusão da imagem ${imagemId}:`, result);
                    if (!result.success) {
                        console.error(`Erro ao excluir imagem ${imagemId}:`, result.message);
                        throw new Error(`Falha ao excluir imagem ID ${imagemId}: ${result.message}`);
                    } else {
                        console.log(`Imagem ${imagemId} excluída com sucesso do banco`);
                    }
                }
                imagensParaExcluir = [];
                console.log('Lista de imagens para exclusão limpa:', imagensParaExcluir);
            }

            if (editId && imagensEditadas.length > 0) {
                const imagensExistentes = imagensAtuais.filter(img => img && img.id && !imagensParaExcluir.includes(img.id));
                for (const img of imagensExistentes) {
                    if (imagensEditadas.includes(img.id)) {
                        const index = imagensAtuais.findIndex(item => item && item.id === img.id);
                        const toggleData = imagensToggles[index];
                        if (toggleData) {
                            const imageData = {
                                url: img.url,
                                livre: toggleData.livre || false,
                                afiliados: toggleData.afiliados || false,
                                compradores: toggleData.privado || false
                            };
                            console.log(`Atualizando toggles da imagem ID ${img.id}:`, imageData);
                            const response = await fetch(`https://backand.meuleaditapema.com.br/imoveis/${imovelId}/imagens/${img.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(imageData)
                            });
                            const result = await response.json();
                            console.log(`Resposta da atualização da imagem ${img.id}:`, result);
                            if (!result.success) {
                                console.error(`Erro ao atualizar imagem ${img.id}:`, result.message);
                            } else {
                                console.log(`Imagem ${img.id} atualizada com sucesso no banco`);
                            }
                        }
                    }
                }
                imagensEditadas = [];
                console.log('Lista de imagens editadas limpa:', imagensEditadas);
            }

            for (let i = 0; i < imagensAtuais.length; i++) {
                if (!imagensAtuais[i]) continue;

                if (imagensAtuais[i].file) {
                    const file = imagensAtuais[i].file;
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', file);

                    console.log(`Enviando imagem ${i + 1}: ${file.name}`);
                    const uploadResponse = await fetch('https://cloud.meuleaditapema.com.br/upload', {
                        method: 'POST',
                        body: uploadFormData
                    });
                    const uploadData = await uploadResponse.json();
                    console.log(`Resposta do upload da imagem ${i + 1}:`, uploadData);

                    if (!uploadData.url) {
                        throw new Error(`Erro ao fazer upload da imagem ${file.name}: URL não retornada`);
                    }

                    const imageData = {
                        url: uploadData.url.replace('http://', 'https://'),
                        livre: imagensToggles[i]?.livre || false,
                        afiliados: imagensToggles[i]?.afiliados || false,
                        compradores: imagensToggles[i]?.privado || false
                    };
                    console.log(`URL ajustada para cadastro: ${imageData.url}`);

                    const imageResponse = await fetch(`https://backand.meuleaditapema.com.br/imoveis/${imovelId}/imagens`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(imageData)
                    });
                    const imageResult = await imageResponse.json();
                    console.log(`Resposta do cadastro da imagem ${i + 1}:`, imageResult);

                    if (!imageResult.success) {
                        console.error(`Erro ao cadastrar imagem ${i + 1}:`, imageResult.message);
                    }
                }
            }

            mostrarNotificacao(editId ? 'Imóvel atualizado com sucesso!' : 'Imóvel cadastrado com sucesso!', 'success');
            setTimeout(() => {
                window.history.pushState({}, document.title, `${window.location.pathname}?session=listaimoveis`);
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Erro ao processar o imóvel:', error);
            mostrarNotificacao(`Erro ao ${editId ? 'atualizar' : 'cadastrar'} imóvel: ${error.message}`, 'error');
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });
}

window.inicializarTelaCadastroImovel = inicializarTelaCadastroImovel;

inicializarTelaCadastroImovel();