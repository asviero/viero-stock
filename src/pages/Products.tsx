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
import { useEffect, useState } from "react";

// Definindo a interface baseada no seu model do banco de dados
interface Product {
  id: number;
  name: string;
  category: string;
  subcategory: string | null;
  price: number;
  cost_price: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      // Chama o getAllProducts do seu controller
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      // Chama o seedInitialProducts do seu controller
      await api.post("/products/seed");
      alert("Catálogo populado com sucesso!");
      fetchProducts(); // Recarrega a tabela
    } catch (error) {
      console.error("Erro ao rodar seed:", error);
      alert("Erro ao popular catálogo. Verifique se o usuário é ADMIN e está logado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Produtos</h1>
        <Button onClick={handleSeed} disabled={loading} variant="default">
          {loading ? "Populando..." : "Popular Sistema (Seed)"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Subcategoria</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Venda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhum produto cadastrado. Clique em "Popular Sistema" para iniciar.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>{product.subcategory || "-"}</TableCell>
                    <TableCell className="text-right">
                      R$ {product.cost_price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      R$ {product.price.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}