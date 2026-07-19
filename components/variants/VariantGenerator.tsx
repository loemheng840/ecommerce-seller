import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { attributeApi } from "@/lib/api/attributeApi";
import { variantApi } from "@/lib/api/variantApi";
import { useEffect } from "react";
import type { AttributeResponse, AttributeValueResponse } from "@/types/attribute";
import { Loader2 } from "lucide-react";

// Simple checkbox implementation since we don't have a UI checkbox component
function Checkbox({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
    );
}

interface VariantGeneratorProps {
    productId: string;
    basePrice: number;
    baseSkuPrefix: string;
    onComplete: () => void;
    onCancel: () => void;
}

// A sub-component to load values for an attribute
function AttributeSelector({
    attributeId,
    name,
    selectedValues,
    onToggle
}: {
    attributeId: string,
    name: string,
    selectedValues: string[],
    onToggle: (valId: string, valName: string, checked: boolean) => void
}) {
    const [values, setValues] = useState<AttributeValueResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        attributeApi.getAttributeValues(attributeId).then(data => {
            setValues(data);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [attributeId]);

    if (isLoading) return <div className="text-sm text-muted-foreground"><Loader2 className="size-3 animate-spin inline mr-2" />Loading {name}...</div>;
    if (!values || values.length === 0) return null;

    return (
        <div className="border rounded p-3 bg-muted/10">
            <h4 className="font-medium text-sm mb-2">{name}</h4>
            <div className="flex flex-wrap gap-4">
                {values.map(val => (
                    <label key={val.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                        <Checkbox
                            checked={selectedValues.includes(val.id)}
                            onCheckedChange={(checked) => onToggle(val.id, val.value, checked as boolean)}
                        />
                        <span>{val.value}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

// Cartesian product utility
function cartesianProduct<T>(arrays: T[][]): T[][] {
    return arrays.reduce<T[][]>((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]]);
}

export function VariantGenerator({ productId, basePrice, baseSkuPrefix, onComplete, onCancel }: VariantGeneratorProps) {
    const [attributes, setAttributes] = useState<AttributeResponse[]>([]);
    const [loadingAttrs, setLoadingAttrs] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        attributeApi.getAllAttributes().then(data => {
            setAttributes(data);
        }).finally(() => {
            setLoadingAttrs(false);
        });
    }, []);

    // Map of attributeId -> selected value IDs
    const [selectedSelections, setSelectedSelections] = useState<Record<string, { id: string, name: string }[]>>({});

    const [price, setPrice] = useState<number>(basePrice);
    const [skuPrefix, setSkuPrefix] = useState<string>(baseSkuPrefix);

    const handleToggle = (attrId: string, valId: string, valName: string, checked: boolean) => {
        setSelectedSelections(prev => {
            const currentList = prev[attrId] || [];
            if (checked) {
                return { ...prev, [attrId]: [...currentList, { id: valId, name: valName }] };
            } else {
                return { ...prev, [attrId]: currentList.filter(item => item.id !== valId) };
            }
        });
    };

    // Calculate combinations
    const combinations = useMemo(() => {
        const activeArrays = Object.values(selectedSelections).filter(arr => arr.length > 0);
        if (activeArrays.length === 0) return [];
        return cartesianProduct(activeArrays);
    }, [selectedSelections]);

    const handleGenerate = async () => {
        if (combinations.length === 0) return;

        setIsCreating(true);
        for (const combo of combinations) {
            // Generate SKU part from names, e.g. -BLK-256
            const skuSuffix = combo.map(c => c.name.substring(0, 3).toUpperCase()).join('-');
            const sku = `${skuPrefix}-${skuSuffix}`;

            try {
                await variantApi.createVariant(productId, {
                    productId,
                    sku,
                    price,
                    status: true,
                    attributeValueIds: combo.map(c => c.id)
                });
            } catch (err) {
                console.error("Failed to create variant", err);
            }
        }
        setIsCreating(false);

        onComplete();
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-medium text-lg">Select Attributes to Combine</h3>
                <p className="text-sm text-muted-foreground">Select the values you want to generate variants for.</p>
            </div>

            {loadingAttrs ? (
                <div className="flex justify-center p-4"><Loader2 className="size-6 animate-spin" /></div>
            ) : (
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                    {attributes?.map(attr => (
                        <AttributeSelector
                            key={attr.id}
                            attributeId={attr.id}
                            name={attr.name}
                            selectedValues={(selectedSelections[attr.id] || []).map(s => s.id)}
                            onToggle={(valId, valName, checked) => handleToggle(attr.id, valId, valName, checked)}
                        />
                    ))}
                </div>
            )}

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="font-semibold mb-2">Generation Settings</div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Base Price</Label>
                        <Input type="number" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                        <Label>SKU Prefix</Label>
                        <Input value={skuPrefix} onChange={e => setSkuPrefix(e.target.value)} />
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t text-sm font-medium">
                    This will create <span className="text-primary">{combinations.length}</span> variants.
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancel} disabled={isCreating}>Cancel</Button>
                <Button onClick={handleGenerate} disabled={combinations.length === 0 || isCreating}>
                    {isCreating ? <><Loader2 className="size-4 animate-spin mr-2" /> Generating...</> : `Generate ${combinations.length} Variants`}
                </Button>
            </div>
        </div>
    );
}
