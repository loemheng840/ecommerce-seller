import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productApi } from "@/lib/api/productApi";
import type { ProductResponse as Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils";

interface InventoryUpdateModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function InventoryUpdateModal({ product, isOpen, onClose }: InventoryUpdateModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [quantity, setQuantity] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);

    useEffect(() => {
        if (product && isOpen) {
            setQuantity(product.quantity);
            setPrice(product.price);
        }
    }, [product, isOpen]);

    if (!isOpen || !product) return null;

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            await productApi.updateInventory(product.id, {
                quantity,
                price
            });
            onClose();
        } catch (error) {
            console.error("Failed to update inventory", error);
            // In a real app, you'd trigger a toast here
        } finally {
            setIsLoading(false);
        }
    };

    const adjustQty = (amount: number) => {
        setQuantity(prev => Math.max(0, prev + amount));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <CardHeader>
                    <CardTitle>Update Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="font-medium">{product.name}</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Current Quantity: {product.quantity}</Label>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                value={quantity} 
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-24"
                            />
                            <div className="flex flex-wrap gap-1">
                                <Button variant="outline" size="sm" onClick={() => adjustQty(-10)}>-10</Button>
                                <Button variant="outline" size="sm" onClick={() => adjustQty(-5)}>-5</Button>
                                <Button variant="outline" size="sm" onClick={() => adjustQty(5)}>+5</Button>
                                <Button variant="outline" size="sm" onClick={() => adjustQty(10)}>+10</Button>
                                <Button variant="outline" size="sm" onClick={() => adjustQty(50)}>+50</Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Current Price: {formatCurrency(product.price)}</Label>
                        <div className="flex gap-2 items-center">
                            <span className="text-muted-foreground">$</span>
                            <Input 
                                type="number" 
                                step="0.01"
                                value={price} 
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
