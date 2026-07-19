'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { attributeApi } from '@/lib/api/attributeApi';
import {
    Trash2,
    Loader2,
    AlertCircle,
    Tags,
    X,
    Save,
    ChevronLeft,
} from 'lucide-react';
import type { AttributeResponse, AttributeValueResponse } from '@/types/attribute';

export default function AttributeManagePage() {
    // Attributes state
    const [attributes, setAttributes] = useState<AttributeResponse[]>([]);
    const [attributesLoading, setAttributesLoading] = useState(true);
    const [attributesError, setAttributesError] = useState<string | null>(null);

    // Attribute form state
    const [selectedAttribute, setSelectedAttribute] = useState<AttributeResponse | null>(null);
    const [attributeFormData, setAttributeFormData] = useState({
        name: '',
    });
    const [attributeSubmitting, setAttributeSubmitting] = useState(false);

    // Attribute Values state
    const [attributeValues, setAttributeValues] = useState<AttributeValueResponse[]>([]);
    const [attributeValuesLoading, setAttributeValuesLoading] = useState(false);
    const [valueFormData, setValueFormData] = useState({
        value: '',
    });
    const [valueSubmitting, setValueSubmitting] = useState(false);

    // Load attributes
    useEffect(() => {
        const loadAttributes = async () => {
            try {
                setAttributesLoading(true);
                const data = await attributeApi.getAllAttributes();
                setAttributes(data);
                setAttributesError(null);
            } catch (err: any) {
                setAttributesError(err.message || 'Failed to load attributes');
            } finally {
                setAttributesLoading(false);
            }
        };

        loadAttributes();
    }, []);

    // Load attribute values when an attribute is selected
    useEffect(() => {
        if (!selectedAttribute) {
            setAttributeValues([]);
            return;
        }

        const loadValues = async () => {
            try {
                setAttributeValuesLoading(true);
                const data = await attributeApi.getAttributeValues(selectedAttribute.id);
                setAttributeValues(data);
            } catch (err: any) {
                console.error('Failed to load attribute values:', err);
                setAttributeValues([]);
            } finally {
                setAttributeValuesLoading(false);
            }
        };

        loadValues();
    }, [selectedAttribute]);

    // Attribute handlers
    const handleEditAttribute = (attribute: AttributeResponse) => {
        setSelectedAttribute(attribute);
        setAttributeFormData({
            name: attribute.name,
        });
    };

    const handleClearAttribute = () => {
        setSelectedAttribute(null);
        setAttributeFormData({
            name: '',
        });
        setAttributeValues([]);
        setValueFormData({ value: '' });
    };

    const handleSaveAttribute = async () => {
        setAttributeSubmitting(true);
        try {
            if (selectedAttribute) {
                // Note: API might not support update, only create/delete
                alert('Attribute update not supported. Please delete and create new.');
            } else {
                await attributeApi.createAttribute(attributeFormData);
            }

            const data = await attributeApi.getAllAttributes();
            setAttributes(data);
            if (!selectedAttribute) {
                handleClearAttribute();
            }
        } catch (err: any) {
            alert(err.message || 'Failed to save attribute');
        } finally {
            setAttributeSubmitting(false);
        }
    };

    const handleDeleteAttribute = async (id: string) => {
        if (!confirm('Are you sure you want to delete this attribute? This will also delete all its values.')) return;

        try {
            await attributeApi.deleteAttribute(id);
            setAttributes(attributes.filter((a) => a.id !== id));
            if (selectedAttribute?.id === id) {
                handleClearAttribute();
            }
        } catch (err: any) {
            alert(err.message || 'Failed to delete attribute');
        }
    };

    const handleSaveAttributeValue = async () => {
        if (!selectedAttribute) {
            alert('Please select an attribute first');
            return;
        }

        setValueSubmitting(true);
        try {
            await attributeApi.createAttributeValue(selectedAttribute.id, {
                attributeId: selectedAttribute.id,
                value: valueFormData.value,
            });

            const data = await attributeApi.getAttributeValues(selectedAttribute.id);
            setAttributeValues(data);
            setValueFormData({ value: '' });
        } catch (err: any) {
            alert(err.message || 'Failed to save attribute value');
        } finally {
            setValueSubmitting(false);
        }
    };

    const handleDeleteAttributeValue = async (valueId: string) => {
        if (!confirm('Are you sure you want to delete this value?')) return;

        try {
            await attributeApi.deleteAttributeValue(valueId);
            setAttributeValues(attributeValues.filter((v) => v.id !== valueId));
        } catch (err: any) {
            alert(err.message || 'Failed to delete attribute value');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/products/create">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Attributes</h1>
                    <p className="text-muted-foreground mt-1">
                        Create attributes and manage their values
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
                {/* Attribute Form with Values */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>
                                    {selectedAttribute ? 'Manage Attribute & Values' : 'Create New Attribute'}
                                </CardTitle>
                                <CardDescription>
                                    {selectedAttribute
                                        ? `Managing: ${selectedAttribute.name}`
                                        : 'Create an attribute and add values to it'}
                                </CardDescription>
                            </div>
                            {selectedAttribute && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearAttribute}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Attribute Form */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="attr-name">Attribute Name *</Label>
                                <Input
                                    id="attr-name"
                                    value={attributeFormData.name}
                                    onChange={(e) =>
                                        setAttributeFormData({
                                            ...attributeFormData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Color, Size, Material"
                                    disabled={!!selectedAttribute}
                                />
                                {selectedAttribute && (
                                    <p className="text-xs text-muted-foreground">
                                        Attribute name cannot be edited. Create a new one instead.
                                    </p>
                                )}
                            </div>

                            {!selectedAttribute && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSaveAttribute}
                                        disabled={attributeSubmitting || !attributeFormData.name}
                                        className="flex-1"
                                    >
                                        {attributeSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Create Attribute
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Attribute Values Section */}
                        {selectedAttribute && (
                            <>
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-sm mb-3">Attribute Values</h4>

                                    {/* Add Value Form */}
                                    <div className="flex gap-2 mb-4">
                                        <Input
                                            value={valueFormData.value}
                                            onChange={(e) =>
                                                setValueFormData({ value: e.target.value })
                                            }
                                            placeholder="Enter value (e.g., Red, Large, Cotton)"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && valueFormData.value) {
                                                    handleSaveAttributeValue();
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={handleSaveAttributeValue}
                                            disabled={valueSubmitting || !valueFormData.value}
                                        >
                                            {valueSubmitting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                'Add'
                                            )}
                                        </Button>
                                    </div>

                                    {/* Values List */}
                                    {attributeValuesLoading ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : attributeValues.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No values yet. Add your first value above.
                                        </p>
                                    ) : (
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                            {attributeValues.map((value) => (
                                                <div
                                                    key={value.id}
                                                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                                                >
                                                    <span className="text-sm font-medium">{value.value}</span>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteAttributeValue(value.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Attributes List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Attributes</CardTitle>
                        <CardDescription>
                            {attributesLoading
                                ? 'Loading attributes...'
                                : `${attributes.length} attribute(s) found`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {attributesError && (
                            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
                                <AlertCircle className="h-4 w-4" />
                                {attributesError}
                            </div>
                        )}

                        {attributesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : attributes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Tags className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    No attributes yet. Create your first one!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2 scrollbar-hide">
                                {attributes.map((attribute) => (
                                    <div
                                        key={attribute.id}
                                        className={`group p-4 rounded-xl border transition-all cursor-pointer ${selectedAttribute?.id === attribute.id
                                            ? 'bg-primary/5 border-primary shadow-sm'
                                            : 'bg-muted/30 border-border hover:border-primary/50 hover:shadow-sm'
                                            }`}
                                        onClick={() => handleEditAttribute(attribute)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm">
                                                    {attribute.name}
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Click to manage values
                                                </p>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteAttribute(attribute.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
