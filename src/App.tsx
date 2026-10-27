/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  Car,
  Home,
  Tv,
  HeartPulse,
  Briefcase,
  ShoppingBag,
  Coffee,
  Bell,
  Eye,
  EyeOff,
  Calendar,
  Search,
  Filter,
  Check,
  X,
  Trash2,
  Sparkles,
  PieChart,
  Copy,
  FileCode,
  Layers,
  ChevronDown,
  ArrowRight,
  Bot,
  Tag,
  Zap,
  Loader2,
  Info,
  ShieldCheck,
  Send,
  Activity,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

// =============================================================================
// TIPOS E CONFIGURAÇÃO DE CATEGORIAS
// =============================================================================

export type TransactionType = 'receita' | 'despesa';

export interface CategoryInfo {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  bgLight: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod?: string;
  tag?: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  alimentacao: {
    id: 'alimentacao',
    name: 'Alimentação',
    icon: Utensils,
    color: '#F59E0B',
    bgLight: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  transporte: {
    id: 'transporte',
    name: 'Transporte',
    icon: Car,
    color: '#3B82F6',
    bgLight: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  moradia: {
    id: 'moradia',
    name: 'Moradia',
    icon: Home,
    color: '#8B5CF6',
    bgLight: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  lazer: {
    id: 'lazer',
    name: 'Lazer & Cultura',
    icon: Tv,
    color: '#EC4899',
    bgLight: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  saude: {
    id: 'saude',
    name: 'Saúde',
    icon: HeartPulse,
    color: '#06B6D4',
    bgLight: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  compras: {
    id: 'compras',
    name: 'Compras',
    icon: ShoppingBag,
    color: '#F97316',
    bgLight: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  salario: {
    id: 'salario',
    name: 'Salário & Renda',
    icon: Briefcase,
    color: '#10B981',
    bgLight: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  cafe: {
    id: 'cafe',
    name: 'Cafeteria & Lanches',
    icon: Coffee,
    color: '#A855F7',
    bgLight: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Salário Mensal',
    amount: 6850.00,
    type: 'receita',
    categoryId: 'salario',
    date: '2026-10-27',
    paymentMethod: 'Depósito em Conta',
    tag: 'Salário Fixo',
  },
  {
    id: 'tx-2',
    title: 'Supermercado Pão de Açúcar',
    amount: 432.80,
    type: 'despesa',
    categoryId: 'alimentacao',
    date: '2026-10-27',
    paymentMethod: 'Cartão de Crédito',
    tag: 'Supermercado',
  },
  {
    id: 'tx-3',
    title: 'Uber para o trabalho',
    amount: 34.50,
    type: 'despesa',
    categoryId: 'transporte',
    date: '2026-10-27',
    paymentMethod: 'Cartão de Crédito',
    tag: 'Corrida App',
  },
  {
    id: 'tx-4',
    title: 'Almoço no shopping',
    amount: 58.90,
    type: 'despesa',
    categoryId: 'alimentacao',
    date: '2026-10-26',
    paymentMethod: 'Vale Refeição',
    tag: 'Restaurante',
  },
  {
    id: 'tx-5',
    title: 'Aluguel do Apartamento',
    amount: 1850.00,
    type: 'despesa',
    categoryId: 'moradia',
    date: '2026-10-10',
    paymentMethod: 'Boleto Bancário',
    tag: 'Aluguel',
  },
  {
    id: 'tx-6',
    title: 'Ingressos Cinema IMAX',
    amount: 110.00,
    type: 'despesa',
    categoryId: 'lazer',
    date: '2026-10-18',
    paymentMethod: 'Cartão de Débito',
    tag: 'Cinema',
  },
];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [hideValues, setHideValues] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'all' | 'receita' | 'despesa'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeView, setActiveView] = useState<'dashboard' | 'ai_spec' | 'code'>('dashboard');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State para Nova Transação
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<TransactionType>('despesa');
  const [formCategory, setFormCategory] = useState<string>('alimentacao');
  const [formDate, setFormDate] = useState('2026-10-27');
  const [formMethod, setFormMethod] = useState('Cartão de Crédito');
  const [formTag, setFormTag] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // AI Categorizer State (in-modal)
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSuggestionMessage, setAiSuggestionMessage] = useState<string | null>(null);

  // Playground de Teste Rápido de IA na aba de especificações
  const [testDescription, setTestDescription] = useState('Uber para o trabalho');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  // Cálculos do Resumo Financeiro (Mês Atual)
  const financialSummary = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === 'receita') income += t.amount;
      else expense += t.amount;
    });

    return {
      income,
      expense,
      balance: income - expense,
      savingsRate: income > 0 ? (((income - expense) / income) * 100).toFixed(0) : '0',
    };
  }, [transactions]);

  // Modo de exibição das métricas no gráfico de área (Todos, Apenas Saldo, Fluxo)
  const [chartMetricView, setChartMetricView] = useState<'all' | 'saldo' | 'fluxo'>('all');

  // Cálculo da série temporal ao longo dos dias do mês atual (Outubro 2026)
  const timelineChartData = useMemo(() => {
    const days: Record<number, { day: string; fullDate: string; receitas: number; despesas: number }> = {};
    
    // Gerar dias do mês 01 a 27 (até hoje)
    for (let i = 1; i <= 27; i++) {
      const dayFormatted = i.toString().padStart(2, '0');
      days[i] = {
        day: `${dayFormatted}/10`,
        fullDate: `2026-10-${dayFormatted}`,
        receitas: 0,
        despesas: 0,
      };
    }

    // Distribuir transações registradas no mês atual
    transactions.forEach(t => {
      if (t.date && t.date.startsWith('2026-10')) {
        const parts = t.date.split('-');
        const dayNumber = parseInt(parts[2], 10);
        if (days[dayNumber]) {
          if (t.type === 'receita') {
            days[dayNumber].receitas += t.amount;
          } else {
            days[dayNumber].despesas += t.amount;
          }
        }
      }
    });

    // Calcular evolução progressiva do saldo acumulado
    let cumulative = 0;
    return Object.keys(days).map(d => {
      const dayNum = Number(d);
      const item = days[dayNum];
      cumulative += (item.receitas - item.despesas);
      return {
        day: item.day,
        fullDate: item.fullDate,
        receitas: item.receitas,
        despesas: item.despesas,
        saldo: cumulative,
      };
    });
  }, [transactions]);

  // Agrupamento por Categoria para Widget Complementar
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    let totalExpense = 0;

    transactions.filter(t => t.type === 'despesa').forEach(t => {
      stats[t.categoryId] = (stats[t.categoryId] || 0) + t.amount;
      totalExpense += t.amount;
    });

    return Object.entries(stats).map(([catId, amount]) => {
      const cat = CATEGORIES[catId] || {
        name: 'Outros',
        color: '#64748B',
        icon: ShoppingBag,
        bgLight: 'bg-slate-800 text-slate-300',
      };
      const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return {
        id: catId,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        amount,
        percentage: pct.toFixed(1),
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Filtragem de Transações
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.tag && t.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (CATEGORIES[t.categoryId]?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchQuery]);

  // Formatação de Moeda
  const formatMoney = (val: number) => {
    if (hideValues) return '••••••';
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ===========================================================================
  // DISPARO DA IA DO GEMINI PARA CLASSIFICAÇÃO AUTOMÁTICA
  // ===========================================================================
  const handleAiSuggestCategory = async (descriptionToAnalyze?: string) => {
    const text = descriptionToAnalyze || formTitle;
    if (!text.trim()) {
      setFormError('Digite uma descrição (ex: "Uber para o trabalho", "Almoço no shopping") para a IA analisar.');
      return;
    }

    setFormError(null);
    setIsAiLoading(true);
    setAiSuggestionMessage(null);

    try {
      const categoryNames = Object.values(CATEGORIES).map(c => c.name);
      const res = await fetch('/api/categorize-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: text.trim(),
          availableCategories: categoryNames,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Falha ao classificar com Gemini');
      }

      const { category, tag, type, reasoning } = json.data;

      // Localiza a chave da categoria correspondente
      const foundCategoryEntry = Object.entries(CATEGORIES).find(([_, c]) => {
        return c.name.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(c.name.toLowerCase());
      });

      if (foundCategoryEntry) {
        setFormCategory(foundCategoryEntry[0]);
      }

      if (tag) setFormTag(tag);
      if (type === 'receita' || type === 'despesa') setFormType(type);

      setAiSuggestionMessage(
        `Gemini: Sugerido "${category}" com a tag "${tag}" (${type === 'receita' ? 'Receita' : 'Despesa'}). ${reasoning || ''}`
      );
    } catch (err: any) {
      console.error(err);
      setFormError(`Aviso de IA: ${err.message || 'Erro de conexão com o Gemini'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Execução do Teste na Aba de Documentação
  const handleRunPlaygroundTest = async () => {
    if (!testDescription.trim()) return;
    setTestLoading(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await fetch('/api/categorize-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: testDescription.trim(),
          availableCategories: Object.values(CATEGORIES).map(c => c.name),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro na resposta do Gemini');
      }
      setTestResult(data.data);
    } catch (e: any) {
      setTestError(e.message || 'Falha na comunicação');
    } finally {
      setTestLoading(false);
    }
  };

  // Salvar Nova Transação
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Por favor, informe a descrição da transação.');
      return;
    }
    const parsed = parseFloat(formAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setFormError('Informe um valor válido e positivo.');
      return;
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: formTitle.trim(),
      amount: parsed,
      type: formType,
      categoryId: formCategory,
      date: formDate,
      paymentMethod: formMethod,
      tag: formTag.trim() || undefined,
    };

    setTransactions([newTx, ...transactions]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormTitle('');
    setFormAmount('');
    setFormType('despesa');
    setFormCategory('alimentacao');
    setFormDate('2026-10-27');
    setFormMethod('Cartão de Crédito');
    setFormTag('');
    setFormError(null);
    setAiSuggestionMessage(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col relative pb-24 md:pb-12">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">FinançasPRO</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles size={10} />
                  Gemini Powered
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Controle de Gastos com Categorização por IA</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setActiveView('ai_spec')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeView === 'ai_spec'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot size={13} />
                <span>Prompt & API Gemini</span>
              </button>

              <button
                onClick={() => setActiveView('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeView === 'code'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode size={13} />
                <span>Código Fonte</span>
              </button>
            </div>

            <button
              onClick={() => setHideValues(!hideValues)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            >
              {hideValues ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* =======================================================================
          VIEW 1: DASHBOARD INTERATIVO
      ======================================================================= */}
      {activeView === 'dashboard' && (
        <main className="max-w-6xl w-full mx-auto px-4 md:px-8 py-6 space-y-8 flex-1">
          {/* 1. Header de Boas-Vindas & Cards */}
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center font-bold text-lg text-emerald-400 shadow-inner">
                    IS
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    Olá, Isaac 👋
                  </h1>
                  <p className="text-xs text-slate-400">
                    Balanço financeiro inteligente de <span className="text-slate-200 font-medium">Outubro de 2026</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setFormTitle('Uber para o trabalho');
                    handleAiSuggestCategory('Uber para o trabalho');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 hover:bg-purple-500/20 transition-colors"
                >
                  <Sparkles size={13} className="text-purple-400" />
                  <span>Testar IA com "Uber"</span>
                </button>
              </div>
            </div>

            {/* Cards de Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              {/* Card Saldo */}
              <div className="relative overflow-hidden rounded-3xl p-5 md:p-6 bg-slate-900/90 border border-slate-800 shadow-xl group hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                    Saldo Total Líquido
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Wallet size={16} />
                  </div>
                </div>

                <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white mb-2">
                  {formatMoney(financialSummary.balance)}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium text-[11px] border border-emerald-500/20">
                    <TrendingUp size={12} />
                    Taxa de Poupança: {financialSummary.savingsRate}%
                  </span>
                  <span className="text-slate-500 text-[11px]">neste mês</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
              </div>

              {/* Card Receitas */}
              <div className="relative overflow-hidden rounded-3xl p-5 md:p-6 bg-slate-900/90 border border-slate-800/90 shadow-xl hover:border-emerald-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                    Receitas do Mês
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-emerald-400 mb-2">
                  + {formatMoney(financialSummary.income)}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{transactions.filter(t => t.type === 'receita').length} depósitos registrados</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
              </div>

              {/* Card Despesas */}
              <div className="relative overflow-hidden rounded-3xl p-5 md:p-6 bg-slate-900/90 border border-slate-800/90 shadow-xl hover:border-rose-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                    Despesas do Mês
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                    <ArrowDownRight size={18} />
                  </div>
                </div>

                <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-rose-400 mb-2">
                  - {formatMoney(financialSummary.expense)}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>{transactions.filter(t => t.type === 'despesa').length} pagamentos realizados</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
              </div>
            </div>
          </section>

          {/* ===================================================================
              SEÇÃO: GRÁFICO DE ÁREA (RECHARTS) - EVOLUÇÃO DIÁRIA DO MÊS ATUAL
          =================================================================== */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Activity size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Evolução Financeira Diária
                    </h3>
                    <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      Outubro 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Saldo acumulado, receitas e despesas distribuídas ao longo dos dias do mês
                  </p>
                </div>
              </div>

              {/* Controles de Visualização das Métricas */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
                <button
                  onClick={() => setChartMetricView('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    chartMetricView === 'all'
                      ? 'bg-slate-800 text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Visão Completa
                </button>
                <button
                  onClick={() => setChartMetricView('saldo')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    chartMetricView === 'saldo'
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Apenas Saldo
                </button>
                <button
                  onClick={() => setChartMetricView('fluxo')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    chartMetricView === 'fluxo'
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Receitas vs Despesas
                </button>
              </div>
            </div>

            {/* Container do Gráfico Recharts */}
            <div className="h-72 sm:h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    {/* Gradiente Saldo (Indigo / Azul) */}
                    <linearGradient id="gradientSaldo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>

                    {/* Gradiente Receitas (Esmeralda) */}
                    <linearGradient id="gradientReceitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>

                    {/* Gradiente Despesas (Rose / Vermelho Suave) */}
                    <linearGradient id="gradientDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  
                  <XAxis
                    dataKey="day"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    interval="preserveStartEnd"
                  />
                  
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => {
                      if (v >= 1000 || v <= -1000) return `R$ ${(v / 1000).toFixed(1)}k`;
                      return `R$ ${v}`;
                    }}
                  />
                  
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[210px]">
                            <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                              <span>Dia {label}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Outubro 2026</span>
                            </div>
                            <div className="space-y-1.5 font-mono text-[11px]">
                              <div className="flex items-center justify-between text-indigo-300">
                                <span className="flex items-center gap-1.5 font-sans font-medium text-slate-300">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                  Saldo Acumulado:
                                </span>
                                <span className="font-bold">
                                  R$ {data.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-emerald-400">
                                <span className="flex items-center gap-1.5 font-sans font-medium text-slate-300">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  Receitas do Dia:
                                </span>
                                <span>
                                  + R$ {data.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-rose-400">
                                <span className="flex items-center gap-1.5 font-sans font-medium text-slate-300">
                                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                                  Despesas do Dia:
                                </span>
                                <span>
                                  - R$ {data.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Áreas condicionais segundo o filtro selecionado */}
                  {(chartMetricView === 'all' || chartMetricView === 'saldo') && (
                    <Area
                      type="monotone"
                      dataKey="saldo"
                      name="Saldo Acumulado"
                      stroke="#6366F1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#gradientSaldo)"
                    />
                  )}

                  {(chartMetricView === 'all' || chartMetricView === 'fluxo') && (
                    <Area
                      type="monotone"
                      dataKey="receitas"
                      name="Receitas Diárias"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#gradientReceitas)"
                    />
                  )}

                  {(chartMetricView === 'all' || chartMetricView === 'fluxo') && (
                    <Area
                      type="monotone"
                      dataKey="despesas"
                      name="Despesas Diárias"
                      stroke="#F43F5E"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#gradientDespesas)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda Explicativa com Badges de Cores */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-1 text-xs text-slate-400 border-t border-slate-800/60 mt-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-xs" />
                <span className="text-slate-300 font-medium">Saldo Acumulado (R$)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                <span className="text-slate-300 font-medium">Receitas Diárias (+)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
                <span className="text-slate-300 font-medium">Despesas Diárias (-)</span>
              </div>
            </div>
          </section>

          {/* 2. Seção de Atividades Recentes com Tags e Categorias */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <section className="lg:col-span-8 space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                      <span>Atividades Recentes</span>
                      <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        {filteredTransactions.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Transações com ícones e tags categorizadas automaticamente pelo Gemini
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setFilterType('receita')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        filterType === 'receita' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Receitas
                    </button>
                    <button
                      onClick={() => setFilterType('despesa')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        filterType === 'despesa' ? 'bg-rose-500/20 text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Despesas
                    </button>
                  </div>
                </div>

                {/* Busca */}
                <div className="relative mb-4">
                  <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome, tag curta, mercado, uber..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Lista */}
                <div className="divide-y divide-slate-800/60">
                  {filteredTransactions.map(tx => {
                    const cat = CATEGORIES[tx.categoryId] || {
                      name: 'Outros',
                      icon: ShoppingBag,
                      color: '#64748B',
                      bgLight: 'bg-slate-800 text-slate-400 border-slate-700',
                    };
                    const IconComponent = cat.icon;
                    const isIncome = tx.type === 'receita';

                    return (
                      <div
                        key={tx.id}
                        className="py-3.5 px-2 -mx-2 rounded-2xl hover:bg-slate-800/30 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs transition-transform group-hover:scale-105 ${cat.bgLight}`}
                          >
                            <IconComponent size={20} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                                {tx.title}
                              </h4>
                              {tx.tag && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                                  <Tag size={10} className="text-emerald-400" />
                                  {tx.tag}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                              <span className="font-medium text-slate-300">{cat.name}</span>
                              <span>•</span>
                              <span className="text-[11px] text-slate-500">{tx.paymentMethod || 'Cartão'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <div className="text-right">
                            <div
                              className={`text-sm md:text-base font-bold font-mono tracking-tight ${
                                isIncome ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isIncome ? '+' : '-'} {formatMoney(tx.amount)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {tx.date}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all"
                            title="Remover transação"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Coluna Lateral: Categorias */}
            <aside className="lg:col-span-4 space-y-5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <PieChart size={16} className="text-emerald-400" />
                    <span>Gastos por Categoria</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Outubro</span>
                </div>

                <div className="space-y-4">
                  {categoryStats.map(cat => (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-medium text-slate-300">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-slate-200">{formatMoney(cat.amount)}</span>
                          <span className="text-slate-500 text-[10px] ml-1.5">({cat.percentage}%)</span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Banner IA Info */}
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/20 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                    <Bot size={15} />
                    <span>Classificador Inteligente Ativo</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Ao adicionar qualquer gasto, o Gemini identifica automaticamente a categoria ideal e gera uma tag curta em JSON padronizado.
                  </p>
                  <button
                    onClick={() => setActiveView('ai_spec')}
                    className="text-purple-300 hover:text-purple-200 text-[11px] font-semibold flex items-center gap-1 mt-1"
                  >
                    <span>Ver configuração e payload</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      )}

      {/* =======================================================================
          VIEW 2: ESPECIFICAÇÃO COMPLETA DA IA (PROMPT + PAYLOAD + CÓDIGO)
      ======================================================================= */}
      {activeView === 'ai_spec' && (
        <main className="max-w-6xl w-full mx-auto px-4 md:px-8 py-6 space-y-6 flex-1">
          {/* Header da Aba de IA */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Bot size={16} />
                <span>Google GenAI • Modelo gemini-3.8-flash</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Especificação da Integração com Gemini API
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Prompt de sistema, configuração de Structured Outputs (JSON Schema) e código completo para Node/TypeScript e Python.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Endpoint Ativo: /api/categorize-expense
              </span>
            </div>
          </div>

          {/* Playground Interativo ao Vivo */}
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={16} className="text-purple-400" />
                <span>Testador ao Vivo da Chamada à API</span>
              </h3>
              <span className="text-[11px] text-slate-400">Dispara uma requisição real para o Gemini</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={testDescription}
                onChange={e => setTestDescription(e.target.value)}
                placeholder="Ex: 'Uber para o trabalho', 'Almoço no shopping', 'Mensalidade da academia'..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleRunPlaygroundTest}
                disabled={testLoading}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer"
              >
                {testLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Consultando Gemini...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Enviar para a API</span>
                  </>
                )}
              </button>
            </div>

            {/* Chips de teste rápido */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 text-[11px]">Exemplos rápidos:</span>
              {[
                'Uber para o trabalho',
                'Almoço no shopping',
                'Mensalidade da academia',
                'Cinema e pipoca',
                'Depósito de salário',
              ].map(ex => (
                <button
                  key={ex}
                  onClick={() => {
                    setTestDescription(ex);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Resultado do Teste */}
            {testResult && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check size={14} />
                    Resposta JSON Estruturada Recebida com Sucesso:
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Confiança: {Math.round((testResult.confidence || 0.95) * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Categoria</span>
                    <div className="text-sm font-bold text-white mt-0.5">{testResult.category}</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Tag Curta</span>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{testResult.tag}</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Tipo Identificado</span>
                    <div className="text-sm font-bold text-indigo-300 mt-0.5 uppercase">{testResult.type}</div>
                  </div>
                </div>

                {testResult.reasoning && (
                  <p className="text-xs text-slate-400 italic">
                    Motivo: "{testResult.reasoning}"
                  </p>
                )}
              </div>
            )}

            {testError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {testError}
              </div>
            )}
          </div>

          {/* 1. Prompt de Sistema */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-300">
                1. Prompt de Sistema (System Instruction)
              </span>
              <button
                onClick={() => copyToClipboard(SYSTEM_PROMPT_TEXT, 'sys_prompt')}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                {copiedKey === 'sys_prompt' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copiar Prompt</span>
              </button>
            </div>
            <pre className="p-5 text-xs font-mono bg-slate-950 text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {SYSTEM_PROMPT_TEXT}
            </pre>
          </div>

          {/* 2. Código TypeScript (Backend Express com @google/genai) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-mono text-xs font-bold text-slate-300">
                  2. Implementação em TypeScript / Node.js (SDK @google/genai)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(TYPESCRIPT_GEMINI_CODE, 'ts_code')}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                {copiedKey === 'ts_code' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copiar TypeScript</span>
              </button>
            </div>
            <pre className="p-5 text-xs font-mono bg-slate-950 text-slate-300 overflow-x-auto leading-relaxed max-h-[500px]">
              {TYPESCRIPT_GEMINI_CODE}
            </pre>
          </div>

          {/* 3. Código Python (SDK google-genai) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-mono text-xs font-bold text-slate-300">
                  3. Implementação em Python (SDK google-genai)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(PYTHON_GEMINI_CODE, 'py_code')}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                {copiedKey === 'py_code' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copiar Python</span>
              </button>
            </div>
            <pre className="p-5 text-xs font-mono bg-slate-950 text-slate-300 overflow-x-auto leading-relaxed max-h-[500px]">
              {PYTHON_GEMINI_CODE}
            </pre>
          </div>
        </main>
      )}

      {/* =======================================================================
          VIEW 3: CÓDIGO FONTE REACT + TAILWIND
      ======================================================================= */}
      {activeView === 'code' && (
        <main className="max-w-6xl w-full mx-auto px-4 md:px-8 py-6 space-y-5 flex-1">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode size={18} className="text-blue-400" />
                Código Completo do Dashboard com Assistente IA
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Componente limpo em <strong>React + Tailwind CSS</strong> com chamada integrada ao backend Gemini.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(DASHBOARD_REACT_SOURCE_CODE, 'dashboard_code')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all self-start md:self-auto cursor-pointer"
            >
              {copiedKey === 'dashboard_code' ? (
                <>
                  <Check size={14} />
                  <span>Código Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-300">
                src/components/FinanceDashboardWithAI.tsx
              </span>
              <span className="text-[11px] text-slate-500 font-mono">React 19 + Tailwind v4</span>
            </div>
            <pre className="p-5 text-xs font-mono bg-slate-950 text-slate-300 overflow-x-auto leading-relaxed max-h-[640px]">
              {DASHBOARD_REACT_SOURCE_CODE}
            </pre>
          </div>
        </main>
      )}

      {/* =======================================================================
          BOTÃO FLUTUANTE (FAB)
      ======================================================================= */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setIsModalOpen(true);
            resetForm();
          }}
          className="group flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-full shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Adicionar Nova Transação"
        >
          <div className="w-6 h-6 rounded-full bg-slate-950/15 flex items-center justify-center">
            <Plus size={18} className="text-slate-950 transition-transform group-hover:rotate-90 duration-300" />
          </div>
          <span className="text-xs tracking-tight font-extrabold pr-1">Nova Transação</span>
        </button>
      </div>

      {/* =======================================================================
          MODAL COM ASSISTENTE INTELIGENTE GEMINI
      ======================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nova Transação</h3>
                  <p className="text-[11px] text-slate-400">Classificação com IA automática</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Alerta de Erro */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            {/* Notificação de Sugestão da IA */}
            {aiSuggestionMessage && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-start gap-2">
                <Sparkles size={15} className="text-purple-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{aiSuggestionMessage}</div>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
              {/* Seletor Tipo: Receita ou Despesa */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormType('despesa')}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formType === 'despesa'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowDownRight size={15} />
                  <span>Despesa (-)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormType('receita')}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formType === 'receita'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowUpRight size={15} />
                  <span>Receita (+)</span>
                </button>
              </div>

              {/* Input de Descrição com Botão de IA Embutido */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-medium">Descrição do Gasto</label>
                  <button
                    type="button"
                    onClick={() => handleAiSuggestCategory()}
                    disabled={isAiLoading}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/20 transition-all cursor-pointer"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 size={11} className="animate-spin" />
                        <span>Classificando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} />
                        <span>Sugerir com Gemini</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: 'Uber para o trabalho', 'Almoço no shopping'..."
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>

                {/* Chips de preenchimento rápido */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-500">Testar IA:</span>
                  {['Uber para o trabalho', 'Almoço no shopping', 'Supermercado Mensal'].map(chip => (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => {
                        setFormTitle(chip);
                        handleAiSuggestCategory(chip);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor e Tag Curta Gerada pela IA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    Tag Curta (IA)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Corrida App"
                    value={formTag}
                    onChange={e => setFormTag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Seleção de Categoria */}
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Categoria</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(CATEGORIES).map(cat => {
                    const CatIcon = cat.icon;
                    const isSelected = formCategory === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setFormCategory(cat.id)}
                        className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-purple-500 text-purple-400 shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <CatIcon size={18} />
                        <span className="text-[10px] font-medium truncate w-full text-center">
                          {cat.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data e Pagamento */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Data</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Forma de Pagamento</label>
                  <select
                    value={formMethod}
                    onChange={e => setFormMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Pix">Pix</option>
                    <option value="Vale Refeição">Vale Refeição</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>

              {/* Botões */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/30"
                >
                  Salvar Transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// CÓDIGOS E ESPECIFICAÇÕES PARA DOCUMENTAÇÃO E EXPORTAÇÃO
// =============================================================================

const SYSTEM_PROMPT_TEXT = `Você é um assistente especialista em organização de finanças pessoais e contabilidade doméstica.
Sua função é analisar a descrição de uma transação financeira inserida pelo usuário em linguagem natural (ex: "Uber para o trabalho", "Almoço no shopping", "Mensalidade da academia", "Salário da empresa") e classificá-la de forma precisa.

Diretrizes de Classificação:
1. Identifique a categoria mais adequada dentre as seguintes opções disponíveis:
   - Alimentação (supermercados, restaurantes, feiras, delivery)
   - Transporte (combustível, Uber/99, táxi, metrô, ônibus, pedágio, manutenção de carro)
   - Moradia (aluguel, condomínio, luz, água, internet, gás, reformas)
   - Lazer & Cultura (cinema, streaming, viagens, shows, jogos, livros)
   - Saúde (médicos, dentistas, exames, farmácia, academia)
   - Compras (roupas, eletrônicos, presentes, itens domésticos)
   - Salário & Renda (salários, comissões, freelas, dividendos)
   - Cafeteria & Lanches (cafés, padarias, sobremesas rápidas)
   - Outros (caso não se enquadre em nenhuma das anteriores)

2. Gere uma tag curta e direta (máximo 2 a 3 palavras) que resuma com clareza o item (ex: "Corrida Aplicativo", "Almoço Fora", "Assinatura Streaming", "Depósito Salarial").
3. Determine se a transação é 'despesa' ou 'receita'.
4. Retorne a resposta em formato JSON estritamente em conformidade com o schema fornecido.`;

const TYPESCRIPT_GEMINI_CODE = `/**
 * Servidor Backend: Categorização Inteligente com Gemini API
 * SDK Oficial: @google/genai (v2.4.0+)
 * Modelo: gemini-3.8-flash (Standard para tarefas de texto/JSON)
 */
import { GoogleGenAI, Type } from "@google/genai";
import express from "express";

const app = express();
app.use(express.json());

// 1. Inicialização do Cliente Gemini no Server-Side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 2. Rota de Categorização
app.post("/api/categorize-expense", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Descrição da transação é obrigatória." });
    }

    // 3. Chamada com System Instruction e Structured Outputs (JSON Schema)
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: \`Classifique a transação: "\${description.trim()}"\`,
      config: {
        systemInstruction: \`Você é um assistente financeiro especialista. Analise a transação do usuário e retorne a categoria mais adequada (ex: Transporte, Alimentação, Moradia, Lazer, Saúde, Salário), uma tag curta de até 3 palavras e se é 'despesa' ou 'receita'.\`,
        temperature: 0.1, // Determinístico e confiável
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "Categoria da transação (ex: Transporte, Alimentação, Lazer).",
            },
            tag: {
              type: Type.STRING,
              description: "Tag curta resumindo o item (ex: Corrida App, Almoço Fora).",
            },
            type: {
              type: Type.STRING,
              description: "Tipo de movimentação: 'despesa' ou 'receita'.",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Grau de certeza entre 0.0 e 1.0.",
            },
          },
          required: ["category", "tag", "type"],
        },
      },
    });

    // 4. Tratamento e parse seguro da resposta JSON
    const jsonStr = response.text?.trim() || "{}";
    const data = JSON.parse(jsonStr);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Erro na API Gemini:", error);
    return res.status(500).json({
      success: false,
      error: "Falha ao categorizar transação com IA.",
    });
  }
});
`;

const PYTHON_GEMINI_CODE = `"""
Módulo de Categorização Financeira Inteligente em Python
SDK Oficial: google-genai (v1.0+)
Modelo: gemini-3.8-flash
Instalação: pip install google-genai
"""

import os
import json
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# 1. Definição do Schema de Saída com Pydantic
class TransactionClassification(BaseModel):
    category: str = Field(description="Categoria mais adequada: Alimentação, Transporte, Moradia, Lazer, Saúde, Salário, etc.")
    tag: str = Field(description="Tag curta de no máximo 3 palavras (ex: 'Corrida App', 'Almoço Fora').")
    transaction_type: str = Field(description="Tipo de movimentação: 'despesa' ou 'receita'.")
    confidence: float = Field(description="Nível de certeza da classificação entre 0.0 e 1.0.")


# 2. Inicialização do Cliente Gemini
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))


def categorize_expense(description: str) -> dict:
    """
    Envia a descrição do gasto para o Gemini e retorna a categoria e tag em JSON.
    """
    system_instruction = (
        "Você é um assistente financeiro especialista em contabilidade pessoal. "
        "Analise a descrição informada pelo usuário e determine a categoria ideal, "
        "uma tag curta e o tipo ('despesa' ou 'receita')."
    )

    try:
        # 3. Chamada à API com Structured Outputs garantidos pelo Pydantic
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=f'Classifique a transação: "{description}"',
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,
                response_mime_type="application/json",
                response_schema=TransactionClassification,
            ),
        )

        # 4. Tratamento do JSON retornado
        result_json = response.text.strip()
        data = json.loads(result_json)
        return data

    except Exception as err:
        print(f"Erro ao chamar Gemini API: {err}")
        # Fallback seguro caso a API falhe
        return {
            "category": "Outros",
            "tag": "Geral",
            "transaction_type": "despesa",
            "confidence": 0.0
        }


# --- Exemplo de Execução ---
if __name__ == "__main__":
    exemplos = [
        "Uber para o trabalho",
        "Almoço no shopping",
        "Salário da empresa",
        "Ingresso do cinema",
    ]

    for item in exemplos:
        resultado = categorize_expense(item)
        print(f"Descrição: {item}")
        print(f" -> Categoria: {resultado.get('category')}")
        print(f" -> Tag:       {resultado.get('tag')}")
        print(f" -> Tipo:      {resultado.get('transaction_type')}")
        print("-" * 40)
`;

const DASHBOARD_REACT_SOURCE_CODE = `// Exemplo de chamada no Frontend (React):
const handleAiSuggest = async (description) => {
  const response = await fetch('/api/categorize-expense', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
  
  const { data } = await response.json();
  // data = { category: "Transporte", tag: "Corrida App", type: "despesa", confidence: 0.98 }
  setSelectedCategory(data.category);
  setTag(data.tag);
  setType(data.type);
};
`;
