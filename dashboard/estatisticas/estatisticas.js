async function renderStats() {
    try {
        const response = await fetch('http://localhost:3000/estatisticas-relatorios');
        const { success, data, timestamp } = await response.json();

        if (!success) throw new Error('Erro ao carregar estatísticas');

        const safeValue = (value, fallback = 'N/A') => value !== undefined && value !== null ? value : fallback;

        // Corretores sem pedidos
        document.getElementById('corretores-sem-pedidos-count').textContent = safeValue(data.corretores_sem_pedidos?.length, 0);
        document.getElementById('corretores-sem-pedidos-list').innerHTML = data.corretores_sem_pedidos?.length > 0
            ? data.corretores_sem_pedidos.map(corretor => `<li>${safeValue(corretor.name)} <span class="value">(${new Date(safeValue(corretor.created_at)).toLocaleDateString()})</span></li>`).join('')
            : '<li>Nenhum corretor sem pedidos</li>';

        // Corretores com pedidos
        document.getElementById('corretores-com-pedidos-count').textContent = safeValue(data.corretores_com_pedidos?.length, 0);
        document.getElementById('corretores-com-pedidos-list').innerHTML = data.corretores_com_pedidos?.length > 0
            ? data.corretores_com_pedidos.map(corretor => `<li>${safeValue(corretor.name)} <span class="value">${safeValue(corretor.total_pedidos, 0)} pedidos</span></li>`).join('')
            : '<li>Nenhum corretor com pedidos</li>';

        // Corretores com pedidos pendentes
        document.getElementById('corretores-pendentes-count').textContent = safeValue(data.corretores_com_pedidos_pendentes?.length, 0);
        document.getElementById('corretores-pendentes-list').innerHTML = data.corretores_com_pedidos_pendentes?.length > 0
            ? data.corretores_com_pedidos_pendentes.map(corretor => `<li>${safeValue(corretor.name)} <span class="value">${safeValue(corretor.pedidos_pendentes, 0)} pendentes</span></li>`).join('')
            : '<li>Nenhum corretor com pendentes</li>';

        // Corretores com mais de 1 pedido
        document.getElementById('corretores-mais-um-pedido-count').textContent = safeValue(data.corretores_com_mais_de_um_pedido?.length, 0);
        document.getElementById('corretores-mais-um-pedido-list').innerHTML = data.corretores_com_mais_de_um_pedido?.length > 0
            ? data.corretores_com_mais_de_um_pedido.map(corretor => `<li>${safeValue(corretor.name)} <span class="value">${safeValue(corretor.total_pedidos, 0)} pedidos</span></li>`).join('')
            : '<li>Nenhum corretor com mais de 1 pedido</li>';

        // Pedidos finalizados
        document.getElementById('pedidos-finalizados').textContent = safeValue(data.pedidos_finalizados, 0);

        // Melhores corretores
        document.getElementById('melhores-corretores-list').innerHTML = data.melhores_corretores?.length > 0
            ? data.melhores_corretores.map(corretor => `<li>${safeValue(corretor.name)} <span class="value">${safeValue(corretor.pedidos_finalizados, 0)} finalizados</span></li>`).join('')
            : '<li>Nenhum corretor disponível</li>';

        // Pedidos últimos 30 dias
        document.getElementById('pedidos-30-dias').textContent = safeValue(data.pedidos_ultimos_30_dias?.length, 0);
        document.getElementById('pedidos-30-dias-list').innerHTML = data.pedidos_ultimos_30_dias?.length > 0
            ? data.pedidos_ultimos_30_dias.map(pedido => `
                <li>
                    <span class="sku">SKU ${safeValue(pedido.id)}</span>
                    <span class="details">${safeValue(pedido.corretor_name)} - R$ ${safeValue(pedido.valor, 0).toFixed(2)} - ${new Date(safeValue(pedido.data)).toLocaleDateString()}</span>
                </li>
            `).join('')
            : '<li>Nenhum pedido nos últimos 30 dias</li>';

        // Novos corretores últimos 30 dias
        document.getElementById('novos-corretores-count').textContent = safeValue(data.novos_corretores_ultimos_30_dias?.length, 0);
        document.getElementById('novos-corretores-list').innerHTML = data.novos_corretores_ultimos_30_dias?.length > 0
            ? data.novos_corretores_ultimos_30_dias.map(corretor => `<li>${safeValue(corretor.name)} <span class="value">(${new Date(safeValue(corretor.created_at)).toLocaleDateString()})</span></li>`).join('')
            : '<li>Nenhum novo corretor</li>';

        // Clientes cadastrados por IA últimos 30 dias
        document.getElementById('clientes-ia-30-dias').textContent = safeValue(data.clientes_cadastrados_por_ia_ultimos_30_dias, 0);

        // Timestamp
        document.getElementById('timestamp').textContent = new Date(safeValue(timestamp)).toLocaleString();

        // Configuração do gráfico
        const ctx = document.getElementById('faturamento-chart').getContext('2d');
        let chart;

        async function updateChart(groupBy) {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(endDate.getMonth() - 3); // Últimos 3 meses por padrão

            const chartResponse = await fetch(`http://localhost:3000/pedidos-por-intervalo?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&groupBy=${groupBy}`);
            const chartData = await chartResponse.json();

            if (!chartData.success) throw new Error('Erro ao carregar dados do gráfico');

            const labels = chartData.data.map(item => item.periodo);
            const valores = chartData.data.map(item => item.faturamento);

            if (chart) chart.destroy(); // Destroi o gráfico anterior, se existir

            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Faturamento (R$)',
                        data: valores,
                        backgroundColor: '#1877f2',
                        borderColor: '#1877f2',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Faturamento (R$)' }
                        },
                        x: {
                            title: { display: true, text: groupBy === 'day' ? 'Dia' : groupBy === 'week' ? 'Semana' : 'Mês' }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => `R$ ${context.parsed.y.toFixed(2)}`
                            }
                        }
                    }
                }
            });
        }

        // Inicializa o gráfico com "day" como padrão
        await updateChart('day');

        // Listener para mudar o agrupamento
        document.getElementById('chart-group-by').addEventListener('change', (e) => {
            updateChart(e.target.value);
        });

    } catch (error) {
        console.error('Erro ao renderizar estatísticas:', error);
        document.querySelector('.stats-container').innerHTML = `<p>Erro ao carregar estatísticas: ${error.message}</p>`;
    }
}

renderStats();