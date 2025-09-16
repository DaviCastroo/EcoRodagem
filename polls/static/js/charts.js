// EcoRodagem - Charts JavaScript
// Configuração e inicialização dos gráficos usando Chart.js

// Configurações globais do Chart.js
Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
Chart.defaults.font.size = 12;
Chart.defaults.color = '#6b7280';

// Cores do tema
const colors = {
    primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d'
    },
    fuel: {
        yellow: '#fbbf24',
        red: '#ef4444',
        orange: '#f97316',
        blue: '#3b82f6'
    },
    gray: {
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151'
    }
};

// Função principal para inicializar todos os gráficos
function initializeDashboardCharts() {
    initializeExpenseChart();
    initializeConsumptionChart();
    initializeFuelTypeChart();
    initializeMonthlyTrendChart();
}

// Gráfico de Gastos Mensais
function initializeExpenseChart() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    // Dados de exemplo - substituir por dados reais do backend
    const data = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [{
            label: 'Gastos (R$)',
            data: [850, 920, 780, 1100, 950, 1200, 1050, 980, 1150, 1300, 1100, 1247],
            borderColor: colors.primary[600],
            backgroundColor: createGradient(ctx, colors.primary[600], colors.primary[100]),
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: colors.primary[600],
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: colors.primary[600],
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + context.parsed.y.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: colors.gray[200],
                        drawBorder: false
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    };

    new Chart(ctx, config);
}

// Gráfico de Consumo por Veículo
function initializeConsumptionChart() {
    const ctx = document.getElementById('consumptionChart');
    if (!ctx) return;

    const data = {
        labels: ['Civic', 'Corolla', 'HB20', 'Onix'],
        datasets: [{
            label: 'Consumo (km/L)',
            data: [14.2, 13.8, 12.5, 11.9],
            backgroundColor: [
                colors.primary[500],
                colors.fuel.blue,
                colors.fuel.orange,
                colors.fuel.yellow
            ],
            borderColor: [
                colors.primary[600],
                '#2563eb',
                '#ea580c',
                '#d97706'
            ],
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: colors.primary[600],
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' km/L';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: colors.gray[200],
                        drawBorder: false
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        callback: function(value) {
                            return value + ' km/L';
                        }
                    }
                }
            }
        }
    };

    new Chart(ctx, config);
}

// Gráfico de Tipos de Combustível (Donut)
function initializeFuelTypeChart() {
    const ctx = document.getElementById('fuelTypeChart');
    if (!ctx) return;

    const data = {
        labels: ['Gasolina', 'Etanol', 'Diesel', 'GNV'],
        datasets: [{
            data: [45, 30, 15, 10],
            backgroundColor: [
                colors.fuel.yellow,
                colors.primary[500],
                colors.fuel.blue,
                colors.fuel.red
            ],
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 10
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: colors.primary[600],
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + percentage + '%';
                        }
                    }
                }
            }
        }
    };

    new Chart(ctx, config);
}

// Gráfico de Tendência Mensal (Mini Chart)
function initializeMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart');
    if (!ctx) return;

    const data = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
            data: [12.5, 13.1, 12.8, 13.5, 12.9, 13.2],
            borderColor: colors.primary[600],
            backgroundColor: colors.primary[100],
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        }
    };

    new Chart(ctx, config);
}

// Função auxiliar para criar gradientes
function createGradient(ctx, color1, color2) {
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color1 + '40'); // 25% opacity
    gradient.addColorStop(1, color2 + '10'); // 6% opacity
    return gradient;
}

// Função para atualizar dados dos gráficos (para uso futuro com AJAX)
function updateChartData(chartId, newData) {
    const chart = Chart.getChart(chartId);
    if (chart) {
        chart.data = newData;
        chart.update('active');
    }
}

// Função para redimensionar gráficos
function resizeCharts() {
    Chart.helpers.each(Chart.instances, function(instance) {
        instance.resize();
    });
}

// Event listeners
window.addEventListener('resize', function() {
    setTimeout(resizeCharts, 100);
});

// Função para exportar gráfico como imagem
function exportChart(chartId, filename = 'chart.png') {
    const chart = Chart.getChart(chartId);
    if (chart) {
        const url = chart.toBase64Image();
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
    }
}

// Animações customizadas
const customAnimations = {
    slideIn: {
        x: {
            type: 'number',
            properties: ['x'],
            from: (ctx) => ctx.chart.width,
            to: (ctx) => ctx.element.x
        }
    },
    fadeIn: {
        opacity: {
            type: 'number',
            properties: ['opacity'],
            from: 0,
            to: 1
        }
    }
};

// Configurações responsivas
const responsiveOptions = {
    maintainAspectRatio: false,
    responsive: true,
    onResize: function(chart, size) {
        // Ajustar configurações baseado no tamanho
        if (size.width < 400) {
            chart.options.plugins.legend.display = false;
            chart.options.scales.x.ticks.maxTicksLimit = 6;
        } else {
            chart.options.plugins.legend.display = true;
            chart.options.scales.x.ticks.maxTicksLimit = 12;
        }
    }
};

// Função para criar gráfico de comparação de postos
function createGasStationChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const config = {
        type: 'radar',
        data: {
            labels: ['Preço', 'Qualidade', 'Atendimento', 'Localização', 'Conveniência'],
            datasets: data.map((station, index) => ({
                label: station.name,
                data: station.ratings,
                borderColor: Object.values(colors.fuel)[index],
                backgroundColor: Object.values(colors.fuel)[index] + '20',
                borderWidth: 2,
                pointBackgroundColor: Object.values(colors.fuel)[index],
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    };

    return new Chart(ctx, config);
}

// Função para criar gráfico de eficiência por período
function createEfficiencyChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const config = {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Eficiência (km/L)',
                data: data.efficiency,
                borderColor: colors.primary[600],
                backgroundColor: createGradient(ctx, colors.primary[600], colors.primary[100]),
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }, {
                label: 'Meta',
                data: data.target,
                borderColor: colors.fuel.red,
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value + ' km/L';
                        }
                    }
                }
            }
        }
    };

    return new Chart(ctx, config);
}

// Exportar funções para uso global
window.EcoRodagemCharts = {
    initializeDashboardCharts,
    updateChartData,
    exportChart,
    createGasStationChart,
    createEfficiencyChart,
    resizeCharts
};