import React, {useState, useEffect} from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    Box,
    Alert
} from "@mui/material";
import {AdminPriceDto} from "../../dto/admin-price-dto";

interface PriceFormProps {
    open: boolean;
    editingPrice: AdminPriceDto | null;
    onClose: () => void;
    onSubmit: (price: { name: string; acPrice?: number; dcPrice?: number }) => void;
    isLoading?: boolean;
    error?: string;
}

export default function PriceForm({
    open,
    editingPrice,
    onClose,
    onSubmit,
    isLoading = false,
    error = ''
}: PriceFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        acPrice: "",
        dcPrice: ""
    });

    const [validationErrors, setValidationErrors] = useState({
        name: '',
        acPrice: '',
        dcPrice: ''
    });

    useEffect(() => {
        if (editingPrice) {
            setFormData({
                name: editingPrice.name,
                acPrice: editingPrice.ac_price?.toString() || "",
                dcPrice: editingPrice.dc_price?.toString() || ""
            });
        } else {
            setFormData({
                name: "",
                acPrice: "",
                dcPrice: ""
            });
        }
        setValidationErrors({ name: '', acPrice: '', dcPrice: '' });
    }, [editingPrice, open]);

    const validateForm = () => {
        const errors = {
            name: '',
            acPrice: '',
            dcPrice: ''
        };

        if (!formData.name.trim()) {
            errors.name = "Firma adı gereklidir";
        }

        if (formData.acPrice && (isNaN(parseFloat(formData.acPrice)) || parseFloat(formData.acPrice) < 0)) {
            errors.acPrice = "AC fiyatı geçerli bir pozitif sayı olmalıdır";
        }

        if (formData.dcPrice && (isNaN(parseFloat(formData.dcPrice)) || parseFloat(formData.dcPrice) < 0)) {
            errors.dcPrice = "DC fiyatı geçerli bir pozitif sayı olmalıdır";
        }

        setValidationErrors(errors);
        return !errors.name && !errors.acPrice && !errors.dcPrice;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        const submitData = {
            name: formData.name.trim(),
            acPrice: formData.acPrice ? parseFloat(formData.acPrice) : undefined,
            dcPrice: formData.dcPrice ? parseFloat(formData.dcPrice) : undefined
        };

        onSubmit(submitData);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {editingPrice ? "Fiyat Güncelle" : "Yeni Fiyat Ekle"}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 1}}>
                    <TextField
                        label="Firma Adı"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                        onKeyPress={handleKeyPress}
                        error={!!validationErrors.name}
                        helperText={validationErrors.name}
                        disabled={isLoading}
                        fullWidth
                        required
                    />

                    <TextField
                        label="AC Fiyat (₺)"
                        type="number"
                        value={formData.acPrice}
                        onChange={(e) => setFormData(prev => ({...prev, acPrice: e.target.value}))}
                        onKeyPress={handleKeyPress}
                        error={!!validationErrors.acPrice}
                        helperText={validationErrors.acPrice}
                        disabled={isLoading}
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                    />

                    <TextField
                        label="DC Fiyat (₺)"
                        type="number"
                        value={formData.dcPrice}
                        onChange={(e) => setFormData(prev => ({...prev, dcPrice: e.target.value}))}
                        onKeyPress={handleKeyPress}
                        error={!!validationErrors.dcPrice}
                        helperText={validationErrors.dcPrice}
                        disabled={isLoading}
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isLoading}>
                    İptal
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
                    {editingPrice ? "Güncelle" : "Ekle"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}