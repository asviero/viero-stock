import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/services/api";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TopSeller {
  name: string;
  category: string;
  total_sold: number;
}

interface CriticalStock {
  name: string;
  bar_name: string;
  quantity: number;
  min_qty: number;
}

interface GeneralStock {
  product_id: number;
  name: string;
  category: string;
  total_quantity: number;
}

interface Financials {
  revenue: number;
  cost: number;
  cmv: number;
}

export default function Dashboard() {
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [criticalStock, setCriticalStock] = useState<CriticalStock[]>([]);
  const [generalStock, setGeneralStock] = useState<GeneralStock[]>([]);
  const [financials, setFinancials] = useState<Financials>({ revenue: 0, cost: 0, cmv: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sellersRes, criticalRes, generalRes, financialsRes] = await Promise.all([
          api.get("/dashboard/top-sellers"),
          api.get("/dashboard/critical"),
          api.get("/dashboard/general-stock"),
          api.get("/dashboard/financials")
        ]);

        setTopSellers(sellersRes.data);
        setCriticalStock(criticalRes.data);
        setGeneralStock(generalRes.data);
        setFinancials(financialsRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Função para exportar os dados para CSV (Abre no Excel)
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    // Pega as chaves (cabeçalhos) do primeiro objeto
    const headers = Object.keys(data[0]);
    
    // Monta as linhas separadas por vírgula
    const csvRows = data.map(row => {
      return headers.map(fieldName => {
        // Envolve o texto em aspas para evitar problemas com vírgulas internas
        return `"${row[fieldName] ?? ''}"`;
      }).join(',');
    });

    // Junta os cabeçalhos com as linhas
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Cria um arquivo temporário no navegador e força o download
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // \uFEFF força o formato UTF-8 no Excel
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando métricas...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>

      {/* CARDS FINANCEIROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento (Bruto)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(financials.revenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Custo das Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(financials.cost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CMV Global (Ideal: 25% a 30%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financials.cmv}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Mais Vendidos */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellers} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total_sold" fill="#aa3bff" radius={[4, 4, 0, 0]} name="Qtd. Vendida" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabela de Alertas de Estoque Crítico */}
        <Card className="col-span-1 border-destructive/50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-destructive flex items-center gap-2">
              ⚠️ Alertas de Estoque
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportToCSV(criticalStock, "estoque_critico")}
            >
              <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="overflow-auto h-[250px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead className="text-right">Atual / Mín.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criticalStock.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.bar_name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive" className="mr-2">{item.quantity}</Badge>
                        <span className="text-muted-foreground text-xs">/ {item.min_qty}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {criticalStock.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                        Nenhum alerta. Estoque saudável.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Estoque Geral Consolidado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Estoque Geral (Consolidado)</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => exportToCSV(generalStock, "estoque_geral")}
          >
            <Download className="w-4 h-4 mr-2" /> Exportar Planilha Excel
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Quantidade Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generalStock.map((item) => (
                <TableRow key={item.product_id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {item.total_quantity || 0}
                  </TableCell>
                </TableRow>
              ))}
              {generalStock.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Nenhum dado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}