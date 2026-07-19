import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { attributeApi } from "@/lib/api/attributeApi";
import type { AttributeValueResponse } from "@/types/attribute";
import { Plus, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ValueManagerProps {
    attributeId: string;
}

export function ValueManager({ attributeId }: ValueManagerProps) {
    const [values, setValues] = useState<AttributeValueResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newValue, setNewValue] = useState("");

    // Load values
    const loadValues = async () => {
        setIsLoading(true);
        try {
            const data = await attributeApi.getAttributeValues(attributeId);
            setValues(data);
        } catch (err) {
            console.error("Failed to load values", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadValues();
    }, [attributeId]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newValue.trim()) return;

        setIsCreating(true);
        try {
            await attributeApi.createAttributeValue(attributeId, {
                attributeId,
                value: newValue.trim(),
            });
            setNewValue("");
            await loadValues(); // Reload values
        } catch (err) {
            console.error("Failed to add value", err);
            alert("Failed to add value");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (valueId: string) => {
        if (!confirm("Remove this value?")) return;
        try {
            await attributeApi.deleteAttributeValue(valueId);
            await loadValues(); // Reload values
        } catch (err) {
            console.error("Failed to delete value", err);
            alert("Failed to delete value");
        }
    };

    if (isLoading) {
        return (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Loading values...
            </div>
        );
    }

    return (
        <div className="space-y-3 mt-4 pl-4 border-l-2 border-border/50">
            <div className="flex flex-wrap gap-2">
                {values.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">No values added yet.</span>
                ) : (
                    values.map(val => (
                        <Badge key={val.id} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1">
                            {val.value}
                            <button
                                onClick={() => handleDelete(val.id)}
                                className="hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-full p-0.5 transition-colors"
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))
                )}
            </div>

            <form onSubmit={handleAdd} className="flex gap-2 max-w-xs mt-2">
                <Input
                    size={1}
                    className="h-8 text-sm"
                    placeholder="New value (e.g. Red)"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    disabled={isCreating}
                />
                <Button type="submit" size="sm" variant="outline" className="h-8 px-2" disabled={!newValue.trim() || isCreating}>
                    {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add
                </Button>
            </form>
        </div>
    );
}
