import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { api } from "@/services/api";
import { useEffect, useState } from "react";

interface InventoryItem {
  product_id: number;
  name: string;
  category: string;
  quantity: number;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedBar, setSelectedBar] = useState<string>("1"); // 1 = Bar Grande, 2 = Bar Pequeno
  
  // Estados para o Modal de Movimentação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [moveType, setMoveType] = useState<string>("OUT");
  const [qty, setQty] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchInventory = async (barId: string) => {
    try {
      const response = await api.get(`/inventory/bar/${barId}`);
      setInventory(response.data);
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
    }
  };

  useEffect(() => {
    fetchInventory(selectedBar);
  }, [selectedBar]);

  const openMoveModal = (product: InventoryItem) => {
    setSelectedProduct(product);
    setMoveType("OUT");
    setQty("");
    setIsModalOpen(true);
  };

  const handleMoveStock = async () => {
    if (!selectedProduct || !qty || Number(qty) <= 0) return;
    
    setLoading(true);
    try {
      await api.post(`/inventory/bar/${selectedBar}/move`, {
        productId: selectedProduct.product_id,
        type: moveType,
        qty: Number(qty),
      });
      
      setIsModalOpen(false);
      fetchInventory(selectedBar); // Recarrega a tabela para atualizar a quantidade
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro ao movimentar estoque");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Controle de Estoque</h1>
        
        {/* Seletor de Bar */}
        <div className="w-64">
            <Select value={selectedBar} onValueChange={(val) => val && setSelectedBar(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o Bar" />
            </SelectTrigger>
            <SelectContent>
              {/* O db.js cria esses dois bares por padrão nos IDs 1 e 2 */}
              <SelectItem value="1">Bar Grande</SelectItem>
              <SelectItem value="2">Bar Pequeno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estoque Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.product_id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-center font-bold text-lg">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openMoveModal(item)}>
                      Movimentar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {inventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Nenhum produto encontrado neste bar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Movimentação */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movimentar: {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Movimentação</Label>
              <Select value={moveType} onValueChange={(val) => val && setMoveType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">Entrada (IN)</SelectItem>
                  <SelectItem value="OUT">Saída / Venda (OUT)</SelectItem>
                  <SelectItem value="LOSS">Perda / Quebra (LOSS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input 
                type="number" 
                min="1" 
                value={qty} 
                onChange={(e) => setQty(e.target.value)}
                placeholder="Ex: 5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleMoveStock} disabled={loading || !qty}>
              {loading ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}