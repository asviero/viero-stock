import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  // Lê o localStorage e limpa aspas, espaços e falsos "undefined"
  const rawRole = localStorage.getItem("role");
  const userRole = (rawRole && rawRole !== "undefined" && rawRole !== "null" ? rawRole : "ADMIN")
    .replace(/['"]+/g, "") // Remove aspas caso o login tenha salvo via JSON.stringify
    .trim()
    .toUpperCase();

  const initialBar = userRole === "BAR_PEQUENO" ? "2" : "1";

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedBar, setSelectedBar] = useState<string>(initialBar);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  
  const [actionCategory, setActionCategory] = useState<"IN" | "SALE" | "OUT">("SALE");
  
  // Novos Estados
  const [isInitialStock, setIsInitialStock] = useState<boolean>(true);
  const [extraReason, setExtraReason] = useState<string>("");
  const [moveType, setMoveType] = useState<string>("");
  const [qty, setQty] = useState<string>("");
  const [observation, setObservation] = useState<string>("");
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

  const openModal = (product: InventoryItem, category: "IN" | "SALE" | "OUT") => {
    setSelectedProduct(product);
    setActionCategory(category);
    setQty("");
    setObservation("");
    
    // Reseta os estados baseados na ação
    if (category === "IN") {
      setIsInitialStock(true);
      setExtraReason("");
      setMoveType("IN_INITIAL");
    } else if (category === "SALE") {
      setMoveType("OUT"); // Venda continua sendo OUT padrão
    } else if (category === "OUT") {
      setMoveType(""); // Começa vazio para forçar a seleção
    }
    
    setIsModalOpen(true);
  };

  const handleMoveStock = async () => {
    // Validação extra antes de enviar
    if (actionCategory === "IN" && !isInitialStock && !extraReason) return;
    if (actionCategory === "OUT" && !moveType) return;
    if (!selectedProduct || !qty || Number(qty) <= 0) return;
    
    // Define o tipo final que vai pro banco
    let finalType = moveType;
    if (actionCategory === "IN") {
      finalType = isInitialStock ? "IN_INITIAL" : extraReason;
    }

    setLoading(true);
    try {
      await api.post(`/inventory/bar/${selectedBar}/move`, {
        productId: selectedProduct.product_id,
        type: finalType,
        qty: Number(qty),
        observation: observation || null, // <-- Alterado para enviar em todos os casos
      });
      
      setIsModalOpen(false);
      fetchInventory(selectedBar);
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro ao movimentar estoque");
    } finally {
      setLoading(false);
    }
  };

  // Verifica se o botão "Confirmar" deve ficar bloqueado
  const isSubmitDisabled = 
    loading || 
    !qty || 
    (actionCategory === "OUT" && !moveType) || 
    (actionCategory === "IN" && !isInitialStock && !extraReason);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Controle de Estoque</h1>
        
        <div className="w-64">
          <Select 
            value={selectedBar} 
            onValueChange={(val) => val && setSelectedBar(val)}
            disabled={userRole !== "ADMIN"}
          >
            <SelectTrigger>
              <SelectValue>
                {selectedBar === "1" ? "Bar Grande" : 
                 selectedBar === "2" ? "Bar Pequeno" : 
                 "Selecione o Bar"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
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
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => openModal(item, "IN")}>
                      Entrada
                    </Button>
                    <Button variant="default" size="sm" onClick={() => openModal(item, "SALE")}>
                      Venda
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openModal(item, "OUT")}>
                      Saída
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">
              {actionCategory === "IN" && `Adicionar — ${selectedProduct?.name}`}
              {actionCategory === "SALE" && `Vender — ${selectedProduct?.name}`}
              {actionCategory === "OUT" && `Enviar — ${selectedProduct?.name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            
            {/* 1. QUANTIDADE (Comum a todos e sempre no topo) */}
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input 
                type="number" 
                min="1" 
                value={qty} 
                onChange={(e) => setQty(e.target.value)}
              />
            </div>

            {/* 2. MOTIVO (Apenas para Saída/Enviar) */}
            {actionCategory === "OUT" && (
              <div className="space-y-2">
                <Label>Motivo</Label>
                <Select value={moveType} onValueChange={(val) => val && setMoveType(val)}>
                  <SelectTrigger>
                    <SelectValue>
                      {moveType === "OUT_DRINKS" ? "Drinks" :
                       moveType === "OUT_DOSES" ? "Doses" :
                       moveType === "OUT_VALES" ? "Vales" :
                       moveType === "LOSS" ? "Perdas" :
                       "Selecione o motivo..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OUT_DRINKS">Drinks</SelectItem>
                    <SelectItem value="OUT_DOSES">Doses</SelectItem>
                    <SelectItem value="OUT_VALES">Vales</SelectItem>
                    <SelectItem value="LOSS">Perdas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 3. OBSERVAÇÃO (Comum a todos) */}
            <div className="space-y-2">
              <Label>Observação (opcional)</Label>
              <Input 
                type="text" 
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
              />
            </div>

            {/* 4. CHECKBOX DE ESTOQUE INICIAL (Apenas para Entrada/Adicionar) */}
            {actionCategory === "IN" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="initialStock" 
                    checked={isInitialStock} 
                    onCheckedChange={(checked) => setIsInitialStock(checked as boolean)} 
                  />
                  <Label htmlFor="initialStock" className="cursor-pointer font-medium">
                    Definir como estoque inicial
                  </Label>
                </div>

                {!isInitialStock && (
                  <div className="space-y-2">
                    <Label>Origem do produto adicional</Label>
                    <Select value={extraReason} onValueChange={(val) => val && setExtraReason(val)}>
                      <SelectTrigger>
                        <SelectValue>
                          {extraReason === "IN_EXTRA_MAIN" ? "Do estoque principal" :
                           extraReason === "IN_EXTRA_BAR" ? "De outro bar" :
                           "Selecione a origem..."}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN_EXTRA_MAIN">Do estoque principal</SelectItem>
                        <SelectItem value="IN_EXTRA_BAR">De outro bar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleMoveStock} 
              disabled={isSubmitDisabled}
            >
              {loading ? "Salvando..." :
               actionCategory === "IN" ? "Adicionar" :
               actionCategory === "SALE" ? "Vender" : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}